var _ = require("lodash"),
    async = require("async"),
    jf = require('jsonfile'),
    sys = require('sys'),
    exec = require('child_process').exec,
    glob = require("glob"),
    fs = require("fs-extra"),
    Mustache = require("mustache"),
    chokidar = require('chokidar'),
    commandFactoryClass = require("sailfish/command/command_factory"),
    gitStepEmitterClass = require('sailfish/socket.io/server/git_step'),
    gitBuildLogEmitterClass = require('sailfish/socket.io/server/build_log'),
    environmentBuilderClass = require("sailfish/builder/environment_builder");

var builderClass = function(container, buildConfiguration) {

    this.finalReport = {};
    this.commandFactory = new commandFactoryClass(container);

    /**
     * Pulls the code, creating the workspace and cloning
     * the repository
     */
    this.prepare = function(return_callback) {
        var commandFactory = this.commandFactory;

        commandFactory.createWorkspace(buildConfiguration.buildId, function() {
            commandFactory.pullRepositoryCode(buildConfiguration, function() {
                commandFactory.exportTracker(buildConfiguration.buildId, function() {
                    return_callback();
                });
            });
        });
    };

    /**
     * Sets up a container to pull the code and read the branches and latest commits
     * Returns this information to the callback
     *
     * Steps:
     * - Create the temporary workspace directory
     * - Pull the repository code and fetch the branches and commits of the repository (stores the result on json)
     * - Read the JSON and report the callback
     *
     * @param callback
     */
    this.prepareToGitInfo = function(callback) {
        var commandFactory = this.commandFactory,
            emitter = new gitStepEmitterClass(),
            socketTransport = container.get("io.server").io;

        commandFactory.createWorkspace(buildConfiguration.buildId, function() {

            //Reporting the workspace is created
            emitter.emit(socketTransport, _.extend(buildConfiguration, {step: "workspace-created"}));

            commandFactory.pullRepositoryCode(buildConfiguration, function() {

                emitter.emit(socketTransport, _.extend(buildConfiguration, {step: "code-pulled"}));

                var prjRoot = container.getParameter("workspace_root")+"/"+buildConfiguration.buildId;

                callback(
                    jf.readFileSync(prjRoot+"/sailfish_branches.json"),
                    jf.readFileSync(prjRoot+"/sailfish_commits.json")
                );

                emitter.emit(socketTransport, _.extend(buildConfiguration, {step: "report-sent"}));
            }, "", "light");
        });
    };

    /**
     * Read xunit files and parse the results as JSON
     *
     * @param buildId
     * @param xunitFiles
     * @param return_callback
     */
    this.readXunitReports = function(buildId, xunitFiles, return_callback) {

        var fileNames = [];

        if(_.isEmpty(xunitFiles)) {
            return_callback(null);
        } else {

            var readXunitArray = [];

            xunitFiles.forEach(function(xunitFilePattern) {

                var fullXunitFilePattern = container.getParameter("workspace_root")+"/"+buildId+"/frame/"+xunitFilePattern;

                readXunitArray.push(function(callback){
                    glob(fullXunitFilePattern, {}, function (er, files) {
                        if(_.isArray(files)) {
                            fileNames = _.union(fileNames, files);
                        }

                        callback(null, true);
                    });
                });
            }, this);

            var filesToReadArray = [];
            var parseString = require('xml2js').parseString;


            //Executing
            async.series(readXunitArray, function(err, results){

                fileNames.forEach(function(fileName) {
                    filesToReadArray.push(function(callback){
                        var xml = fs.readFileSync(fileName, 'utf8');
                        parseString(xml, function (err, result) {
                            callback(null, result);
                        });
                    });
                }, this);

                async.series(filesToReadArray, function(err, xmlArray) {
                    return_callback(xmlArray); //FIXME: Add error, and control error
                });
            });

        }
    };

    this.run = function(return_callback) {
        var self = this;
        var buildId = buildConfiguration.buildId;

        self.commandFactory.readSailfishConfiguration(buildId, function(sailfishConfiguration) {

            self.sailfishConfiguration = sailfishConfiguration; //Storing sailfish configuration on builder
            var suites = sailfishConfiguration.suites;
            var suiteKeys = _.keys(sailfishConfiguration.suites);

            var runSuitesArray = [];

            suiteKeys.forEach(function(suiteKey) {
                runSuitesArray.push(function(callback) {

                    var environmentBuilder = new environmentBuilderClass(
                        container,
                        buildConfiguration,
                        suiteKey,
                        sailfishConfiguration.suites[suiteKey]
                    );

                    environmentBuilder.up(function() {

                        //Creating JSON for tracker
                        var trackerJson = {"provision":[],"commands":[],"beforeClose":[]};

                        //Adding provision first
                        if(_.has(sailfishConfiguration.suites[suiteKey], "provision")) {
                            _.each(sailfishConfiguration.suites[suiteKey].provision, function(provCmd) {
                                trackerJson.provision.push(provCmd);
                            });
                        }

                        //Adding last command (defined on configuration)
                        trackerJson.commands.push(sailfishConfiguration.suites[suiteKey].command);

                        var inputFilePath = container.getParameter("workspace_root")+"/"+buildId+"/frame/tracker_input.json";
                        var outputFilePath = container.getParameter("workspace_root")+"/"+buildId+"/frame/tracker_output.json";
                        var logFilePath = container.getParameter("workspace_root")+"/"+buildId+"/frame/tracker.log";

                        jf.writeFileSync(inputFilePath, trackerJson);

                        //Run the tests and return to callback
                        var cmdTpl = 'docker exec {{&buildId}}_{{&suiteKey}} node tracker.js --input={{&input}} --output={{&output}} --log={{&log}}';

                        //Create log file and start watching it
                        var touchCmdTpl = 'touch {{&logFile}} && chmod 777 {{&logFile}}',
                            touchCmd = Mustache.render(touchCmdTpl, {logFile:logFilePath});

                        var touchLogFile = exec(touchCmd, function(touchError, touchStderr, touchStdout) {

                            //Watch the file
                            var watcher = chokidar.watch(logFilePath, {
                                persistent: true
                            });
                            //Broadcast to socket.io when changes detected on file
                            var emitterBuildLog = new gitBuildLogEmitterClass(),
                                socketTransport = container.get("io.server").io;

                            watcher.on("change", function(path, stats) {
                                fs.readFile(logFilePath, function(err, data) {
                                    var fileDataTempEncoded = data.toString("base64");
                                    emitterBuildLog.emit(socketTransport, _.extend(buildConfiguration, {output:fileDataTempEncoded}));
                                });
                            });

                            var testCommand = Mustache.render(cmdTpl, {
                                buildId: buildId,
                                suiteKey: suiteKey,
                                input: "/workspace/tracker_input.json",
                                output: "/workspace/tracker_output.json",
                                log: '/workspace/tracker.log'
                            });

                            var runTests = exec(testCommand, function(error, stderr, stdout) {

                                //Read the result JSON
                                var buildReport = jf.readFileSync(outputFilePath);

                                //Read XUNIT if defined on the configuration
                                var xunitFiles = null;
                                if(_.has(sailfishConfiguration.suites[suiteKey], "xunit")) {
                                    xunitFiles = sailfishConfiguration.suites[suiteKey].xunit;
                                }
                                self.readXunitReports(buildId, xunitFiles, function(xunitReport) {

                                    self.finalReport[suiteKey] = {
                                        "build": buildReport,
                                        "xunit": xunitReport
                                    };

                                    environmentBuilder.kill(function() {
                                        watcher.close();//Ending watching log file
                                        callback(null, true);
                                    });

                                });


                            });//<-- end runTests

                        });//<-- end touch log file

                    });//<-- end up environment

                });

            });

            //Executing
            async.series(runSuitesArray, function(err, results){
                return_callback(self.finalReport);
            });

        });
    };

};

module.exports = function(container, buildConfiguration) {
    return new builderClass(container, buildConfiguration);
};