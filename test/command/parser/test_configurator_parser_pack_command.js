var assert = require("assert"),
    sinon = require("sinon"),
    container = require('./../../../test_run.js'),
    configurationParserClass = require("sailfish/command/parser/configuration_parser");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/command/parser/test_configurator_parser_pack_command.js
 * @endcode
 */
describe("configuration_parser pack command", function() {

    it('command should be detected and added to configuration', function(done) {

        var test_object = {
            suites: {
                default: {
                    image: "python@2.7",
                    command: "python unittest_suites.py",
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
                    command: "python unittest_suites.py",
                    environment: ['RQ_ENV=test1', 'RQ_PASS=nopass', 'RQ_FOO=bar']
                }
            },
            _type: "Sailfish runner configuration",
            _version: container.getParameter("VERSION")
        });

        done();

    });

    it('multiple commands should be keeped on 1 command', function(done) {

        var test_object = {
            suites: {
                default: {
                    image: "node@0.10.37",
                    command: "npm test && npm run-script run"
                }
            }
        };

        var parser = new configurationParserClass(container, test_object);
        var parsed = parser.parse();

        assert.deepEqual(parsed, {
            suites: {
                default: {
                    image: "urodoz/sailfish-node:0.10.37",
                    command: "npm test && npm run-script run"
                }
            },
            _type: "Sailfish runner configuration",
            _version: container.getParameter("VERSION")
        });

        done();

    });

});