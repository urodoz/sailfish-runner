/*
 * Dependencies
 */
var _ = require('lodash');
var workerFarm = require('worker-farm');

/*
 * Configuration Step:
 *
 * The configuration file is readed and validated by the configuration
 * reader. The reader also extends the configuration object to add more
 * information.
 */
var configurationFromFile = require('./configuration.js');
var configuration = require("sailfish/configuration/reader")(configurationFromFile, function(err, configuration) {

    if(err) {
        console.log(err);
        throw Error("Error on configuration file")
    } else {

        /*
         * Container creation:
         *
         * The container is a service locator. Also contains the configuration
         * object. Its a singleton object and used almost on all class constructors
         */
        var container = new require('sailfish/container_factory')(configuration);
        container.init();

        /*
         * Workers creation:
         *
         * The workers are created to run all git/build/docker actions
         */
        var workers = workerFarm(require.resolve('./worker'), ['ping', "build"]);
        workers.ping(container.getParameter("token"), function(token) {
            //Received PING
        });
        container.set("workers", workers);

        /*
         * Socket IO server - for monitor status
         *
         * The runner has status monitor accessible by web. This socket.IO server
         * does all the job with the UI Status Monitor
         */
        var socketIOServer = require("sailfish/socket.io/server");
        container.set("io.server", new socketIOServer(container));
        container.get("io.server").serve();

        /*
         * Add Socket IO Client - if server is defined, try to reconnect
         *
         * The runner is also connected with the server
         */
        var socketIOClient = require("sailfish/socket.io/client");
        container.set("io.client", new socketIOClient(container));
        container.get("io.client").connect();
    }

});



