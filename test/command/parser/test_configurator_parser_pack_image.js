var assert = require("assert"),
    sinon = require("sinon"),
    container = require('./../../../test_run.js'),
    configurationParserClass = require("sailfish/command/parser/configuration_parser");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/command/parser/test_configurator_parser_pack_image.js
 * @endcode
 */
describe("configuration_parser pack image", function() {

    it('should detect sailfish images', function(done) {

        var test_object = {
            suites: {
                default: {
                    image: "python@2.7"
                }
            }
        };

        var parser = new configurationParserClass(container, test_object);
        var parsed = parser.parse();

        assert.deepEqual(parsed, {
            suites: {
                default: {
                    image: "urodoz/sailfish-python:2.7"
                }
            },
            _type: "Sailfish runner configuration",
            _version: container.getParameter("VERSION")
        });

        done();

    });

    it("Non mapped images should remain the same", function(done) {

        var test_object = {
            suites: {
                default: {
                    image: "sample/undefined-image:9.9"
                }
            }
        };

        var parser = new configurationParserClass(container, test_object);
        var parsed = parser.parse();

        assert.deepEqual(parsed, {
            suites: {
                default: {
                    image: "sample/undefined-image:9.9"
                }
            },
            _type: "Sailfish runner configuration",
            _version: container.getParameter("VERSION")
        });

        done();

    });

    it("Inherited image should be applied on all linked suites", function(done) {

        var test_object = {
            suites: {
                default: {
                    image: "python@2.7"
                },
                extra: {
                    image: "@default"
                }
            }
        };

        var parser = new configurationParserClass(container, test_object);
        var parsed = parser.parse();

        assert.deepEqual(parsed, {
            suites: {
                default: {
                    image: "urodoz/sailfish-python:2.7"
                },
                extra: {
                    image: "urodoz/sailfish-python:2.7"
                }
            },
            _type: "Sailfish runner configuration",
            _version: container.getParameter("VERSION")
        });

        done();
    });

});