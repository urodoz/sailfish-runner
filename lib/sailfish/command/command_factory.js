var ring = require("ring");

var ensureWorkspaceClass = require('sailfish/command/ensure_workspace');
var createWorkspaceClass = require('sailfish/command/create_workspace');
var pullRepositoryCodeClass = require('sailfish/command/pull_repository_code');
var exportTrackerClass = require('sailfish/command/export_tracker');
var readSailfishConfigurationClass = require('sailfish/command/read_sailfish_configuration');

var command_factory = ring.create({

    constructor: function(container) {
        this.container = container;
    },

    /**
     * Will create the workspace root if does not exist
     * @return voi
     */
    ensureWorkspace: function(callback) {
        var runnable = new ensureWorkspaceClass(this.container);
        runnable.run(callback);
    },

    createWorkspace: function(buildId, callback) {
        var self = this;
        this.ensureWorkspace(function() {
            self.container.get("logger").info("Creating workspace for build", {"buildId": buildId});
            var runnable = new createWorkspaceClass(self.container);
            runnable.run(buildId, callback);
        });
    },

    readSailfishConfiguration: function(buildId, callback) {
        var runnable = new readSailfishConfigurationClass(this.container);
        runnable.run(buildId, callback);
    },

    pullRepositoryCode: function(buildConfiguration, callback, extraLinks, type) {

        if(typeof(extraLinks)=="undefined") extraLinks = "";
        if(typeof(type)=="undefined") type = "default";

        var runnable = new pullRepositoryCodeClass(this.container);
        runnable.run(buildConfiguration, callback, extraLinks, type);
    },

    exportTracker: function(buildId, callback) {
        var runnable = new exportTrackerClass(this.container);
        runnable.export(buildId, callback);
    }

});

module.exports = command_factory;