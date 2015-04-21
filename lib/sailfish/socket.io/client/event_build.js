
module.exports = function(container, data, fn) {

    container.get("logger").info("Received build request", data);

    //TODO: Lock the worker

    container.get("workers").build({
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