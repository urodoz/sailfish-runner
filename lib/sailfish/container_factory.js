var ring = require("ring");
var _ = require("underscore");
var uuid = require('node-uuid');
var jf = require('jsonfile');
var fs = require('fs-extra');

var containerFactory = ring.create({

    constructor: function(parameters) {
        this.dict = {};

        //Attaching a random token to the process if not defined
        if(!_.has(parameters, "token")) parameters["token"]= uuid.v4();

        this.parameters = parameters;
    },

    "set": function(name, service) {
        this.dict[name] = service;
    },

    "get": function(name) {
        if(!_.has(this.dict, name)) return null;
        return this.dict[name];
    },

    "remove": function(name) {
        this.dict = _.omit(this.dict, name);
    },

    /**
     * Return the array of services availables on the container
     *
     * @return Array
     */
    list: function() {
        return _.keys(this.dict);
    },

    /**
     * Returns the parameter from the initual configuration by
     * key name or null if cannot be found
     *
     * @return mixed|null
     */
    getParameter: function(name) {
        if(!_.has(this.parameters, name)) return null;
        return this.parameters[name];
    },

    updateWorkers: function(modifier) {
        var availableWorkers = this.get("database").get("workers");
        var newAvailableWorkers = availableWorkers+modifier;
        if(newAvailableWorkers<1) {
            this.get("database").set("locked", true);
        } else {
            this.get("database").set("locked", false);
        }
        this.get("database").set("workers", newAvailableWorkers);
    },

    init: function() {
        this._initLogger()
            ._initDatabase()
            ._initReporter()
            ._initCommander()
        ;
    },

    _initReporter: function() {
        this.get("logger").info("Adding endpoint reporter to container");
        var endpoint_reporter = require("sailfish/reporter/endpoint_reporter")(this);
        this.set("endpoint.reporter", endpoint_reporter);

        return this;
    },

    _initLogger: function() {
        var loggerFactory = require('sailfish/logger/logger_factory');
        this.set('logger', new loggerFactory(this));

        return this;
    },

    _initDatabase: function() {
        var db = require('ministore')(this.getParameter("database"));
        this.set("database", db('runner'));

        //Only if not worker (can init the database data), not workers
        if (!this.getParameter("isWorker")) {
            this.get("logger").info("Runner mode detected. Init data on database");
            this.get("database").set('locked', 'false');
            this.get("database").set("workers", this.getParameter("workers"));
        }

        return this;
    },

    _initCommander: function() {
        this.get("logger").info("Adding commander to container");
        var commanderFactory = require('sailfish/command/command_factory');
        this.set('commander', new commanderFactory(this));

        return this;
    }

});

module.exports = containerFactory;