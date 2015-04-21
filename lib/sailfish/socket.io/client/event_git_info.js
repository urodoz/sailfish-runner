var uuid = require("node-uuid"),
    gitPullEmitterClass = require('sailfish/socket.io/server/git_pull'),
    builderFactory = require("sailfish/builder/builder");

module.exports = function(container, data, fn) {

    var socketTransport = container.get("io.server").io;

    //Lock the container
    container.lock();

    var buildId = uuid.v4();
    var commit = "master";

    var buildConfiguration = {
        "repository": data.repository,
        "sshKey": data.sshKey,
        "sshPrivateKey": data.sshPrivateKey,
        "buildId": buildId,
        "commit": commit,
        "hosts": data.hosts
    };
    var builder = new builderFactory(container, buildConfiguration);

    //Report to all sockets the git pull action is starting
    var emitter = new gitPullEmitterClass(container);
    emitter.emitStart(socketTransport, buildConfiguration);

    builder.prepareToGitInfo(function(branches, commits) {

        container.get("logger").info("Sending git info report for repository", {
            repository: data.repository,
            branches: branches
        });
        fn({"branches": branches, "commits": commits});

        //Unlock the container
        container.unlock();

        //Report to all sockets the git pull is finished
        emitter.emitEnd(socketTransport, buildConfiguration);
    });

};