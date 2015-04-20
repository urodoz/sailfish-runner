var validate = require("validate.js");
var configurationConstraints = require("./constraints.js");

/**
 * Class used to validate the input configuration and return the
 * errors on the configuration
 */
var classConfigurationReader = function(config) {

    this.config = config;
    this.validationResult = null;

    this.validate = function() {
        this.validationResult = validate(this.config, configurationConstraints);
    };

    this.hydrate = function() {

    };

    this.getErrors = function() {
        return this.validationResult;
    };

    this.getConfiguration = function() {
        return this.config;
    };

};

/*
 * Exports
 */
module.exports = function(config, callback) {
    var reader = new classConfigurationReader(config);

    reader.validate();
    reader.hydrate();

    callback(reader.getErrors(), reader.getConfiguration());
};