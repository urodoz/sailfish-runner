

var gitPullEmitter = function(container) {

    this.emitStart = function(transport, buildConfiguration) {
        transport.emit("git_pull_start", buildConfiguration);
    };

    this.emitEnd = function(transport, buildConfiguration) {
        transport.emit("git_pull_end", buildConfiguration);
    };

};

module.exports = function(container) {
    return new gitPullEmitter(container);
};