var fs = require('fs-extra');
var sys = require('sys');
var exec = require('child_process').exec;

var createWorkspace = function(container) {

    this.run = function(buildId, return_callback) {
        var workspaceFullDir = container.getParameter("workspace_root")+"/"+buildId;
        fs.ensureDir(workspaceFullDir, function (err) {
            //Check environment variable setted on the configuration on the running container
            var chmod777Workspace = exec("chmod 777 "+workspaceFullDir, function(error, stdout, stderr) {
                return_callback(error, true); //TODO : Control error
            });

        });
    };

};

module.exports = function(container) {
    return new createWorkspace(container);
};