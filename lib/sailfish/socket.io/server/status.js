

var statusEmitter = function(container) {

    this.globalStatus = container.get("databaseManager").getGlobalStatus();

    this.emit = function(transport) {


        transport.emit("status", {
            locked: this.globalStatus["locked"],
            availableWorkers: this.globalStatus["workers"],
            workerStatus: container.get("workers.status"),
            endpoint: container.getParameter("endpoint"),
            serverLink: container.get("serverLink")
        });
    };

};

module.exports = function(container) {
    return new statusEmitter(container);
}