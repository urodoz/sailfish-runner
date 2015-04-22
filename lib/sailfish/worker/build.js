
var buildClass = function(container) {

    this.run = function(buildConfiguration, callback) {

        var builder = require("sailfish/builder/builder")(container, buildConfiguration);

        builder.prepare(function() {
            builder.run(function(finalReport) {
                callback(finalReport);
            });
        });

    };

};

module.exports = function(workerToken, container) {
    return new buildClass(workerToken, container);
};