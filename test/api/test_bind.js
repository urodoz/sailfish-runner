var request = require('supertest');
var test_object = require('./../../test_run.js');
var app_test = test_object[0];
var container = test_object[1];
var assert = require("assert");
var jf = require('jsonfile');

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/api/test_bind.js
 * @endcode
 */
describe("api bind", function() {

    xit('on a bind call should be binded the first time to the endpoint', function(done) {

        request(app_test)
            .get('/bind?endpoint=http://127.0.0.1:31099')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                if (err) throw err;

                var jsonResponse = res.body;

                assert.equal(jsonResponse["status"], "success");
                assert.equal(jsonResponse["token"], "test-token");

                //Check data stored on database
                assert.equal("http://127.0.0.1:31099", container.get("database").get("endpoint"));
                done();
        });

    });

});