var assert = require("assert");
var fs = require('fs');
var sinon = require("sinon");
var _ = require("underscore");

var test_object = require('./../../test_run.js');
var app_test = test_object[0];
var container = test_object[1];

var readSailfishConfigurationClass = require("sailfish/command/read_sailfish_configuration");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/command/test_read_sailfish_configuration.js
 * @endcode
 */
describe("command read sailfish configuration", function() {

    it('sailfish configuration with : services, provision, hosts and xunit', function(done) {

        var reader = new readSailfishConfigurationClass(container);

        //Stub the getFilePath to return the test file 1
        var stubGetFilePath = sinon.stub(reader, "_getSailfishFilePath");
        stubGetFilePath.onCall(0).returns(__dirname+"/data/sailfish_configuration_1.yml");

        reader.run("1234", function(resultObject) {

            assert.ok(stubGetFilePath.called);

            var package = resultObject["suites"]["default"];
            assert.ok(_.has(package, "image"));
            assert.ok(_.has(package, "provision"));
            assert.ok(_.has(package, "xunit"));
            assert.ok(_.has(package, "command"));
            assert.ok(_.has(package, "containers"));
            assert.ok(_.has(package["containers"], "postgres"));
            assert.ok(_.has(package["containers"], "redis"));

            reader._getSailfishFilePath.restore();
            done();
        });

    })


});