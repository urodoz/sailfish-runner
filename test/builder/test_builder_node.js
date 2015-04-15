var assert = require("assert"),
    uuid = require("node-uuid"),
    container = require('./../../test_run.js'),
    S = require("string"),
    sys = require('sys'),
    exec = require('child_process').exec,
    _ = require("lodash");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/builder/test_builder_node.js
 * @endcode
 */
describe("builder node", function() {

    it("Full build: simple nodejs project", function(done) {

        this.timeout(30000);

        var buildId = uuid.v4();
        var buildConfiguration = {
            "repository": "ssh://root@172.17.42.1:13522/repository/node1037",
            "commit": "33958b5719b23da9f03435b67d684a5fe7f5fece",
            "buildId": buildId,
            "sshKey": "ssh-dss AAAAB3NzaC1kc3MAAACBAJHUbRYOK8zq4kdVJJ7m0hcZHziMFcSGwZCxFe+Vw0+h7XsPKXmOqmTEy0lnVp0UJY+17+dDMzTjppn5pfapfDYalW+Q7uAOd4xeZqAaqjBioO6YDCZ1UGH/g2Lnl6fldUp6Tq6WAylE5+G8m9KPcWNAt45fdhXDr5QNANzNHiZXAAAAFQDZjgr5vHxNBRusvTpNjtpiy2CNvwAAAIABvdxs5nMIER1mH+5eAS40JVuwOYFAgqJ/TetoOKaCnJlJAvfGG8YgtodmXMmHVd/3OXLrECAXg6wHC23DvOsz0RSSqaVE2zohMEabP0iOLZXD1py33blRN9vXVgp5vzfdywrwVGwT3Uf2yv3jE17QeFWGPrkeBDEXzVg7bt0s7QAAAIAstSClz4F3QH8uNxcwQ3D/Ht1xINGNsfgJrcfacAK5UX7apg4yz5xVVYTpld0lL8hWmiSbVUEIMHNdzuRYvn8vzAmvm/FS4Rc/N4aK9dC09RUAe71F5P9XyuIDMknPdiQ6OTe1XQ3XgvliS3kIvSUlWR+oMUMUVoPFm3knmb8+AA== urodoz@localhost.localdomain",
            "sshPrivateKey": "LS0tLS1CRUdJTiBEU0EgUFJJVkFURSBLRVktLS0tLQ0KTUlJQnVnSUJBQUtCZ1FDUjFHMFdEaXZNNnVKSFZTU2U1dElYR1I4NGpCWEVoc0dRc1JYdmxjTlBvZTE3RHlsNQ0KanFwa3hNdEpaMWFkRkNXUHRlL25Rek0wNDZhWithWDJxWHcyR3BWdmtPN2dEbmVNWG1hZ0dxb3dZcUR1bUF3bQ0KZFZCaC80Tmk1NWVuNVhWS2VrNnVsZ01wUk9maHZKdlNqM0ZqUUxlT1gzWVZ3NitVRFFEY3pSNG1Wd0lWQU5tTw0KQ3ZtOGZFMEZHNnk5T2syTzJtTExZSTIvQW9HQUFiM2NiT1p6Q0JFZFpoL3VYZ0V1TkNWYnNEbUJRSUtpZjAzcg0KYURpbWdweVpTUUwzeGh2R0lMYUhabHpKaDFYZjl6bHk2eEFnRjRPc0J3dHR3N3pyTTlFVWtxbWxSTnM2SVRCRw0KbXo5SWppMlZ3OWFjdDkyNVVUZmIxMVlLZWI4MzNjc0s4RlJzRTkxSDlzcjk0eE5lMEhoVmhqNjVIZ1F4RjgxWQ0KTzI3ZExPMENnWUFzdFNDbHo0RjNRSDh1Tnhjd1EzRC9IdDF4SU5HTnNmZ0pyY2ZhY0FLNVVYN2FwZzR5ejV4Vg0KVllUcGxkMGxMOGhXbWlTYlZVRUlNSE5kenVSWXZuOHZ6QW12bS9GUzRSYy9ONGFLOWRDMDlSVUFlNzFGNVA5WA0KeXVJRE1rblBkaVE2T1RlMVhRM1hndmxpUzNrSXZTVWxXUitvTVVNVVZvUEZtM2tubWI4K0FBSVViOU1RbWZNZQ0KZDZHTG5HTzZEUmg4aC9rYTUxZz0NCi0tLS0tRU5EIERTQSBQUklWQVRFIEtFWS0tLS0t"
        }

        var builder = require("sailfish/builder/builder")(container, buildConfiguration);

        builder.prepare(function() {
            builder.run(function(finalReport) {

                assert.ok(_.has(finalReport, "default"));

                var testReport = finalReport["default"];

                assert.ok(_.has(testReport["build"][0], "phase"));
                assert.ok(_.has(testReport["build"][0], "command"));
                assert.equal(testReport["build"][0]["command"], "npm install")
                assert.ok(_.has(testReport["build"][0], "stdout"));
                assert.ok(_.has(testReport["build"][1], "phase"));
                assert.ok(_.has(testReport["build"][1], "command"));
                assert.ok(_.has(testReport["build"][1], "stdout"));

                var xunitReport = testReport["xunit"];
                assert.ok(_.isArray(xunitReport));
                assert.ok(_.has(xunitReport[0], "testsuite"));
                assert.equal(xunitReport[0]["testsuite"]["$"]["tests"], 2);
                assert.equal(xunitReport[0]["testsuite"]["$"]["errors"], 0);
                assert.equal(xunitReport[0]["testsuite"]["$"]["failures"], 0);

                done();

            });
        });

    });

});