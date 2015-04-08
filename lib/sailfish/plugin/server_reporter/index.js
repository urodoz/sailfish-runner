var ring = require("ring");
var _ = require("underscore");
var request = require("request");

var serverReporterClass = ring.create({

    __$PLUGIN: "server_reporter",

    constructor: function(container) {
        this.container = container;
    },

    /**
     * Returns the endpoint from database
     *
     * @return String
     */
    findEndpoint: function() {
        var database = this.container.get("database");
        var endpoint = database.get("endpoint");
        if(_.isString(endpoint) && !_.isEmpty(endpoint)) {
            return endpoint;
        }
        throw Error("endpoint is undefined, cannot return endpoint");
    },

    notify: function(buildId, step) {
        var endpoint = this.findEndpoint();
        var updateBuildUrl = endpoint+"/build/update/"+buildId+"/"+step;
        this.container.get("logger").info("Reporting sailfish server", {
           buildId: buildId,
           step: step,
           urlCalled: updateBuildUrl
        });
        request(updateBuildUrl, function (error, response, body) {
            //TODO : Feedback , retry on fail?
            if (!error && response.statusCode == 200) {
            }
        })
    }

});

module.exports = function(container) {
    return new serverReporterClass(container);
};