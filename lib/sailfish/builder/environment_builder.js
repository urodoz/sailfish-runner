var ring = require("ring");
var _ = require("underscore");
var sys = require('sys');
var exec = require('child_process').exec;
var async = require("async");

var environmentBuilderClass = ring.create({

    constructor: function(container, buildConfiguration, suite, suiteSailfishConfiguration) {
        this.container = container;
        this.suite = suite;
        this.suiteSailfishConfiguration = suiteSailfishConfiguration;
        this.buildConfiguration = buildConfiguration;
        this.links = [];
        this.containersUp = [];
    },

    up: function(callback_return) {
        var self = this;

        var mainConstructor = function() {
            var workspaceFolder = self.container.getParameter("workspace_root")+'/'+self.buildConfiguration["buildId"]+"/frame";

            //Services up
            var dck = self.calculateDockerCommand(
                self.buildConfiguration["buildId"]+"_"+self.suite,
                self.suiteSailfishConfiguration,
                self.links,
                [workspaceFolder+':/workspace:rw']
            );

            var child = exec(dck, function(error, stdout, stderr) {
                if (error !== null) {
                    self.container.get("logger").info(error);
                }
                callback_return();
            });
        }

        //Up services | extra containers
        if(_.has(this.suiteSailfishConfiguration, "containers") && !_.isEmpty(this.suiteSailfishConfiguration["containers"])) {
            this._upServices(this.suiteSailfishConfiguration["containers"], function() {
                mainConstructor();
            });
        } else {
            mainConstructor();
        }
    },

    calculateDockerCommand: function(name, containerConfiguration, links, mount_points) {
        if(typeof(links)=="undefined") links = [];
        if(typeof(mount_points)=="undefined") mount_points = [];

        var commandArray = [];
        commandArray.push("docker run -d");
        commandArray.push('--name='+name);
        _.each(links, function(linkDef) {
            commandArray.push("--link "+linkDef);
        });

        //Environment definition
        if(_.has(containerConfiguration, "environment") && !_.isEmpty(containerConfiguration["environment"])) {
            _.each(containerConfiguration["environment"], function(envDef) {
                commandArray.push('-e "'+envDef+'"');
            });
        }

        //mount points
        _.each(mount_points, function(mPointDef) {
            commandArray.push("-v "+mPointDef);
        });

        commandArray.push(containerConfiguration["image"]);

        return commandArray.join(" ");
    },

    _upServices: function(containersConfiguration, return_callback) {
        var serviceKeys = _.keys(containersConfiguration);
        var self = this;
        //TODO: Calculate resolv order

        //Generating the array of commands to execute as serial
        var serviceArray = [];
        _.each(serviceKeys, function(serviceKey) {
            serviceArray.push(function(callback) {

                var serviceName = self.buildConfiguration["buildId"]+"_"+self.suite+"_"+serviceKey;
                self.links.push(serviceName+':'+serviceKey); //Adding link to main container

                //Calculating the docker command
                var dockerCommand = self.calculateDockerCommand(serviceName, containersConfiguration[serviceKey], []);

                self.container.get("logger").info("Executing command docker to bring up service", {
                    "service": serviceKey,
                    "command": dockerCommand
                });
                var child = exec(dockerCommand, function(error, stdout, stderr) {
                    if (error !== null) {
                        self.container.get("logger").info(error);
                    }
                    callback(null, true);
                });

            });
        });

        //Executing
        async.series(serviceArray, function(err, results) {
            return_callback();
        });
    },

    runTracker: function(callback_return) {

    },

    kill: function(callback_return) {
        var buildId = this.buildConfiguration["buildId"]
        var suite = this.suite;
        var upContainers = [buildId+"_"+suite];
        //Adding extra containers
        if(_.has(this.suiteSailfishConfiguration, "containers")) {
            var serviceKeys = _.keys(this.suiteSailfishConfiguration["containers"]);
            _.each(serviceKeys, function(sKey) {
                upContainers.push(buildId+"_"+suite+"_"+sKey);
            });
        }

        //Kill all
        var killArray = [];
        _.each(upContainers, function(containerName) {
            killArray.push(function(callback){

                var child = exec("docker stop "+containerName+" && docker rm -v "+containerName, function(error, stdout, stderr) {
                    callback(null, true);
                });

            });
        });

        //Executing
        async.series(killArray, function(err, results){
            callback_return();
        });

    }

});


module.exports = environmentBuilderClass