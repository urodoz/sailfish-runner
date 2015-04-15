var assert = require("assert"),
    sinon = require("sinon"),
    uuid = require("node-uuid"),
    fs = require('fs'),
    container = require('./../../test_run.js'),
    ensureWorkspaceClass = require("sailfish/command/ensure_workspace");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/command/test_ensure_workspace.js
 * @endcode
 */
describe("command ensure_workspace", function() {

    it('should construct a first level directory as workspace root', function(done) {

        //Stub the get parameter
        var stubGetParameter = sinon.stub(container, "getParameter");
        var randomDir = "/tmp/"+uuid.v4();
        stubGetParameter.onCall(0).returns(randomDir);

        var runnable = new ensureWorkspaceClass(container.getParameter("workspace_root"));
        runnable.run(function() {

            var stats = fs.lstatSync(randomDir);
            assert.ok(stats.isDirectory());

            container.getParameter.restore();
            done();
        });
    });

    it('should construct a multiple level directory as workspace root', function(done) {

        //Stub the get parameter
        var stubGetParameter = sinon.stub(container, "getParameter");
        var randomSlice1 = uuid.v4();
        var randomSlice2 = uuid.v4();
        var randomSlice3 = uuid.v4();

        var randomDir = "/tmp/"+randomSlice1+"/"+randomSlice2+"/"+randomSlice3;
        stubGetParameter.onCall(0).returns(randomDir);

        var runnable = new ensureWorkspaceClass(container.getParameter("workspace_root"));
        runnable.run(function() {

            var stats = fs.lstatSync("/tmp/"+randomSlice1);
            assert.ok(stats.isDirectory());

            stats = fs.lstatSync("/tmp/"+randomSlice1+"/"+randomSlice2);
            assert.ok(stats.isDirectory());

            stats = fs.lstatSync(randomDir);
            assert.ok(stats.isDirectory());

            container.getParameter.restore();
            done();
        });
    });


});