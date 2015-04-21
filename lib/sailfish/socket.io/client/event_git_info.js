var uuid = require("node-uuid"),
    builderFactory = require("sailfish/builder/builder");

module.exports = function(container, data, fn) {

    var buildId = uuid.v4();
    var commit = "master";

    var builder = new builderFactory(container, {
        "repository": data.repository,
        "sshKey": data.sshKey,
        "sshPrivateKey": data.sshPrivateKey,
        "buildId": buildId,
        "commit": commit,
        "hosts": data.hosts
    });

    builder.prepareToGitInfo(function(branches, commits) {

        container.get("logger").info("Sending git info report for repository", {
            repository: data.repository,
            branches: branches
        });
        fn({"branches": branches, "commits": commits});
    });

};