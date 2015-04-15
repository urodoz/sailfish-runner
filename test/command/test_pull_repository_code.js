var assert = require("assert"),
    sinon = require("sinon"),
    fs = require('fs'),
    uuid = require('node-uuid'),
    _ = require("lodash"),
    container = require('./../../test_run.js'),
    pullRepositoryCodeClass = require("sailfish/command/pull_repository_code");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/command/test_pull_repository_code.js
 * @endcode
 */
describe("command pull repository code", function() {

    describe('Seek server method', function() {

        var pullRepositoryCode = null;

        before(function() {
            pullRepositoryCode = new pullRepositoryCodeClass(container);
        });

        it('Should parse > ssh://root@127.0.0.1:13400/testRepo', function(done) {
            var parsedData = pullRepositoryCode.seekServer("ssh://root@127.0.0.1:13400/testRepo");

            assert.ok(_.isObject(parsedData));
            assert.ok(_.has(parsedData, "host"));
            assert.ok(_.has(parsedData, "port"));
            assert.ok(!_.isEmpty(parsedData["port"]));
            assert.equal(parsedData["port"], "-p 13400");
            assert.equal('127.0.0.1', parsedData["host"]);

            done();
        });

        it('Should parse > ssh://user@server.local/project.git', function(done) {
            var parsedData = pullRepositoryCode.seekServer("ssh://user@server.local/project.git");

            assert.ok(_.isObject(parsedData));
            assert.ok(_.has(parsedData, "host"));
            assert.ok(_.has(parsedData, "port"));
            assert.ok(_.isEmpty(parsedData["port"]));
            assert.equal('server.local', parsedData["host"]);

            done();
        });

        it('Should parse > ssh://user@127.0.0.1/project.git', function(done) {
            var parsedData = pullRepositoryCode.seekServer("ssh://user@127.0.0.1/project.git");

            assert.ok(_.isObject(parsedData));
            assert.ok(_.has(parsedData, "host"));
            assert.ok(_.has(parsedData, "port"));
            assert.ok(_.isEmpty(parsedData["port"]));
            assert.equal('127.0.0.1', parsedData["host"]);

            done();
        });

        it('Should parse > git@github.com:urodoz/sailfish-test-repository.git', function(done) {
            var parsedData = pullRepositoryCode.seekServer("git@github.com:urodoz/sailfish-test-repository.git");

            assert.ok(_.isObject(parsedData));
            assert.ok(_.has(parsedData, "host"));
            assert.ok(_.has(parsedData, "port"));
            assert.ok(_.isEmpty(parsedData["port"]));
            assert.equal('github.com', parsedData["host"]);

            done();
        });

        it('Should parse > https://example.com/gitproject.git', function(done) {
            var parsedData = pullRepositoryCode.seekServer("https://example.com/gitproject.git");

            assert.ok(_.isObject(parsedData));
            assert.ok(_.has(parsedData, "host"));
            assert.ok(_.has(parsedData, "port"));
            assert.ok(_.isEmpty(parsedData["port"]));
            assert.equal('example.com', parsedData["host"]);

            done();
        });

        it('Should parse > http://example.com/gitproject.git', function(done) {
            var parsedData = pullRepositoryCode.seekServer("http://example.com/gitproject.git");

            assert.ok(_.isObject(parsedData));
            assert.ok(_.has(parsedData, "host"));
            assert.ok(_.has(parsedData, "port"));
            assert.ok(_.isEmpty(parsedData["port"]));
            assert.equal('example.com', parsedData["host"]);

            done();
        });

        it('Should parse > http://example2.es:12345/gitproject.git', function(done) {
            var parsedData = pullRepositoryCode.seekServer("http://example2.es:12345/gitproject.git");

            assert.ok(_.isObject(parsedData));
            assert.ok(_.has(parsedData, "host"));
            assert.ok(_.has(parsedData, "port"));
            assert.ok(!_.isEmpty(parsedData["port"]));
            assert.equal(parsedData["port"], "-p 12345");
            assert.equal('example2.es', parsedData["host"]);

            done();
        });

    });

});