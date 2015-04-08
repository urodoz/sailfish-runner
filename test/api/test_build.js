var request = require('supertest');
var test_object = require('./../../test_run.js');
var app_test = test_object[0];
var container = test_object[1];
var assert = require("assert");
var sinon = require("sinon");
var uuid = require('node-uuid');

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/api/test_build.js
 * @endcode
 */
describe("api build", function() {

    it('build should receive the build arguments', function(done) {

        //Reset lock database
        container.get("database").set("locked", false);
        container.get("database").set("workers", 3);

        var randomBuildToken = uuid.v4();

        var json =  {
            "build": randomBuildToken,
            "commit": "foo-commit",
            "repository": "http://fakerepo.git",
            "ssh_key": "sample-ssh-public-key"
        }

        request(app_test)
            .get('/build?json='+JSON.stringify(json))
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){

                if (err) throw err;
                var jsonResponse = res.body;
                assert.equal(jsonResponse["status"], "success");
                assert.equal(jsonResponse["multiple"], false);

                done();
            });

    });

    it('build with dependencies should receive the build arguments for each build', function(done) {

        //Reset lock database
        container.get("database").set("locked", false);
        container.get("database").set("workers", 3);

        var randomBuildToken = uuid.v4();
        var coreRandomBuilToken = uuid.v4();

        var json =  {
            "build": randomBuildToken,
            "commit": "foo-commit",
            "repository": "http://fakerepo.git",
            "sshKey": "sample-ssh-public-key",
            "sshPrivateKey": "sample-ssh-private-key",
            "_dependencies": {
                "core": {
                    "build": coreRandomBuilToken,
                    "commit": "foo-commit-core",
                    "repository": "http://fakerepo.git/core",
                    "sshKey": "sample-ssh-public-key",
                    "sshPrivateKey": "sample-ssh-private-key"
                }
            }
        };

        request(app_test)
            .get('/build?json='+JSON.stringify(json))
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){

                if (err) throw err;
                var jsonResponse = res.body;
                assert.equal(jsonResponse["status"], "success");
                assert.equal(jsonResponse["multiple"], true);

                done();
            });

    });

});