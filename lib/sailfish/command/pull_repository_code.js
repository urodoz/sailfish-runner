var slug = require('slug'),
    async = require("async"),
    sys = require('sys'),
    exec = require('child_process').exec,
    Mustache = require("mustache"),
    _ = require("lodash"),
    S = require("string");

var pullRepositoryCodeClass = function(container) {

    this.seekServer = function(repository) {

        var arrMatches = null,
            result = null,
            ssh_rePattern = null;

        //SSH type
        if(S(repository).startsWith('ssh')) {
            ssh_rePattern = new RegExp(/^ssh\:\/\/[a-zA-Z0-9]+\@([0-9a-zA-Z\.]+)([:0-9]*).*$/);
            arrMatches = repository.match(ssh_rePattern);

            if (/^\:[0-9]+$/.test(arrMatches[2])) {
                result = {
                    host: arrMatches[1],
                    port: "-p "+arrMatches[2].replace(":", "") //prepares the string
                };
            } else {
                result = {
                    host: arrMatches[1],
                    port: ""
                };
            }

            container.get("logger").info("Found server from repository (SSH)", result);
            return result;
        }

        //Git Type
        if(S(repository).startsWith("git@")) {
            rePattern = new RegExp(/^git@([a-zA-Z0-9\.]+):.*$/);
            arrMatches = repository.match(rePattern);

            result = {
                host: arrMatches[1],
                port: ""
            };

            container.get("logger").info("Found server from repository (GIT)", result);

            return result;
        }

        //HTTP type
        if(S(repository).startsWith("http")) {
            rePattern = new RegExp(/^http(|s):\/\/([a-zA-Z0-9.]+)(|:)(|[0-9]+)\/.*$/);
            arrMatches = repository.match(rePattern);

            result = {
                host: arrMatches[2],
                port: (!_.isEmpty(arrMatches[4])) ? "-p "+arrMatches[4] : ""
            };

            container.get("logger").info("Found server from repository (HTTP)", result);

            return result;
        }

        container.get("logger").error("Error seeking server from git repository description", {
            repository: repository
        });

    };

    this.run = function(buildConfiguration, return_callback, extra_links, type) {

        if(_.isUndefined(type)) type = "default";

        var buildId = buildConfiguration.buildId;
        var repository = buildConfiguration.repository;
        var ssh_key = buildConfiguration.sshKey;
        var ssh_private_key = buildConfiguration.sshPrivateKey;
        var commit = buildConfiguration.commit;
        if(!_.has(buildConfiguration, "hosts")) buildConfiguration.hosts = [];
        var hosts = buildConfiguration.hosts;

        if(_.isUndefined(extra_links)) extra_links = "";

        //Use the image sailfish-git-puller to place all the code inside the workspace
        var containerName = slug(buildId);
        var self = this;

        async.series([
            function(callback) {
                /*
                 * Create the container on the background
                 */
                var dockerCommand = [];
                dockerCommand.push('docker run --rm');
                dockerCommand.push('--name="{{&containerName}}" ');
                dockerCommand.push('-e SAILFISH_SSH_KEY="{{&ssh_key}}"');
                dockerCommand.push('-e SAILFISH_PRIVATE_SSH_KEY="{{&ssh_private_key}}"');
                dockerCommand.push('-e SAILFISH_REPOSITORY="{{&repository}}"');
                dockerCommand.push('-e SAILFISH_REPOSITORY_SERVER="{{&repository_server}}"');
                dockerCommand.push('-e SAILFISH_REPOSITORY_SERVER_PORT="{{&repository_server_port}}"');
                dockerCommand.push('-e SAILFISH_COMMIT="{{&commit}}"');
                dockerCommand.push('-e SAILFISH_TYPE="{{&type}}"');
                dockerCommand.push('-e SAILFISH_HOSTS="{{&hosts}}"');
                dockerCommand.push(extra_links); //Adding extra links if defined
                dockerCommand.push('-v {{&workspace}}/{{containerName}}:/workspace:rw');
                dockerCommand.push("{{&puller_image}}");

                var dockerCommandJoin = dockerCommand.join(" ");

                var seekServerInfo = self.seekServer(repository);
                var dockerCommandFinal = Mustache.render(dockerCommandJoin, {
                    "puller_image": "urodoz/sailfish-git-puller:1.0",
                    "ssh_key": ssh_key,
                    "ssh_private_key": ssh_private_key,
                    "repository": repository,
                    "containerName": containerName,
                    "commit": commit,
                    "hosts": buildConfiguration.hosts.join(","),
                    "repository_server": seekServerInfo.host,
                    "repository_server_port": seekServerInfo.port,
                    "workspace": container.getParameter("workspace_root"),
                    "type": type
                });

                container.get("logger").info("Running container to pull the code", {command: dockerCommandFinal});

                var child = exec(dockerCommandFinal, function(error, stdout, stderr) {
                    //TODO: Control error
                    //Check environment variable setted on the configuration on the running container
                    var chmod777Frame = exec("chmod 777 "+container.getParameter("workspace_root")+"/"+containerName+"/frame", function(error, stdout, stderr) {
                        callback(error, true); //TODO : Control error
                    });

                });
            }
        ], return_callback);

    };

};

module.exports = function(container) {
    return new pullRepositoryCodeClass(container);
};