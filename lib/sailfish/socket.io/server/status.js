

var statusEmitter = function(container) {

    this.database = container.get("database");

    this.emit = function(transport) {
        transport.emit("status", {
            locked: (this.database.get("locked")=="false") ? false : true, //FIXME: ministore lib cannot store booleans??!
            availableWorkers: this.database.get("workers"),
            workerStatus: container.get("workers.status"),
            endpoint: container.getParameter("endpoint"),
            serverLink: container.get("serverLink")
        });
    };

};

module.exports = function(container) {
    return new statusEmitter(container);
}