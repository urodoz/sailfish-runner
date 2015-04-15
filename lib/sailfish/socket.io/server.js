var http = require('http'),
    ioSocket = require('socket.io'),
    fs = require('fs');

var serverClass = function(container) {

    this.io = null;
    this.app = null;

    this.serve = function() {
        this.attachHttpServer();
        this.attachIOEvents();
    };

    this.attachHttpServer = function() {
        var handler = function(req, res) {
            fs.readFile(container.getParameter("app_root")+'/public/index.html',
                function (err, data) {
                    if (err) {
                        res.writeHead(500);
                        return res.end('Error loading index.html');
                    }

                    res.writeHead(200);
                    res.end(data);
                });
        };

        this.app = http.createServer(handler)
        this.io = ioSocket(this.app);
        this.app.listen(container.getParameter("port"));
    };

    this.attachIOEvents = function() {
        this.io.on('connection', function (socket) {
            /*
             * Event list
             */
            socket.emit('status', {
                //TODO: Add status information
            });
        });
    };

};

module.exports = function(container) {
    return new serverClass(container);
}