var ring = require("ring");
var fs = require('fs');
var YAML = require('yamljs');

var configurationParserClass = require("sailfish/command/parser/configuration_parser");

var readSailfishConfigurationClass = ring.create({

    constructor: function(container) {
        this.container = container;
    },

    parseConfiguration: function(nativeObject) {
        var parser = new configurationParserClass(this.container, nativeObject);
        return parser.parse();
    },

    _getSailfishFilePath: function(buildId) {
        var workspaceRoot = this.container.getParameter("workspace_root");
        var buildRoot = workspaceRoot+"/"+buildId+"/frame";
        var sailfishConfigurationFilePath = buildRoot+"/sailfish.yml";

        return sailfishConfigurationFilePath;
    },

    run: function(buildId, return_callback) {
        var sailfishConfigurationFilePath =this._getSailfishFilePath(buildId);
        var nativeObject = YAML.load(sailfishConfigurationFilePath);

        return_callback(this.parseConfiguration(nativeObject));
    }

});

module.exports = readSailfishConfigurationClass;