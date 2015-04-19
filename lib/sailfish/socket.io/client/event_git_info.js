var colors = require("colors"),
    uuid = require("node-uuid"),
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

        console.log("Sending git info report for repository ".yellow.bold+data.repository+" to Sailfish CI Server...".yellow.bold);

        fn({"branches": branches, "commits": commits});
    });

};