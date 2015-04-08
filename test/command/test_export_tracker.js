var assert = require("assert");
var sinon = require("sinon");
var randomstring = require("randomstring");
var fs = require('fs-extra');

var test_object = require('./../../test_run.js');
var app_test = test_object[0];
var container = test_object[1];

var exportTrackerClass = require("sailfish/command/export_tracker");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/command/test_export_tracker.js
 * @endcode
 */
describe("command export_tracker", function() {

    it('export tracker should export tracker and dependencies to project root', function(done) {

        //Stub the get parameter
        var exportTracker = new exportTrackerClass(container);
        var randomDirName = randomstring.generate(7);
        var fullWorkspacePath = "/tmp/"+randomDirName+"/frame"

        fs.ensureDir(fullWorkspacePath, function(err,result) {

            var stubProjectRoot = sinon.stub(exportTracker, "_getProjectRoot");
            stubProjectRoot.onCall(0).returns(fullWorkspacePath);

            exportTracker.export(randomDirName, function() {

                stats = fs.lstatSync(fullWorkspacePath);
                assert.ok(stats.isDirectory());

                stats = fs.lstatSync(fullWorkspacePath+"/node_modules");
                assert.ok(stats.isDirectory());

                stats = fs.lstatSync(fullWorkspacePath+"/node_modules/async");
                assert.ok(stats.isDirectory());

                stats = fs.lstatSync(fullWorkspacePath+"/node_modules/minimist");
                assert.ok(stats.isDirectory());

                stats = fs.lstatSync(fullWorkspacePath+"/node_modules/underscore");
                assert.ok(stats.isDirectory());

                stats = fs.lstatSync(fullWorkspacePath+"/node_modules/jsonfile");
                assert.ok(stats.isDirectory());

                //Checking tracking existance
                fs.exists(fullWorkspacePath+"/tracker.js", function(exists) {

                    assert.ok(exists);
                    exportTracker._getProjectRoot.restore();
                    done();

                });

            });

        });

    });


});