var _ = require("lodash");

var endpointReporterClass = function(container) {

    this.STEPS = [
        "running",
        "finished"
    ];

    this.plugins = [];

    //Loading plugins - factory the plugins without container visibility
    container.getParameter("plugins").reporter.forEach(function(pluginRequire) {
        this.plugins.push(require(pluginRequire)(container));
    }, this);

    this.reportBuildInformation = function(buildId, step) {
        if(!_.contains(this.STEPS, step)) {
            throw Error("Step '"+step+"' is not an available step");
        }
        var self = this;

        _.each(this.plugins, function(plugin) {
            plugin.notify(buildId, step);
        });
    };

};

module.exports = function(container) {
    return new endpointReporterClass(container);
};