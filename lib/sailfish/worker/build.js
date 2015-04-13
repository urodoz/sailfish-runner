var ring = require("ring");

var buildClass = ring.create({

    constructor: function(workerToken, container) {
        this.container = container;
        this.workerToken = workerToken;
    },

    run: function(buildConfiguration, callback) {
        this.container.get("logger").info("[worker] Build action received on worker form host", {
            workerToken: this.workerToken,
            buildConfiguration: buildConfiguration
        });
        var builder = require("sailfish/builder/builder")(this.container, buildConfiguration);

        builder.prepare(function() {
            builder.run(function(finalReport) {
                callback(finalReport);
            });
        });
    }

});

module.exports = function(workerToken, container) {
    return new buildClass(workerToken, container);
}