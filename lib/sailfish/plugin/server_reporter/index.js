var _ = require("lodash");

var serverReporterClass = function(container) {

    this.__$PLUGIN = "server_reporter";

    this.notify = function(buildId, step) {
        //TODO: Use socket IO client to report to the server
    };

};

module.exports = function(container) {
    return new serverReporterClass(container);
};