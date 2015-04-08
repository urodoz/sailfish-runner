var ring = require("ring");
var bodyParser = require("body-parser");
var express = require('express');
var _ = require("underscore");
var childProcess = require("child_process");
var async = require("async");
var jf = require('jsonfile');
var builderFactory = require("sailfish/builder/builder");
var uuid = require("node-uuid");
var request = require("request");

module.exports = {
    "factory": function(container) {

        var app = express()

        //Ping action
        app.get('/ping', function (req, res) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                "name": "sailfish-runner",
                "id": container.getParameter("token"),
                "process": process.pid
            }));
        });

        app.get("/git/info", function(req, res) {

            //Collecting GET parameters
            var json = JSON.parse(req.query["json"]);
            var repository = json["repository"];
            var sshKey = json["sshKey"];
            var sshPrivateKey = json["sshPrivateKey"];

            //Checking if hosts has been sent
            var hosts = [];
            if(_.has(json, "hosts")) {
                var hosts = json["hosts"];
            } else {
                var hosts = [];
            }

            container.get("logger").info("Git info action received with parameters", {
                repository: repository,
                sshKey: sshKey,
                sshPrivateKey: sshPrivateKey,
                hosts: hosts
            });

            var buildId = uuid.v4();
            var commit = "master";

            var builder = new builderFactory(container, {
                "repository": repository,
                "sshKey": sshKey,
                "sshPrivateKey": sshPrivateKey,
                "buildId": buildId,
                "commit": commit,
                "hosts": hosts
            });

            builder.prepareToGitInfo(function(branches, commits) {

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    "branches": branches,
                    "commits": commits
                }));

            });

        });

        app.get("/bind", function(req, res) {

            var endpoint = req.query["endpoint"];

            var response_callback_success = function() {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    "status": "success",
                    "token": container.getParameter("token")
                }));
            };

            //Write app as locked on database
            container.get("database").set("endpoint", endpoint)
            response_callback_success();

        });

        //Build initiator
        app.get('/build', function(req, res) {

            //Check if the runner is locked, if locked, cannot continue with the action
            var runnerLocked = container.get("database").get("locked");
            if(runnerLocked==="false") runnerLocked = false;
            if(runnerLocked==="true") runnerLocked = true;
            //FIXME: is stored sometimes as string not as boolean

            var workers = container.get("database").get("workers");
            if(runnerLocked || (workers===0)) { //On instance locked or non available workers

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    status: "locked",
                    availableWorkers: workers,
                    runnerLocked: runnerLocked
                }));

            } else {

                //Collecting GET parameters
                var json = JSON.parse(req.query["json"]);
                var buildId = json["buildId"];
                var commit = json["commit"];
                var repository = json["repository"];
                var sshKey = json["sshKey"];
                var sshPrivateKey = json["sshPrivateKey"];

                //Checking if hosts has been sent
                var hosts = [];
                if(_.has(json, "hosts")) {
                    var hosts = json["hosts"];
                }

                container.get("logger").info("Build action received with parameters", {
                    buildId: buildId,
                    commit: commit,
                    repository: repository,
                    sshKey: sshKey,
                    sshPrivateKey: sshPrivateKey,
                    hostsRaw: json["hosts"],
                    hosts: hosts
                });

                //After save the entity, close the request and start the worker
                res.setHeader('Content-Type', 'application/json');
                var responseJson = JSON.stringify({
                    status: "success",
                    multiple: _.has(json, "_dependencies")
                });

                res.end(responseJson);

                container.updateWorkers(-1); //1 less available

                //Create the child process and return response
                if(container.get("workers")) {
                    container.get("workers").build({
                        "repository": repository,
                        "commit": commit,
                        "buildId": buildId,
                        "sshKey": sshKey,
                        "sshPrivateKey": sshPrivateKey,
                        "hosts": hosts
                     }, function(finalReport) {
                        container.get("logger").info("Build finished", {"report":finalReport, buildId: buildId, repository: repository, commit: commit});
                        //Report sailfish CI server
                        container.updateWorkers(1); //1 worker available

                        var endpoint = container.get("database").get("endpoint");
                        container.get("logger").info("Reporting to endpoint", {endpoint: endpoint});
                        request.get(endpoint+"/build-finish?json="+JSON.stringify({
                            buildId: buildId,
                            result: finalReport
                        }), function(err, response, body) {
                            //Do nothing, has been reported and local response returned
                            container.get("logger").info("Response from report to endpoint", {
                                body: body
                            });
                        });

                    });
                }

            }

        });

        //Middleware
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        return app;
    }
}