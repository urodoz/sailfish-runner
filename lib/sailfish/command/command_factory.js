var ensureWorkspaceClass = require('sailfish/command/ensure_workspace');
var createWorkspaceClass = require('sailfish/command/create_workspace');
var pullRepositoryCodeClass = require('sailfish/command/pull_repository_code');
var exportTrackerClass = require('sailfish/command/export_tracker');
var readSailfishConfigurationClass = require('sailfish/command/read_sailfish_configuration');

var commandProxy = function(container) {

    /**
     * Will create the workspace root if does not exist
     * @return voi
     */
    this.ensureWorkspace = function(callback) {
        var runnable = new ensureWorkspaceClass(container.getParameter("workspace_root"));
        runnable.run(callback);
    };

    this.createWorkspace = function(buildId, callback) {
        var self = this;
        this.ensureWorkspace(function() {
            var runnable = new createWorkspaceClass(container);
            runnable.run(buildId, callback);
        });
    };

    this.readSailfishConfiguration = function(buildId, callback) {
        var runnable = new readSailfishConfigurationClass(container);
        runnable.run(buildId, callback);
    };

    this.pullRepositoryCode = function(buildConfiguration, callback, extraLinks, type) {

        if(typeof(extraLinks)=="undefined") extraLinks = "";
        if(typeof(type)=="undefined") type = "default";

        var runnable = new pullRepositoryCodeClass(container);
        runnable.run(buildConfiguration, callback, extraLinks, type);
    };

    this.exportTracker = function(buildId, callback) {
        var runnable = new exportTrackerClass(container);
        runnable.export(buildId, callback);
    };

};

module.exports = function(container) {
    return new commandProxy(container);
};