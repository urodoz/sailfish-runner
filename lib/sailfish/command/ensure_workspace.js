var fs = require('fs-extra');

var ensureWorkspaceClass = function(workspaceRoot) {

    this.run = function(callback) {
        fs.ensureDir(workspaceRoot, function (err) {
            callback(err, true);
        });
    };

};

/*
 * Exports
 */
module.exports = function(workspaceRoot) {
    return new ensureWorkspaceClass(workspaceRoot);
};