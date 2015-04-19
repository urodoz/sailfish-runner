var colors = require("colors");

module.exports = function(container, socket) {

    console.log("Connected to Sailfish CI Server".yellow.bold);
    socket.emit("runner-connected", {
        token: container.getParameter("token")
    });

};