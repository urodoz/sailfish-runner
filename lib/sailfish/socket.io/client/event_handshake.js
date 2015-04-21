
module.exports = function(container, data) {

    //Emit to the client the status changed
    container.set("serverLink", "linked");
    container.get("io.server").broadcastStatus();

};