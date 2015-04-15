

var statusEmitter = function(container) {

    this.database = container.get("database");

    this.emit = function(transport) {
        transport.emit("status", {
            locked: this.database.get("locked"),
            availableWorkers: this.database.get("workers"),
            endpoint: container.getParameter("endpoint"),
            serverLink: container.get("serverLink")
        });
    };

};

module.exports = function(container) {
    return new statusEmitter(container);
}