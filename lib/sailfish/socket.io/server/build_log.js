

var gitBuildLogEmitter = function() {

    this.emit = function(transport, buildConfiguration) {
        this._emit(transport, "build_log", buildConfiguration);
    };

    this.emitStart = function(transport, buildConfiguration) {
        this._emit(transport, "build_start", buildConfiguration);
    };

    this.emitEnd = function(transport, buildConfiguration) {
        this._emit(transport, "build_end", buildConfiguration);
    };

    this._emit = function(transport, eventName, buildConfiguration) {
        transport.emit(eventName, buildConfiguration);
    };

};

module.exports = function(container) {
    return new gitBuildLogEmitter(container);
};