

var gitBuildLogEmitter = function() {

    this.emit = function(transport, buildConfiguration) {
        transport.emit("build_log", buildConfiguration);
    };

};

module.exports = function(container) {
    return new gitBuildLogEmitter(container);
};