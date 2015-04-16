var assert = require("assert"),
    _ = require("lodash"),
    databaseManagerClass = require("sailfish/database/manager");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/database/test_manager.js
 * @endcode
 */
describe("database manager", function() {

    it("should store and retrieve the global status object", function(done) {

        var databaseManager = new databaseManagerClass();
        databaseManager.storeGlobalStatus({
            locked: true,
            workers: 45
        });

        //Fetch
        var storedStatus = databaseManager.getGlobalStatus();

        assert.ok(_.isObject(storedStatus));
        assert.ok(_.has(storedStatus, "locked"));
        assert.ok(_.has(storedStatus, "workers"));
        assert.equal(storedStatus["locked"], true);
        assert.equal(storedStatus["workers"], 45);

        //Store a secon configuration
        databaseManager.storeGlobalStatus({
            locked: false,
            workers: 99
        });

        //Fetch
        var storedStatus = databaseManager.getGlobalStatus();

        assert.ok(_.isObject(storedStatus));
        assert.ok(_.has(storedStatus, "locked"));
        assert.ok(_.has(storedStatus, "workers"));
        assert.equal(storedStatus["locked"], false);
        assert.equal(storedStatus["workers"], 99);

        done();
    });

});