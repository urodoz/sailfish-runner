var assert = require("assert");
var uuid = require("node-uuid");
var container = require('./../../../test_run.js');

var sys = require('sys');
var exec = require('child_process').exec;
var S = require("string");
var _ = require("lodash");

var environmentBuilderClass = require("sailfish/builder/environment_builder");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/builder/environment_builder/test_basic.js
 * @endcode
 */
describe("environment builder", function() {

    it("Simple python project + redis", function(done){

        this.timeout(30000);

        //Preparing data
        var sailfishConfiguration = {
            suites: {
                default: {
                    image: "urodoz/sailfish-python:2.7",
                    environment: ["SAILFISH_FOO=BAR"],
                    containers: {
                        "redis": {
                            image: "redis:2.8.19"
                        }
                    }
                }
            }
        };
        var buildId = uuid.v4();
        var buildConfiguration = {
            "repository": "ssh://root@172.17.42.1:13522/repository/python27",
            "commit": "a65db9b3d737bf2d62ab9bae50a18a33781976ed",
            "buildId": buildId,
            "sshKey": "ssh-dss AAAAB3NzaC1kc3MAAACBAJHUbRYOK8zq4kdVJJ7m0hcZHziMFcSGwZCxFe+Vw0+h7XsPKXmOqmTEy0lnVp0UJY+17+dDMzTjppn5pfapfDYalW+Q7uAOd4xeZqAaqjBioO6YDCZ1UGH/g2Lnl6fldUp6Tq6WAylE5+G8m9KPcWNAt45fdhXDr5QNANzNHiZXAAAAFQDZjgr5vHxNBRusvTpNjtpiy2CNvwAAAIABvdxs5nMIER1mH+5eAS40JVuwOYFAgqJ/TetoOKaCnJlJAvfGG8YgtodmXMmHVd/3OXLrECAXg6wHC23DvOsz0RSSqaVE2zohMEabP0iOLZXD1py33blRN9vXVgp5vzfdywrwVGwT3Uf2yv3jE17QeFWGPrkeBDEXzVg7bt0s7QAAAIAstSClz4F3QH8uNxcwQ3D/Ht1xINGNsfgJrcfacAK5UX7apg4yz5xVVYTpld0lL8hWmiSbVUEIMHNdzuRYvn8vzAmvm/FS4Rc/N4aK9dC09RUAe71F5P9XyuIDMknPdiQ6OTe1XQ3XgvliS3kIvSUlWR+oMUMUVoPFm3knmb8+AA== urodoz@localhost.localdomain",
            "sshPrivateKey": "LS0tLS1CRUdJTiBEU0EgUFJJVkFURSBLRVktLS0tLQ0KTUlJQnVnSUJBQUtCZ1FDUjFHMFdEaXZNNnVKSFZTU2U1dElYR1I4NGpCWEVoc0dRc1JYdmxjTlBvZTE3RHlsNQ0KanFwa3hNdEpaMWFkRkNXUHRlL25Rek0wNDZhWithWDJxWHcyR3BWdmtPN2dEbmVNWG1hZ0dxb3dZcUR1bUF3bQ0KZFZCaC80Tmk1NWVuNVhWS2VrNnVsZ01wUk9maHZKdlNqM0ZqUUxlT1gzWVZ3NitVRFFEY3pSNG1Wd0lWQU5tTw0KQ3ZtOGZFMEZHNnk5T2syTzJtTExZSTIvQW9HQUFiM2NiT1p6Q0JFZFpoL3VYZ0V1TkNWYnNEbUJRSUtpZjAzcg0KYURpbWdweVpTUUwzeGh2R0lMYUhabHpKaDFYZjl6bHk2eEFnRjRPc0J3dHR3N3pyTTlFVWtxbWxSTnM2SVRCRw0KbXo5SWppMlZ3OWFjdDkyNVVUZmIxMVlLZWI4MzNjc0s4RlJzRTkxSDlzcjk0eE5lMEhoVmhqNjVIZ1F4RjgxWQ0KTzI3ZExPMENnWUFzdFNDbHo0RjNRSDh1Tnhjd1EzRC9IdDF4SU5HTnNmZ0pyY2ZhY0FLNVVYN2FwZzR5ejV4Vg0KVllUcGxkMGxMOGhXbWlTYlZVRUlNSE5kenVSWXZuOHZ6QW12bS9GUzRSYy9ONGFLOWRDMDlSVUFlNzFGNVA5WA0KeXVJRE1rblBkaVE2T1RlMVhRM1hndmxpUzNrSXZTVWxXUitvTVVNVVZvUEZtM2tubWI4K0FBSVViOU1RbWZNZQ0KZDZHTG5HTzZEUmg4aC9rYTUxZz0NCi0tLS0tRU5EIERTQSBQUklWQVRFIEtFWS0tLS0t"
        }

        var environmentBuilder = new environmentBuilderClass(container, buildConfiguration, "default", sailfishConfiguration["suites"]["default"]);
        environmentBuilder.up(function() {

            //The 2 containers should be running
            var child = exec("docker ps |grep "+buildId, function(error, stdout, stderr) {

                assert.ok(S(stdout).contains(buildId+"_default_redis"));
                assert.ok(S(stdout).contains("sailfish-python:2.7"));

                //Check environment variable setted on the configuration on the running container
                var checkEnv = exec("docker inspect "+buildId+"_default", function(error, stdout, stderr) {
                    var dockerInspect = JSON.parse(stdout);
                    var envContainer = dockerInspect[0]["Config"]["Env"];
                    assert.ok(_.contains(envContainer, "SAILFISH_FOO=BAR"));

                    //Kill it
                    environmentBuilder.kill(function() {

                        exec("docker ps |grep "+buildId+"_default", function(error, stdout, stderr) {
                            assert.ok(!S(stdout).contains(buildId));
                            done();
                        });

                    });

                });

            });

        });

    });

});