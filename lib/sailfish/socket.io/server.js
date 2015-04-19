var http = require('http'),
    ioSocket = require('socket.io'),
    serveStatic = require('serve-static'),
    colors = require("colors"),
    statusEmitterClass = require('sailfish/socket.io/server/status'),
    fs = require('fs');


var serverClass = function(container) {

    this.io = null;
    this.app = null;

    this.serve = function() {
        this.attachHttpServer();
        this.attachIOEvents();
    };

    this.attachHttpServer = function() {
        var ioHandler = function(req, res) {
            fs.readFile(container.getParameter("app_root")+'/io.html',
                function (err, data) {
                    if (err) {
                        res.writeHead(500);
                        return res.end('Error loading io.html');
                    }

                    res.writeHead(200);
                    res.end(data);
                });
        };
        var staticServer = serveStatic(container.getParameter("app_root")+'/public', {'index': ['index.html', 'index.htm']});

        this.app = http.createServer(function(req, res) {
            staticServer(req, res, function() {
                ioHandler(req, res);
            });
        });
        this.io = ioSocket(this.app);
        this.app.listen(container.getParameter("port"));
        console.log("Socket.IO listening".cyan.bold);
    };

    this.broadcastStatus = function() {
        var statusEmitter = new statusEmitterClass(container);
        statusEmitter.emit(this.io);
    };

    this.attachIOEvents = function() {
        var self = this;
        this.io.on('connection', function (socket) {
            self.broadcastStatus();
        });
    };

};

module.exports = function(container) {
    return new serverClass(container);
}