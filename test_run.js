/*
 * The application container is holds all the services
 * needed by the application
 */
var _ = require("lodash");

var configuration = require('./configuration.js');
var configurationTest = require('./configuration_test.js');
var containerFactory = require('sailfish/container_factory');
var container = new containerFactory(_.extend(configuration, configurationTest));
container.init();

module.exports = container;

var socketIOServer = require("sailfish/socket.io/server");
container.set("io.server", new socketIOServer(container));
container.get("io.server").serve();
