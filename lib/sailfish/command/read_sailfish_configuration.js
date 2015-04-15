var fs = require('fs');
var YAML = require('yamljs');

var configurationParserClass = require("sailfish/command/parser/configuration_parser");

var readSailfishConfiguration = function(container) {

    this.parseConfiguration = function(nativeObject) {
        var parser = new configurationParserClass(container, nativeObject);
        return parser.parse();
    };

    this.getSailfishFilePath = function(buildId) {
        var workspaceRoot = container.getParameter("workspace_root");
        var buildRoot = workspaceRoot+"/"+buildId+"/frame";
        var sailfishConfigurationFilePath = buildRoot+"/sailfish.yml";

        return sailfishConfigurationFilePath;
    };

    this.run = function(buildId, return_callback) {
        var sailfishConfigurationFilePath =this.getSailfishFilePath(buildId);
        var nativeObject = YAML.load(sailfishConfigurationFilePath);

        return_callback(this.parseConfiguration(nativeObject));
    };

};

module.exports = function(container) {
    return new readSailfishConfiguration(container);
};