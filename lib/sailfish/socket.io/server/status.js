

var statusEmitter = function(container) {

    this.emit = function(transport) {
        transport.emit("status", {
            locked: container.locked,
            endpoint: container.getParameter("endpoint"),
            serverLink: container.get("serverLink")
        });
    };

};

module.exports = function(container) {
    return new statusEmitter(container);
};