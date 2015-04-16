var assert = require("assert"),
    container = require('./../test_run.js'),
    _ = require("lodash");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/test_container_factory.js
 * @endcode
 */
describe("container factory", function() {

    it("list should return available service on the container", function(done) {

        var serviceList = container.list();

        assert.ok(_.isArray(serviceList));
        assert.ok(_.contains(serviceList, "commander"));
        assert.ok(_.contains(serviceList, "endpoint.reporter"));

        done();
    });

    it("services can be injected through set method and fetched with get", function(done) {

        var testSampleService = {"foo":"sailfish"};
        container.set("test.sample.service", testSampleService);

        assert.deepEqual(container.get("test.sample.service"), testSampleService);

        done();
    });

    it("services can be removed with remove method on container", function(done) {

        var testSampleService = {"foo":"sailfish"};
        container.set("test.sample.service", testSampleService);

        //Asserting has been added
        var serviceList = container.list();
        assert.ok(_.isArray(serviceList));
        assert.ok(_.contains(serviceList, "test.sample.service"));

        //Removing
        container.remove("test.sample.service");
        var serviceList = container.list();
        assert.ok(_.isArray(serviceList));
        assert.ok(!_.contains(serviceList, "test.sample.service"));

        done();
    });

});