var _ = require("lodash"),
    uuid = require('node-uuid'),
    jf = require('jsonfile'),
    winston = require("winston"),
    statusEmitterClass = require('sailfish/socket.io/server/status'),
    fs = require('fs-extra');

var containerFactory = function(parameters) {

    this.locked = false;
    this.parameters = parameters;
    this.dict = { serverLink: "broken" };

    /**
     * Lock the container, and reports to all connnected
     * sockets
     *
     * @return void
     */
    this.lock = function() {
        this.locked = true;
        var statusEmitter = new statusEmitterClass(this);
        statusEmitter.emit(this.get("io.server").io);
    };

    /**
     * Unlocks the container and reports all connected
     * sockets
     *
     * @return void
     */
    this.unlock = function() {
        this.locked = false;
        var statusEmitter = new statusEmitterClass(this);
        statusEmitter.emit(this.get("io.server").io);
    };

    //Random token to the global parameters if not defined
    if(!_.has(parameters, "token")) parameters.token= uuid.v4();

    this.set = function(name, service, callback) {
        this.dict[name] = service;
        if (_.isFunction(callback)) callback();
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

    this.init = function() {
        this.initLogger();
        this.initReporter();
        this.initCommander();
    };

    this.initLogger = function() {
        winston.remove(winston.transports.Console);
        if(parameters.log) {
            winston.add(winston.transports.Console, {
                colorize: true,
                timestamp: true
            });
        }
        this.set("logger", winston);
    };

    this.initReporter = function() {
        var endpoint_reporter = require("sailfish/reporter/endpoint_reporter")(this);
        this.set("endpoint.reporter", endpoint_reporter);
        this.get("logger").info("Added database reporter to runner");
    };

    this.initCommander = function() {
        var commanderFactory = require('sailfish/command/command_factory');
        this.set('commander', new commanderFactory(this));
        this.get("logger").info("Added commander to runner");
    };

};

module.exports = function(parameters) {
    return new containerFactory(parameters);
};