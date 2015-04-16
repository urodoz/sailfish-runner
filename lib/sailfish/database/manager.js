var low = require('lowdb'),
    _ = require("lodash");


var managerConstructor = function() {

    this.db = low(); //In memory database

    /**
     * Stores the global status information (its a unique row, id = 1 forced)
     * @param configuration
     */
    this.storeGlobalStatus = function(configuration) {
        var prevStoredStatus = this.getGlobalStatus();
        if(typeof(prevStoredStatus)!="undefined") {
            //Has previous data stored
            prevStoredStatus = _.extend(prevStoredStatus, configuration);
        } else {
            this.db("globalStatus").push(_.extend(configuration, {id: 1}));
        }
    };

    /**
     * Returns the global status
     * @returns {*}
     */
    this.getGlobalStatus = function() {
        return this.db("globalStatus").find({id:1});
    };

};

module.exports = function() {
    return new managerConstructor();
};
