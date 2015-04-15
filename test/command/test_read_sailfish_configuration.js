var assert = require("assert"),
    fs = require('fs'),
    sinon = require("sinon"),
    _ = require("lodash"),
    container = require('./../../test_run.js'),
    readSailfishConfigurationClass = require("sailfish/command/read_sailfish_configuration");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/command/test_read_sailfish_configuration.js
 * @endcode
 */
describe("command read sailfish configuration", function() {

    it('sailfish configuration with : services, provision, hosts and xunit', function(done) {

        var reader = new readSailfishConfigurationClass(container);

        //Stub the getFilePath to return the test file 1
        var stubGetFilePath = sinon.stub(reader, "getSailfishFilePath");
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

            reader.getSailfishFilePath.restore();
            done();
        });

    })


});