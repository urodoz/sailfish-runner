var _ = require("lodash"),
    sys = require('sys'),
    exec = require('child_process').exec,
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
            var workspaceFolder = container.getParameter("workspace_root")+'/'+buildConfiguration["buildId"]+"/frame";

            //Services up
            var dck = self.calculateDockerCommand(
                buildConfiguration["buildId"]+"_"+self.suite,
                suiteSailfishConfiguration,
                self.links,
                [workspaceFolder+':/workspace:rw']
            );

            var child = exec(dck, function(error, stdout, stderr) {
                callback_return(error, true); //TODO: Return error and control error
            });
        }

        //Up services | extra containers
        if(_.has(suiteSailfishConfiguration, "containers") && !_.isEmpty(suiteSailfishConfiguration["containers"])) {
            this._upServices(suiteSailfishConfiguration["containers"], function() {
                mainConstructor();
            });
        } else {
            mainConstructor();
        }

    };

    this.calculateDockerCommand = function(name, containerConfiguration, links, mount_points) {
        if(typeof(links)=="undefined") links = [];
        if(typeof(mount_points)=="undefined") mount_points = [];

        var commandArray = [];
        commandArray.push("docker run -d");
        commandArray.push('--name='+name);

        links.forEach(function(linkDef) {
            commandArray.push("--link "+linkDef);
        }, this);

        //Environment definition
        if(_.has(containerConfiguration, "environment") && !_.isEmpty(containerConfiguration["environment"])) {
            containerConfiguration["environment"].forEach(function(envDef) {
                commandArray.push('-e "'+envDef+'"');
            });
        }

        //mount points
        mount_points.forEach(function(mPointDef) {
            commandArray.push("-v "+mPointDef);
        });

        commandArray.push(containerConfiguration["image"]);

        return commandArray.join(" ");
    };

    this._upServices = function(containersConfiguration, return_callback) {
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
    };

    this.kill = function(callback_return) {
        var buildId = this.buildConfiguration["buildId"]
        var suite = this.suite;
        var upContainers = [buildId+"_"+suite];
        //Adding extra containers
        if(_.has(this.suiteSailfishConfiguration, "containers")) {
            var serviceKeys = _.keys(this.suiteSailfishConfiguration["containers"]);
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
}