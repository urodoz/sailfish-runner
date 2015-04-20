var _ = require("lodash"),
    sys = require('sys'),
    exec = require('child_process').exec,
    dockerComm = require("docker-command-builder"),
    async = require("async");

var environmentBuilder = function(container, buildConfiguration, suite, suiteSailfishConfiguration) {

    this.container = container;
    this.suite = suite;
    this.suiteSailfishConfiguration = suiteSailfishConfiguration;
    this.buildConfiguration = buildConfiguration;
    this.links = [];
    this.containersUp = [];

    this.up = function(callback_return) {

        var self = this;

        var mainConstructor = function() {
            var workspaceFolder = container.getParameter("workspace_root")+'/'+buildConfiguration.buildId+"/frame";

            //Services up
            var dcks = self.calculateDockerCommand(
                buildConfiguration.buildId+"_"+self.suite,
                suiteSailfishConfiguration,
                self.links,
                [workspaceFolder+':/workspace:rw']
            );

            //Series command
            var seriesCommands = [];
            dcks.forEach(function(dck) {
                seriesCommands.push(function(innerCallback) {
                    exec(dck, function(error, stdout, stderr) {
                        innerCallback(error, true);
                        //TODO: Return error and control error
                    });
                });
            });

            async.series(seriesCommands, callback_return);
        };

        //Up services | extra containers
        if(_.has(suiteSailfishConfiguration, "containers") && !_.isEmpty(suiteSailfishConfiguration.containers)) {
            this._upServices(suiteSailfishConfiguration.containers, function() {
                mainConstructor();
            });
        } else {
            mainConstructor();
        }

    };

    this.calculateDockerCommand = function(name, containerConfiguration, links, mount_points) {
        if(_.isUndefined(links)) links = [];
        if(_.isUndefined(mount_points)) mount_points = [];

        var runnerBuilder = dockerComm("runner");

        runnerBuilder.setName(name)
            .setDaemon(true)
            .setImage(containerConfiguration.image);

        //Adding links
        links.forEach(function(linkDef) {
            runnerBuilder._addLink(linkDef);
        });

        //Environment definition
        if(_.has(containerConfiguration, "environment") && !_.isEmpty(containerConfiguration.environment)) {
            containerConfiguration.environment.forEach(function(envDef) {
                var environmentDefSplit = envDef.split("=");
                runnerBuilder.addEnvironmentVariable(environmentDefSplit[0], environmentDefSplit[1]);
            });
        }

        //mount points
        mount_points.forEach(function(mPointDef) {
            var mountPointDefSplit = mPointDef.split(":");
            runnerBuilder.addVolume(mountPointDefSplit[0], mountPointDefSplit[1], "rw");
        });

        return runnerBuilder.make();
    };

    this._upServices = function(containersConfiguration, return_callback) {
        var serviceKeys = _.keys(containersConfiguration);
        var self = this;
        //TODO: Calculate resolv order

        //Generating the array of commands to execute as serial
        var serviceArray = [];
        _.each(serviceKeys, function(serviceKey) {
            serviceArray.push(function(callback) {

                var serviceName = self.buildConfiguration.buildId+"_"+self.suite+"_"+serviceKey;
                self.links.push(serviceName+':'+serviceKey); //Adding link to main container

                //Calculating the docker command
                var dockerCommands = self.calculateDockerCommand(serviceName, containersConfiguration[serviceKey], []);

                /*
                 * Execute all the commands of docker preparation in
                 * async.waterfall method
                 */
                var seriesCommands = [];

                dockerCommands.forEach(function(dockerCommand) {
                    seriesCommands.push(function(innerCallback) {
                        exec(dockerCommand, function(error, stdout, stderr) {
                            innerCallback(error, true);
                        });
                    });
                });

                async.series(seriesCommands, callback);

            });
        });

        //Executing
        async.series(serviceArray, function(err, results) {
            return_callback();
        });
    };

    this.kill = function(callback_return) {
        var buildId = this.buildConfiguration.buildId,
            suite = this.suite,
            upContainers = [buildId+"_"+suite];

        //Adding extra containers
        if(_.has(this.suiteSailfishConfiguration, "containers")) {
            var serviceKeys = _.keys(this.suiteSailfishConfiguration.containers);
            serviceKeys.forEach(function(sKey) {
                upContainers.push(buildId+"_"+suite+"_"+sKey);
            });
        }

        //Kill all
        //TODO : Parallelize
        var killArray = [];

        upContainers.forEach(function(containerName) {
            killArray.push(function(callback){
                var child = exec("docker stop "+containerName+" && docker rm -v "+containerName, function(error, stdout, stderr) {
                    callback(error, true);
                });

            });
        });

        //Executing
        async.series(killArray, function(err, results){
            callback_return();
        });

    };

};


module.exports = function(container, buildConfiguration, suite, suiteSailfishConfiguration) {
    return new environmentBuilder(container, buildConfiguration, suite, suiteSailfishConfiguration);
};