var colors = require("colors");

module.exports = function(container, data, fn) {

    console.log("Received build request".green.bold);
    console.log("  commit    : ".yellow.bold+data.commit);
    console.log("  buildId   : ".yellow.bold+data.buildId);
    console.log("  repository: ".yellow.bold+data.repository);

    //TODO: Lock the worker

    container.get("workers").build({
        repository: data.repository,
        commit: data.commit,
        buildId: data.buildId,
        sshKey: data.sshKey,
        sshPrivateKey: data.sshPrivateKey,
        hosts: data.hosts
    }, function(finalReport) {

        console.log("Sending report for build ".yellow.bold+data.buildId+" to Sailfish CI Server...");

        fn(finalReport);
    });

};