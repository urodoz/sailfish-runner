/*
 * The application container is holds all the services
 * needed by the application
 */
var _ = require("underscore");

var configuration = require('./configuration.js');
var configurationTest = require('./configuration_test.js');
var containerFactory = require('sailfish/container_factory');
var container = new containerFactory(_.extend(configuration, configurationTest));
container.init();

/*
 * Webservice API
 */
var appFactory = require('sailfish/api/app_factory');
var app = appFactory.factory(container);

module.exports = [app, container];