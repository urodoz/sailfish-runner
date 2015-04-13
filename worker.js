/*
 * The application container is holds all the services
 * needed by the application
 */
var _ = require("underscore");
var configuration = require('./configuration.js');
var containerFactory = require('sailfish/container_factory');
var container = new containerFactory(_.extend(configuration, {isWorker: true}));
container.init();

var uuid = require('node-uuid');
var workerToken = uuid.v4();

var pingAction = require("sailfish/worker/ping")(workerToken, container);
var buildAction = require("sailfish/worker/build")(workerToken, container);

module.exports = {
    ping: function (parentToken, callback) {
        pingAction.run(parentToken, callback);
    },

    build: function(buildConfiguration, callback) {
        buildAction.run(buildConfiguration, callback);
    }
}