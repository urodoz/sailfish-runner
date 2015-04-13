var ring = require("ring");
var _ = require("underscore");
var socketIOClientLibrary = require('socket.io-client');

var clientClass = ring.create({

    constructor: function(app, server, container) {
        this.app = app;
        this.server = server;
        this.container = container;
        this.socket = null; //initial value of the connection
    },

    connect: function() {
        var self = this;
        this.container.get("logger").info("Trying to connect with server", {
            context: "socket.io"
        });

        var endpoint = this.container.get("database").get("endpoint");
        if(!_.isEmpty(endpoint)) {
            this.container.get("logger").info("Found endpoint to perform connection", {
                context: "socket.io",
                endpoint: endpoint
            });

            //Generating a connection on the class client
            this.socket = socketIOClientLibrary(endpoint, {
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

        } else {
            this.container.get("logger").info("Endpoint is not defined, cannot connect with any endpoint", {
                context: "socket.io"
            });
        }
    },

    eventConnect: function() {
        this.container.get("logger").info("connected to the endpoint", {
            context: "socket.io"
        });
        this.socket.emit("runner-connected", {
            token: this.container.getParameter("token")
        });
    },

    eventDisconnect: function() {
        this.container.get("logger").info("Lost connection with the endpoint", {
            context: "socket.io"
        });
    },

    eventHandshake: function(data) {
        this.container.get("logger").info("Handshake from server", {
            context: "socket.io",
            data: data
        });
    }

});

module.exports = function(app, server, container) {
    return new clientClass(app, server, container);
}