var fs = require('fs-extra'),
    sys = require('sys'),
    exec = require('child_process').exec;

var createWorkspace = function(container) {

    this.run = function(buildId, return_callback) {
        var workspaceFullDir = container.getParameter("workspace_root")+"/"+buildId;
        fs.ensureDir(workspaceFullDir, function (err) {

            if(err) {
                container.get("logger").warn("Error creating workspace", {error:err});
            } else {
                container.get("logger").info("Created workspace for build", {workspace:workspaceFullDir, buildId: buildId});
            }

            //Check environment variable setted on the configuration on the running container
            var chmod777Workspace = exec("chmod 777 "+workspaceFullDir, function(error, stdout, stderr) {
                container.get("logger").info("Changed permissions of workspace", {permission:"777", workspace:workspaceFullDir, buildId: buildId});
                return_callback(error, true); //TODO : Control error
            });

        });
    };

};

module.exports = function(container) {
    return new createWorkspace(container);
};