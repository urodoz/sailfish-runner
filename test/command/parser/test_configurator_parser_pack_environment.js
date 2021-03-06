var assert = require("assert"),
    sinon = require("sinon"),
    container = require('./../../../test_run.js'),
    configurationParserClass = require("sailfish/command/parser/configuration_parser");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/command/parser/test_configurator_parser_pack_environment.js
 * @endcode
 */
describe("configuration_parser pack environment", function() {

    it('environment variables added to container description as array', function(done) {

        var test_object = {
            suites: {
                default: {
                    image: "python@2.7",
                    environment: ['RQ_ENV=test1', 'RQ_PASS=nopass', 'RQ_FOO=bar']
                }
            }
        };

        var parser = new configurationParserClass(container, test_object);
        var parsed = parser.parse();

        assert.deepEqual(parsed, {
            suites: {
                default: {
                    image: "urodoz/sailfish-python:2.7",
                    environment: ['RQ_ENV=test1', 'RQ_PASS=nopass', 'RQ_FOO=bar']
                }
            },
            _type: "Sailfish runner configuration",
            _version: container.getParameter("VERSION")
        });

        done();

    });

    it('environment variables with bad definition should be out of the result configuration', function(done) {

        var test_object = {
            suites: {
                default: {
                    image: "python@2.7",
                    environment: ['RQ_ENV=test1', 'RQ_PASS=nopass', 'RQ_FOObar']
                }
            }
        };

        var parser = new configurationParserClass(container, test_object);
        var parsed = parser.parse();

        assert.deepEqual(parsed, {
            suites: {
                default: {
                    image: "urodoz/sailfish-python:2.7",
                    environment: ['RQ_ENV=test1', 'RQ_PASS=nopass']
                }
            },
            _type: "Sailfish runner configuration",
            _version: container.getParameter("VERSION")
        });

        done();

    });

});