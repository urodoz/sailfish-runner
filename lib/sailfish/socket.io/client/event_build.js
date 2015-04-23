var buildLogEmitterClass = require('sailfish/socket.io/server/build_log');

module.exports = function(container, data, fn) {

    var socketTransport = container.get("io.server").io,
        emitter = new buildLogEmitterClass(),
        buildAction = require("sailfish/worker/build")(container);

    container.get("logger").info("Received build request", data);

    var buildConfiguration = {
        repository: data.repository,
        commit: data.commit,
        buildId: data.buildId,
        sshKey: data.sshKey,
        sshPrivateKey: data.sshPrivateKey,
        hosts: data.hosts
    };

    emitter.emitStart(socketTransport, buildConfiguration);

    buildAction.run(buildConfiguration, function(finalReport) {

        container.get("logger").info("Sending report for build", data);
        fn(finalReport);

    });

};