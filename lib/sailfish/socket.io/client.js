var _ = require("lodash"),
    ioClient = require('socket.io-client');

var clientClass = function(app, server, container) {

    this.socket = null; //initial value of the connection

    this.connect = function() {

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

    };

    this.eventHandshake = function(data) {

    };

};

module.exports = function(app, server, container) {
    return new clientClass(app, server, container);
}