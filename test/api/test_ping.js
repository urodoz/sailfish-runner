var request = require('supertest');
var test_object = require('./../../test_run.js');
var app_test = test_object[0];
var container = test_object[1];
var assert = require("assert");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/api/test_ping.js
 * @endcode
 */
describe("api ping", function() {

    it('ping should return the basic runner data', function(done) {

        request(app_test)
            .get('/ping')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
            if (err) throw err;

                var jsonResponse = res.body;
                assert.equal(jsonResponse["id"], "test-token");
                assert.equal(jsonResponse["name"], "sailfish-runner");


                done();

            });

    });

});