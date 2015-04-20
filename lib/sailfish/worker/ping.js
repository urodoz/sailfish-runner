
var ping = function(workerToken, container) {

    this.run = function(parentToken, callback) {
        callback(workerToken);
    };

};

module.exports = function(workerToken, container) {
    return new ping(workerToken, container);
};