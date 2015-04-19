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
var bodyParser = require('body-parser');

module.exports = {
    "factory": function(container) {

        var app = express()

        //Body parser
        app.use(bodyParser.json()); // for parsing application/json
        app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

        //Ping action
        app.get('/ping', function (req, res) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                "name": "sailfish-runner",
                "id": container.getParameter("token"),
                "process": process.pid
            }));
        });

        //Build initiator
        app.post('/build', function(req, res) {

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
                var buildId = req.body["buildId"];
                var commit = req.body["commit"];
                var repository = req.body["repository"];
                var sshKey = req.body["sshKey"];
                var sshPrivateKey = req.body["sshPrivateKey"];

                //Checking if hosts has been sent
                var hosts = [];
                if(_.has(req.body, "hosts")) {
                    var hosts = req.body["hosts"];
                }



            }

        });

        //Middleware
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        return app;
    }
}