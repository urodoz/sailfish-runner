var ring = require("ring");
var fs = require('fs-extra');

var ensureWorkspaceClass = ring.create({

    constructor: function(container) {
        this.container = container;
    },

    run: function(return_callback) {
        var self = this;
        fs.ensureDir(self.container.getParameter("workspace_root"), function (err) {
            if (err) {
                self.container.get("logger").info(err);
            }
            return_callback();
        });
    }

});

module.exports = ensureWorkspaceClass;