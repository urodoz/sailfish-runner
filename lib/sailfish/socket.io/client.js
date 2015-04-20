var ioClient = require('socket.io-client'),
    eventConnect = require('./client/event_connect'),
    eventDisconnect = require('./client/event_disconnect'),
    eventHandshake = require('./client/event_handshake'),
    eventBuild = require('./client/event_build'),
    eventGitInfo = require('./client/event_git_info'),
    colors = require("colors");

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
            eventConnect(container, self.socket);
        });
        this.socket.on('handshake', function(data){
            eventHandshake(container, data);
        });
        this.socket.on('disconnect', function(){
            eventDisconnect(container);
        });
        this.socket.on('build', function(data, fn){
            eventBuild(container, data, fn);
        });
        this.socket.on('gitinfo', function(data, fn){
            eventGitInfo(container, data, fn);
        });
    };

};

module.exports = function(container) {
    return new clientClass(container);
};