var ring = require("ring");
var _ = require("underscore");
var async = require("async");
var jf = require('jsonfile');
var sys = require('sys');
var exec = require('child_process').exec;
var glob = require("glob");
var fs = require("fs-extra");

var commandFactoryClass = require("sailfish/command/command_factory");
var environmentBuilderClass = require("sailfish/builder/environment_builder");

var builderClass = ring.create({

    constructor: function(container, buildConfiguration) {
        this.container = container;
        this.buildConfiguration = buildConfiguration;
        this.finalReport = {};

        //Needed dependencies
        this.commandFactory = new commandFactoryClass(container);
    },

    /**
     * Pulls the code, creating the workspace and cloning
     * the repository
     */
    prepare: function(return_callback) {
        var self = this;

        self.commandFactory.createWorkspace(self.buildConfiguration["buildId"], function() {
            self.commandFactory.pullRepositoryCode(self.buildConfiguration, function() {
                self.commandFactory.exportTracker(self.buildConfiguration["buildId"], function() {
                    return_callback();
                });
            });
        });
    },

    prepareToGitInfo: function(callback) {
        var self = this;

        self.commandFactory.createWorkspace(self.buildConfiguration["buildId"], function() {
            self.commandFactory.pullRepositoryCode(self.buildConfiguration, function() {
                var prjRoot = self.container.getParameter("workspace_root")+"/"+self.buildConfiguration["buildId"];

                callback(
                    jf.readFileSync(prjRoot+"/sailfish_branches.json"),
                    jf.readFileSync(prjRoot+"/sailfish_commits.json")
                );
            }, "", "light");
        });
    },

    readXunitReports: function(buildId, xunitFiles, return_callback) {

        var self = this;
        var fileNames = [];

        if(_.isEmpty(xunitFiles)) {
            return_callback(null);
        } else {

            var readXunitArray = [];

            _.each(xunitFiles, function(xunitFilePattern) {

                var fullXunitFilePattern = self.container.getParameter("workspace_root")+"/"+buildId+"/frame/"+xunitFilePattern;

                readXunitArray.push(function(callback){
                    glob(fullXunitFilePattern, {}, function (er, files) {
                        if(_.isArray(files)) {
                            fileNames = _.union(fileNames, files);
                        }

                        callback(null, true);
                    })
                });
            });

            var filesToReadArray = [];
            var parseString = require('xml2js').parseString;


            //Executing
            async.series(readXunitArray, function(err, results){

                _.each(fileNames, function(fileName) {
                    filesToReadArray.push(function(callback){
                        var xml = fs.readFileSync(fileName, 'utf8');
                        parseString(xml, function (err, result) {
                            callback(null, result);
                        });
                    });
                });

                async.series(filesToReadArray, function(err, xmlArray) {
                    return_callback(xmlArray);
                });
            });

        }
    },

    run: function(return_callback) {
        var self = this;
        var buildId = self.buildConfiguration["buildId"];

        self.commandFactory.readSailfishConfiguration(buildId, function(sailfishConfiguration) {

            self.sailfishConfiguration = sailfishConfiguration; //Storing sailfish configuration on builder
            var suites = sailfishConfiguration["suites"];
            var suiteKeys = _.keys(sailfishConfiguration["suites"]);

            var runSuitesArray = [];

            _.each(suiteKeys, function(suiteKey) {
                runSuitesArray.push(function(callback) {
                    self.container.get("logger").info("Preparing environment for suite on build", {"suite": suiteKey, "build": buildId});
                    var environmentBuilder = new environmentBuilderClass(
                        self.container,
                        self.buildConfiguration,
                        suiteKey,
                        sailfishConfiguration["suites"][suiteKey]
                    );

                    environmentBuilder.up(function() {

                        //Creating JSON for tracker
                        var trackerJson = {"provision":[],"commands":[],"beforeClose":[]};

                        //Adding provision first
                        if(_.has(sailfishConfiguration["suites"][suiteKey], "provision")) {
                            _.each(sailfishConfiguration["suites"][suiteKey]["provision"], function(provCmd) {
                                trackerJson["provision"].push(provCmd);
                            })
                        }

                        //Adding last command (defined on configuration)
                        trackerJson["commands"].push(sailfishConfiguration["suites"][suiteKey]["command"]);

                        var inputFilePath = self.container.getParameter("workspace_root")+"/"+buildId+"/frame/tracker_input.json";
                        jf.writeFileSync(inputFilePath, trackerJson);

                        //Run the tests and return to callback
                        var testCommand = "docker exec "+buildId+"_"+suiteKey;
                        testCommand += ' node tracker.js --input=/workspace/tracker_input.json --output=/workspace/tracker_output.json';
                        var runTests = exec(testCommand, function(error, stderr, stdout) {

                            //Read the result JSON
                            var buildReport = jf.readFileSync(self.container.getParameter("workspace_root")+"/"+buildId+"/frame/tracker_output.json");

                            //Read XUNIT if defined on the configuration
                            var xunitFiles = null;
                            if(_.has(sailfishConfiguration["suites"][suiteKey], "xunit")) {
                                var xunitFiles = sailfishConfiguration["suites"][suiteKey]["xunit"];
                            }
                            self.readXunitReports(buildId, xunitFiles, function(xunitReport) {

                                self.finalReport[suiteKey] = {
                                    "build": buildReport,
                                    "xunit": xunitReport
                                }

                                environmentBuilder.kill(function() {
                                    callback(null, true);
                                });

                            });


                        });

                    });
                });
            });

            //Executing
            async.series(runSuitesArray, function(err, results){
                return_callback(self.finalReport);
            });

        });
    }

});

module.exports = function(container, buildConfiguration) {
    return new builderClass(container, buildConfiguration);
}