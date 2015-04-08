var ring = require("ring");
var fs = require('fs-extra');
var async = require("async");

var exportTrackerClass = ring.create({

    constructor: function(container) {
        this.container = container;
    },

    _getProjectRoot: function(buildId) {
        var workspaceRoot = this.container.getParameter("workspace_root");
        var projectRoot = workspaceRoot+"/"+buildId+"/frame";
        return projectRoot;
    },

    _getSailfishRoot: function() {
        return this.container.getParameter("app_root");
    },

    export: function(buildId, return_callback) {
        var self = this;
        var projectRoot = self._getProjectRoot(buildId);
        var sailfishRoot = self._getSailfishRoot();

        //Serial operation - copying needed tracked and dependencies (do not npm install, slower than just copy from base project)
        async.series([
            //Tracker script
            function(callback){
                fs.copy(sailfishRoot+"/tracker.js", projectRoot+"/tracker.js", function (err) {
                    if (err) {
                        self.container.get("logger").info(err);
                    }
                    callback(null, true);
                });
            },
            //Ensure node_modules dir for dependencies
            function(callback){
                fs.ensureDir(projectRoot+"/node_modules", function (err) {
                    if (err) {
                        self.container.get("logger").info(err);
                    }
                    callback(null, true);
                });
            },
            //Async module
            function(callback){
                fs.copy(sailfishRoot+"/node_modules/async", projectRoot+"/node_modules/async", function (err) {
                    if (err) {
                        self.container.get("logger").info(err);
                    }
                    callback(null, true);
                });
            },
            //node-uuid module
            function(callback){
                fs.copy(sailfishRoot+"/node_modules/node-uuid", projectRoot+"/node_modules/node-uuid", function (err) {
                    if (err) {
                        self.container.get("logger").info(err);
                    }
                    callback(null, true);
                });
            },
            //exectimer module
            function(callback){
                fs.copy(sailfishRoot+"/node_modules/exectimer", projectRoot+"/node_modules/exectimer", function (err) {
                    if (err) {
                        self.container.get("logger").info(err);
                    }
                    callback(null, true);
                });
            },
            //Minimist module
            function(callback){
                fs.copy(sailfishRoot+"/node_modules/minimist", projectRoot+"/node_modules/minimist", function (err) {
                    if (err) {
                        self.container.get("logger").info(err);
                    }
                    callback(null, true);
                });
            },
            //Underscore module
            function(callback){
                fs.copy(sailfishRoot+"/node_modules/underscore", projectRoot+"/node_modules/underscore", function (err) {
                    if (err) {
                        self.container.get("logger").info(err);
                    }
                    callback(null, true);
                });
            },
            //jsonfile module
            function(callback){
                fs.copy(sailfishRoot+"/node_modules/jsonfile", projectRoot+"/node_modules/jsonfile", function (err) {
                    if (err) {
                        self.container.get("logger").info(err);
                    }
                    callback(null, true);
                });
            }
        ],
        // optional callback
        function(err, results){
            return_callback();
        });
    }

});

module.exports = exportTrackerClass;