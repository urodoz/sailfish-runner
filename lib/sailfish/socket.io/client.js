var ioClient = require('socket.io-client');

var clientClass = function(container) {

    this.socket = null; //initial value of the connection

    this.connect = function() {

        var self = this;

        //Generating a connection on the class client
        this.socket = ioClient(container.getParameter("endpoint"), {
            'reconnect': true,
            'reconnection delay': 5000
        });

        this.socket.on('connect', function(){
            self.eventConnect();
        });
        this.socket.on('handshake', function(data){
            self.eventHandshake(data);
        });
        this.socket.on('disconnect', function(){
            self.eventDisconnect();
        });
    };

    this.eventConnect = function() {
        this.socket.emit("runner-connected", {
            token: container.getParameter("token")
        });
    };

    this.eventDisconnect = function() {
        container.set("serverLink", "broken");
        container.get("io.server").broadcastStatus();
    };

    this.eventHandshake = function(data) {
        //Emit to the client the status changed
        container.set("serverLink", "linked");
        container.get("io.server").broadcastStatus();
    };

};

module.exports = function(container) {
    return new clientClass(container);
}