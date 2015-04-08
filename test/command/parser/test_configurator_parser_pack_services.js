var assert = require("assert");
var sinon = require("sinon");

var test_object = require('./../../../test_run.js');
var app_test = test_object[0];
var container = test_object[1];

var configurationParserClass = require("sailfish/command/parser/configuration_parser");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/command/parser/test_configurator_parser_pack_services.js
 * @endcode
 */
describe("configuration_parser pack services", function() {

    it('redis service should be detected and added as container linked to configuration', function(done) {

        var test_object = {
            suites: {
                default: {
                    image: "python@2.7",
                    services: ["redis"]
                }
            }
        };

        var parser = new configurationParserClass(container, test_object);
        var parsed = parser.parse();

        assert.deepEqual(parsed, {
            suites: {
                default: {
                    image: "urodoz/sailfish-python:2.7",
                    containers: {
                        "redis": {
                            image: "redis:2.8.19"
                        }
                    }
                }
            },
            _type: "Sailfish runner configuration",
            _version: "latest-test"
        });

        done();

    });

    it('memcached service should be detected and added as container linked to configuration', function(done) {

        var test_object = {
            suites: {
                default: {
                    image: "python@2.7",
                    services: ["memcached"]
                }
            }
        };

        var parser = new configurationParserClass(container, test_object);
        var parsed = parser.parse();

        assert.deepEqual(parsed, {
            suites: {
                default: {
                    image: "urodoz/sailfish-python:2.7",
                    containers: {
                        "memcached": {
                            image: "memcached:1.4.22"
                        }
                    }
                }
            },
            _type: "Sailfish runner configuration",
            _version: "latest-test"
        });

        done();

    });



    it('extra container linked to service should be added to containers array with configuration', function(done) {

        var test_object = {
            suites: {
                default: {
                    image: "python@2.7",
                    services: ["memcached"],
                    containers: {
                        "proxy": {
                            image: "custom-image:0.99",
                            links: ['memcached']
                        }
                    }
                }
            }
        };

        var parser = new configurationParserClass(container, test_object);
        var parsed = parser.parse();

        assert.deepEqual(parsed, {
            suites: {
                default: {
                    image: "urodoz/sailfish-python:2.7",
                    containers: {
                        "memcached": {
                            image: "memcached:1.4.22"
                        },
                        "proxy": {
                            image: "custom-image:0.99",
                            links: ["memcached"]
                        }
                    }
                }
            },
            _type: "Sailfish runner configuration",
            _version: "latest-test"
        });

        done();

    });

});