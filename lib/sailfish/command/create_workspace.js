var ring = require("ring");
var fs = require('fs-extra');
var sys = require('sys');
var exec = require('child_process').exec;

var createWorkspaceClass = ring.create({

    constructor: function(container) {
        this.container = container;
    },

    run: function(buildId, return_callback) {
        var self = this;
        var workspaceFullDir = self.container.getParameter("workspace_root")+"/"+buildId;
        fs.ensureDir(workspaceFullDir, function (err) {
            if (err) {
                self.container.get("logger").info(err);
                throw err;
            }

            //Check environment variable setted on the configuration on the running container
            var chmod777Workspace = exec("chmod 777 "+workspaceFullDir, function(error, stdout, stderr) {
                return_callback();
            });

        });
    }

});

module.exports = createWorkspaceClass;