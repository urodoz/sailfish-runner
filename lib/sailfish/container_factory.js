var _ = require("lodash");
var uuid = require('node-uuid');
var jf = require('jsonfile');
var fs = require('fs-extra');
var ministore = require('ministore');

var containerFactory = function(parameters) {

    this.parameters = parameters;

    /*
     * Default values
     */
    this.dict = {
        serverLink: "broken"
    };


    //Random token to the global parameters if not defined
    if(!_.has(parameters, "token")) parameters["token"]= uuid.v4();

    this.set = function(name, service) {
        this.dict[name] = service;
    };

    this.get = function(name) {
        if(!_.has(this.dict, name)) return null;
        return this.dict[name];
    };

    /**
     * Return all services stored on dict
     *
     * @returns {{}|*}
     */
    this.all = function() {
        return this.dict;
    };

    this.remove = function(name) {
        this.dict = _.omit(this.dict, name);
    };

    /**
     * Return the array of services availables on the container
     *
     * @return Array
     */
    this.list = function() {
        return _.keys(this.dict);
    };

    /**
     * Returns the parameter from the initual configuration by
     * key name or null if cannot be found
     *
     * @return mixed|null
     */
    this.getParameter = function(name) {
        if(!_.has(this.parameters, name)) return null;
        return this.parameters[name];
    };

    this.updateWorkers = function(modifier) {
        var availableWorkers = this.get("database").get("workers");
        var newAvailableWorkers = availableWorkers+modifier;
        if(newAvailableWorkers<1) {
            this.get("database").set("locked", true);
        } else {
            this.get("database").set("locked", false);
        }
        this.get("database").set("workers", newAvailableWorkers);
    };

    this.init = function() {
        this.initDatabase();
        this.initReporter();
        this.initCommander();
        ;
    };

    this.initReporter = function() {
        var endpoint_reporter = require("sailfish/reporter/endpoint_reporter")(this);
        this.set("endpoint.reporter", endpoint_reporter);
    };

    this.initDatabase = function() {
        var db = ministore(this.getParameter("database"));
        this.set("database", db('runner'));

        //Only if not worker (can init the database data), not workers
        if (!this.getParameter("isWorker")) {
            this.get("database").set('locked', 'false');
            this.get("database").set("workers", this.getParameter("workers"));
        }
    };

    this.initCommander = function() {
        var commanderFactory = require('sailfish/command/command_factory');
        this.set('commander', new commanderFactory(this));
    };

};

module.exports = function(parameters) {
    return new containerFactory(parameters);
};