/*
 * The application container is holds all the services
 * needed by the application
 */
var configuration = require('./configuration.js');
var containerFactory = require('sailfish/container_factory');
var container = new containerFactory(configuration);
container.init();

//Init workers
container.get("logger").info("Starting worker [1]...");
var workerFarm = require('worker-farm');
workers = workerFarm(require.resolve('./worker'), [
    'ping', "build"
]);
workers.ping(container.getParameter("token"), function(token) {
    container.get("logger").info("Received ping response from worker: "+token);
});
container.get("logger").info("Add workers to container");
container.set("workers", workers);

/*
 * Webservice API
 */
var appFactory = require('sailfish/api/app_factory');
var app = appFactory.factory(container);

var server = app.listen(container.getParameter("port"), function () {
    var host = server.address().address
    var port = server.address().port
    container.get("logger").info('Runner listening at http://'+host+':'+port)
});