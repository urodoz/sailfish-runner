var ring = require("ring");
var _ = require("underscore");
var S = require("string");

var serviceInjectorClass = require("sailfish/command/parser/service_injector");

var configurationParserClass = ring.create({

    constructor: function(container, nativeObject) {
        this.nativeObject = nativeObject;
        this.container = container;

        //Init the class accumulators
        this.provisionBattery = [];
        this.environmentBattery = [];
    },

    parse: function() {

        //Create the object and start parsing by steps
        this.parsedObject = {
            "suites": {}
        };

        this.addSailfishStamp()
            .addSuites()
            .parseSuites()
            ;

        return this.parsedObject;
    },

    addSailfishStamp: function() {
        this.parsedObject._type = "Sailfish runner configuration";
        this.parsedObject._version = this.container.getParameter("VERSION");
        return this;
    },

    addSuites: function() {
        if(_.has(this.nativeObject, "suites")) {
            var suiteKeys = _.keys(this.nativeObject["suites"]);
            this._suiteKeys = suiteKeys; //Storing on the current instance (shortcut to suite keys)
            var self = this;
            _.each(suiteKeys, function(suiteKey) {
                self.parsedObject.suites[suiteKey] = {};
            })
        }
        return this;
    },

    parseSuites: function() {
        var self = this;
        _.each(this._suiteKeys, function(suiteKey) {
            self.parseSuite(suiteKey);
        });
    },

    parseSuite: function(suiteKey) {
        var self = this;
        var resultObject = {};
        var originalObject = this.nativeObject["suites"][suiteKey];
        var serviceInjector = new serviceInjectorClass(this.container);

        this.replaceReferenceConfigurations(suiteKey);

        //Image
        resultObject.image = this.whichImage(originalObject["image"]);

        //Provision
        resultObject.provision = self.provisionBattery;
        if(_.has(originalObject, "provision")) {
            _.each(originalObject["provision"], function(provisionCmd) {
                resultObject.provision.push(provisionCmd);
            });
        }
        //Xunit definition
        if(_.has(originalObject, "xunit")) {
            resultObject.xunit = originalObject.xunit;
        }

        //Environment
        resultObject.environment = self.environmentBattery;
        var extractedEnvironment = this.extractEnvironmentVariables(originalObject);
        _.each(extractedEnvironment, function(envDefinition) {
            resultObject.environment.push(envDefinition);
        });

        //Command
        if(_.has(originalObject, "command")) {
            resultObject.command = originalObject.command;
        }

        //Services
        resultObject["containers"] = {};
        if(_.has(originalObject, "services") && _.isArray(originalObject["services"])) {
            _.each(originalObject["services"], function(serviceName) {
                resultObject["containers"] = _.extend(resultObject["containers"], serviceInjector.configure(serviceName));
            });
        };

        //After services, attach extra containers if defined (this container can link to current services)
        if(_.has(originalObject, "containers")) {
            var containerKeysOriginalObject = _.keys(originalObject["containers"]);
            _.each(containerKeysOriginalObject, function(containerKey) {
                var containerOriginalConfiguration = originalObject["containers"][containerKey];
                //Replace image
                containerOriginalConfiguration["image"] = self.whichImage(containerOriginalConfiguration["image"]);
                resultObject["containers"][containerKey] = containerOriginalConfiguration;
            });
        }


        //Remove empty objects if any
        if(_.isEmpty(resultObject["provision"])) resultObject = _.omit(resultObject, "provision");
        if(_.isEmpty(resultObject["environment"])) resultObject = _.omit(resultObject, "environment");
        if(_.isEmpty(resultObject["containers"])) resultObject = _.omit(resultObject, "containers");

        this.parsedObject["suites"][suiteKey] = resultObject;

        //Clear batteries
        this.provisionBattery = [];
        this.environmentBattery = [];
    },

    extractEnvironmentVariables: function(originalObject) {
        if(!_.has(originalObject, "environment") || !_.isArray(originalObject["environment"])) {
            //Invalid definition of environment
            //TODO: Report error parsing
            return [];
        }

        //Has environmnet definition and its an array
        var environmentVariables = originalObject["environment"];
        var environmentDefinitionToReturn = [];

        _.each(environmentVariables, function(envVarDef) {
            if(_.isString(envVarDef) && /^.*\=.*$/.test(envVarDef)) {
                //Its a valid definition
                environmentDefinitionToReturn.push(envVarDef);
            } else {
                //TODO: Report bad definition of environment variable
            }
        });

        return environmentDefinitionToReturn;
    },

    /**
     * Replace the link references on the configuration between
     * suites
     * @return void
     */
    replaceReferenceConfigurations: function(suiteKey) {
        var self = this;
        var properties = _.keys(this.nativeObject["suites"][suiteKey]);

        _.each(properties, function(property){
            var valueToCheck = self.nativeObject["suites"][suiteKey][property];
            if(_.isString(valueToCheck) && S(valueToCheck).startsWith("@")) {

                var rePattern = new RegExp(/^\@(.*)$/);
                var arrMatches = valueToCheck.match(rePattern);

                if(arrMatches.length>1) {
                    var suiteReferenced = arrMatches[1];

                    /*
                     * Searching for referenced value on other suito
                     */
                     if(_.has(self.nativeObject["suites"], suiteReferenced)) {
                        var referencedSuiteConfiguration = self.nativeObject["suites"][suiteReferenced];

                        if(_.has(referencedSuiteConfiguration, property)) {
                            //Copying property
                            self.nativeObject["suites"][suiteKey][property] = self.nativeObject["suites"][suiteReferenced][property];
                        } else {
                            //TODO: Property reference on suite cannot be found, report it
                        }

                     } else {
                        //TODO: Referenced suite cannot be found
                     }

                }
            }
        });
    },

    /**
     * Finds the image of docker to apply to the suite item
     *
     * @return String
     */
    whichImage: function(image) {
        var self = this;
        var image_repository = this.container.getParameter("image_repository");
        if(_.has(image_repository, image)) {

            //The image key exists can be a string with the name of the image or a full object
            if(_.isString(image_repository[image])) {
                return image_repository[image];
            } else {
                //Adding provision extra on the image , or environment extra on the image
                if(_.has(image_repository[image], "provision")) {
                    _.each(image_repository[image]["provision"], function(provisionCmd) {
                        self.provisionBattery.push(provisionCmd);
                    })
                }

                if(_.has(image_repository[image], "environment")) {
                    _.each(image_repository[image]["environment"], function(environmentInit) {
                        self.environmentBattery.push(environmentInit);
                    })
                }

                return image_repository[image]["image"];
            }


        } else {
            return image;
        }
    }

});

module.exports = configurationParserClass;


