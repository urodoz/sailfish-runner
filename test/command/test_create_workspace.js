var assert = require("assert"),
    sinon = require("sinon"),
    fs = require('fs'),
    uuid = require('node-uuid'),
    container = require('./../../test_run.js'),
    createWorkspaceClass = require("sailfish/command/create_workspace");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/command/test_create_workspace.js
 * @endcode
 */
describe("command create_workspace", function() {

    it('should create the root of the new build on the workspace', function(done) {

        //Stub the get parameter
        var stubGetParameter = sinon.stub(container, "getParameter");
        var randomDir = "/tmp/"+uuid.v4();
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