/*
 * The application container is holds all the services
 * needed by the application
 */
var _ = require("underscore");
var configuration = require('./configuration.js');
var configurationWorker = require('./configuration_worker.js');
var containerFactory = require('sailfish/container_factory');
var container = new containerFactory(_.extend(configuration, configurationWorker));
container.init();

var uuid = require('node-uuid');
var workerToken = uuid.v4();

module.exports = {
    ping: function (inp, callback) {
        container.get("logger").info("[worker] Ping action received on worker["+container.getParameter("token")+"] from host: ");
        callback(workerToken);
    },

    build: function(buildConfiguration, callback) {
        container.get("logger").info("[worker] Build action received on worker["+container.getParameter("token")+"] form host");
        var builder = require("sailfish/builder/builder")(container, buildConfiguration);

        builder.prepare(function() {
            builder.run(function(finalReport) {
                callback(finalReport);
            });
        });
    }
}