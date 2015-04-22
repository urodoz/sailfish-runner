
module.exports = function(container, data, fn) {

    var buildAction = require("sailfish/worker/build")(container);

    container.get("logger").info("Received build request", data);

    buildAction.run({
        repository: data.repository,
        commit: data.commit,
        buildId: data.buildId,
        sshKey: data.sshKey,
        sshPrivateKey: data.sshPrivateKey,
        hosts: data.hosts
    }, function(finalReport) {

        container.get("logger").info("Sending report for build", data);
        fn(finalReport);

    });

};