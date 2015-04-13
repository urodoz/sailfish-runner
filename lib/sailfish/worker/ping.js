var ring = require("ring");

var pingClass = ring.create({

    constructor: function(workerToken, container) {
        this.container = container;
        this.workerToken = workerToken;
    },

    run: function(parentToken, callback) {
        this.container.get("logger").info("[worker] Ping action received on worker from host", {
            workerToken: this.workerToken,
            parentToken: parentToken
        });
        callback(this.workerToken);
    }

});

module.exports = function(workerToken, container) {
    return new pingClass(workerToken, container);
}