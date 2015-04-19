var _ = require("lodash"),
    ensureWorkspaceClass = require('sailfish/command/ensure_workspace'),
    createWorkspaceClass = require('sailfish/command/create_workspace'),
    pullRepositoryCodeClass = require('sailfish/command/pull_repository_code'),
    exportTrackerClass = require('sailfish/command/export_tracker'),
    readSailfishConfigurationClass = require('sailfish/command/read_sailfish_configuration');

var commandProxy = function(container) {

    //Create the runner for all commands
    this.ensureWorkspaceRunner = new ensureWorkspaceClass(container.getParameter("workspace_root"));
    this.createWorkspaceRunner = new createWorkspaceClass(container);
    this.readSailfishConfigurationRunner = new readSailfishConfigurationClass(container);
    this.pullRepositoryCodeRunner = new pullRepositoryCodeClass(container);
    this.exportTrackerRunner = new exportTrackerClass(container);

    /**
     * Will create the workspace root if does not exist
     * @return voi
     */
    this.ensureWorkspace = function(callback) {
        this.ensureWorkspaceRunner.run(callback);
    };

    this.createWorkspace = function(buildId, callback) {
        var self = this;
        this.ensureWorkspace(function() {
            self.createWorkspaceRunner.run(buildId, callback);
        });
    };

    this.readSailfishConfiguration = function(buildId, callback) {
        this.readSailfishConfigurationRunner.run(buildId, callback);
    };

    this.pullRepositoryCode = function(buildConfiguration, callback, extraLinks, type) {

        if(_.isUndefined(extraLinks)) extraLinks = "";
        if(_.isUndefined(type)) type = "default";

        this.pullRepositoryCodeRunner.run(buildConfiguration, callback, extraLinks, type);
    };

    this.exportTracker = function(buildId, callback) {
        this.exportTrackerRunner.export(buildId, callback);
    };

};

module.exports = function(container) {
    return new commandProxy(container);
};