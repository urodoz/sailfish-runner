var assert = require("assert");
var test_object = require('./../../test_run.js');
var app_test = test_object[0];
var container = test_object[1];
var _ = require("underscore");
var sinon = require("sinon");
var uuid = require("node-uuid");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/reporter/test_endpoint_reporter.js
 * @endcode
 */
describe("endpoint reporter", function() {

    it("check class structure and plugins", function(done) {
        var endpointReporter = container.get("endpoint.reporter");
        var pluginsLoaded = endpointReporter.plugins;

        var foundServerReporter = false;

        _.each(pluginsLoaded, function(plugin) {
            if(plugin.__$PLUGIN=="server_reporter") foundServerReporter = true;
        });

        assert.ok(foundServerReporter);

        done();
    });

    it("reports to server through server_reporter plugin", function(done) {
        var endpointReporter = container.get("endpoint.reporter");
        var pluginsLoaded = endpointReporter.plugins;
        var server_reporter = pluginsLoaded[0];

        var stubNotify = sinon.stub(server_reporter, "notify");
        var randomBuildId = uuid.v4();
        var step = "running";

        endpointReporter.reportBuildInformation(randomBuildId, step);
        assert.ok(stubNotify.called);

        server_reporter.notify.restore();
        done();
    });

    it("throw exception on not allowed steps", function(done) {
        var endpointReporter = container.get("endpoint.reporter");

        try {
            endpointReporter.reportBuildInformation("abcdef", "foo-step");
            assert.ok(false);
        } catch(err) {
            assert.ok(true);
        }

        done();
    });

});