var assert = require("assert");
var sinon = require("sinon");
var randomstring = require("randomstring");
var fs = require('fs');

var test_object = require('./../../test_run.js');
var app_test = test_object[0];
var container = test_object[1];

var ensureWorkspaceClass = require("sailfish/command/ensure_workspace");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/command/test_ensure_workspace.js
 * @endcode
 */
describe("command ensure_workspace", function() {

    it('should construct a first level directory as workspace root', function(done) {

        //Stub the get parameter
        var stubGetParameter = sinon.stub(container, "getParameter");
        var randomDir = "/tmp/"+randomstring.generate(12);
        stubGetParameter.onCall(0).returns(randomDir);

        var runnable = new ensureWorkspaceClass(container);
        runnable.run(function() {

            stats = fs.lstatSync(randomDir);
            assert.ok(stats.isDirectory());

            container.getParameter.restore();
            done();
        });
    });

    it('should construct a multiple level directory as workspace root', function(done) {

        //Stub the get parameter
        var stubGetParameter = sinon.stub(container, "getParameter");
        var randomSlice1 = randomstring.generate(7);
        var randomSlice2 = randomstring.generate(7);
        var randomSlice3 = randomstring.generate(7);

        var randomDir = "/tmp/"+randomSlice1+"/"+randomSlice2+"/"+randomSlice3;
        stubGetParameter.onCall(0).returns(randomDir);

        var runnable = new ensureWorkspaceClass(container);
        runnable.run(function() {

            stats = fs.lstatSync("/tmp/"+randomSlice1);
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