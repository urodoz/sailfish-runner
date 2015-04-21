
module.exports = function(container) {

    container.get("logger").warn("Disconnected from Sailfish CI Server");
    container.set("serverLink", "broken");
    container.get("io.server").broadcastStatus();

};