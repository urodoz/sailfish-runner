var assert = require("assert"),
    configurationObject = require('./../../configuration.js'),
    configurationTestObject = require('./../../configuration_test.js'),
    configurationReader = require('sailfish/configuration/reader'),
    _ = require("lodash");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/configuration/test_reader.js
 * @endcode
 */
describe("sailfish/configuration/reader", function() {

    it('should validate successfully the main configuration of the project', function(done) {
        configurationReader(configurationObject, function(err, configuration) {
            assert.ok(_.isEmpty(err));
            assert.ok(!_.isEmpty(configuration));
            done();
        });
    });

    it('should validate successfully the main test configuration of the project', function(done) {
        configurationReader(_.extend(configurationObject, configurationTestObject), function(err, configuration) {
            assert.ok(_.isEmpty(err));
            assert.ok(!_.isEmpty(configuration));
            done();
        });
    });


});