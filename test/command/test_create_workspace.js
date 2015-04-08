var assert = require("assert");
var sinon = require("sinon");
var randomstring = require("randomstring");
var fs = require('fs');
var uuid = require('node-uuid');

var test_object = require('./../../test_run.js');
var app_test = test_object[0];
var container = test_object[1];

var createWorkspaceClass = require("sailfish/command/create_workspace");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/command/test_create_workspace.js
 * @endcode
 */
describe("command create_workspace", function() {

    it('should create the root of the new build on the workspace', function(done) {

        //Stub the get parameter
        var stubGetParameter = sinon.stub(container, "getParameter");
        var randomDir = "/tmp/"+randomstring.generate(8);
        stubGetParameter.onCall(0).returns(randomDir);
        var randomBuildId = uuid.v4();

        var runnable = new createWorkspaceClass(container);
        runnable.run(randomBuildId, function() {

            stats = fs.lstatSync(randomDir);
            assert.ok(stats.isDirectory());

            stats = fs.lstatSync(randomDir+"/"+randomBuildId);
            assert.ok(stats.isDirectory());

            container.getParameter.restore();
            done();
        });
    })


});