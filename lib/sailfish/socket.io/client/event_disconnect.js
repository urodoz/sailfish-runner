var colors = require("colors");

module.exports = function(container) {

    console.log("Disconnected from Sailfish CI Server".red.bold);
    container.set("serverLink", "broken");
    container.get("io.server").broadcastStatus();

};