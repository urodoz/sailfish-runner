var ring = require("ring");
var bunyan = require('bunyan');
var _ = require("underscore");

var loggerFactory = ring.create({

    constructor: function(container) {
        this.loggers = []; //Create empty loggers
        var configuredLoggers = container.getParameter("loggers");
        var self = this;

        _.each(configuredLoggers, function(confLogger) {
            self.loggers.push(bunyan.createLogger(confLogger));
        });

        this.info("Added ["+this.loggers.length+"] loggers to bunyan logger");
    },

    warn: function(message, extra) {
        if(typeof(extra)=="undefined") extra={}
        _.each(this.loggers, function(log) {
            log.warn(extra, message);
        });
    },

    info: function(message, extra) {
        if(typeof(extra)=="undefined") extra={}
        _.each(this.loggers, function(log) {
            log.info(extra, message);
        });
    }

});

module.exports = loggerFactory;