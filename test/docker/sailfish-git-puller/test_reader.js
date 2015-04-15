var reader = require('./../../../docker/sailfish-git-puller/reader.js');
var fs = require("fs-extra");
var assert = require("assert");
var _ = require("lodash");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/docker/sailfish-git-puller/test_reader.js
 * @endcode
 */
describe("docker:sailfish-git-puller reader", function() {

    describe("commit history reader", function() {

        it("Commit reader sample 1: one commit", function(done) {

            fs.readFile(__dirname+"/sample_commit/sample1.output", 'utf8', function(err, data) {

                var commits = reader.parseCommitsOutput(data);

                assert.ok(_.isArray(commits));
                assert.equal(1, commits.length);
                var commit1 = commits[0];
                assert.equal("0d1d6a704463e588f58a75a4e9bd743bf90fc8a7", commit1["commit"]);
                assert.equal("Initial commit with sailfish YML", commit1["description"]);

                done();
            });

        });

        it("Commit reader sample 2 : multiple commits", function(done) {

            fs.readFile(__dirname+"/sample_commit/sample2.output", 'utf8', function(err, data) {

                var commits = reader.parseCommitsOutput(data);

                assert.ok(_.isArray(commits));
                assert.equal(3, commits.length);

                assert.equal("a2809d42eb08d03ab704f80b38d68b03585f5a2a", commits[0]["commit"]);
                assert.equal("build and git-info actions from GET to POST to avoi issues on SSH key parameters", commits[0]["description"]);

                assert.equal("53248e90ad30bb731e30290702d5a526387c729d", commits[1]["commit"]);
                assert.equal("Added support for all Git string formats on Seek server method for pull repository command", commits[1]["description"]);

                assert.equal("dc0500af685660880aba01cf3f5e352afa6e8219", commits[2]["commit"]);
                assert.equal("Initial commit with first working runner", commits[2]["description"]);

                done();
            });

        });

    });

    describe("branch reader", function() {

        it('Branch reader sample 1 : should detect master branch only', function(done) {

            fs.readFile(__dirname+"/sample_branches/sample1.output", 'utf8', function(err, data) {

                var branches = reader.parseBranchesOutput(data);

                assert.ok(_.isArray(branches));
                assert.equal(1, branches.length);
                assert.equal("master", branches[0]);

                done();
            });

        });

        it('Branch reader sample 2 : should detect master and develop branch', function(done) {

            fs.readFile(__dirname+"/sample_branches/sample2.output", 'utf8', function(err, data) {

                var branches = reader.parseBranchesOutput(data);

                assert.ok(_.isArray(branches));
                assert.equal(2, branches.length);
                assert.ok(_.contains(branches, "master"));
                assert.ok(_.contains(branches, "develop"));

                done();
            });

        });

        it('Branch reader sample 3 : should detect master with warning messages on output', function(done) {

            fs.readFile(__dirname+"/sample_branches/sample3.output", 'utf8', function(err, data) {

                var branches = reader.parseBranchesOutput(data);

                assert.ok(_.isArray(branches));
                assert.equal(1, branches.length);
                assert.equal("master", branches[0]);

                done();
            });

        });

    });

});