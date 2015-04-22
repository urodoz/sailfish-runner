

var gitStepEmitter = function() {

    this.emit = function(transport, buildConfigurationWithStep) {
        transport.emit("git_step", buildConfigurationWithStep);
    };

};

module.exports = function() {
    return new gitStepEmitter();
};