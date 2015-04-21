var fs = require('fs-extra'),
    async = require("async");

var exportTracker = function(container) {

    this.modulesExported = [
          "async", "node-uuid", "exectimer", "minimist", "lodash", "jsonfile"
    ];

    this.getProjectRoot = function(buildId) {
        var workspaceRoot = container.getParameter("workspace_root");
        var projectRoot = workspaceRoot+"/"+buildId+"/frame";
        return projectRoot;
    };

    this.getSailfishRoot = function() {
        return container.getParameter("app_root");
    };

    this.export = function(buildId, return_callback) {
        var projectRoot = this.getProjectRoot(buildId);
        var sailfishRoot = this.getSailfishRoot();

        var serieOperations = [];

        //Tracker
        serieOperations.push(function(callback){
            fs.copy(sailfishRoot+"/tracker.js", projectRoot+"/tracker.js", function (err) {
                callback(err, true);
            });
        });
        //Ensure node_modules dir for dependencies
        serieOperations.push(function(callback){
            fs.ensureDir(projectRoot+"/node_modules", function (err) {
                callback(err, true);
            });
        });

        this.modulesExported.forEach(function(moduleExported) {
            serieOperations.push(function(callback){
                fs.copy(sailfishRoot+"/node_modules/"+moduleExported, projectRoot+"/node_modules/"+moduleExported, function (err) {
                    callback(err, true);
                });
            });
        });


        //Serial operation - copying needed tracked and dependencies (do not npm install, slower than just copy from base project)
        async.series(serieOperations, return_callback);
    };

};

module.exports = function(container) {
    return new exportTracker(container);
};