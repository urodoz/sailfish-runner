
module.exports = function(container, socket) {

    container.get("logger").info("Connected to Sailfish CI Server");
    socket.emit("runner-connected", {
        token: container.getParameter("token")
    });

};