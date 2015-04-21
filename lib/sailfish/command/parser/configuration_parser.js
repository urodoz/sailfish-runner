var _ = require("lodash"),
    S = require("string"),
    serviceInjectorClass = require("sailfish/command/parser/service_injector");

var configurationParser = function(container, nativeObject) {

    this.provisionBattery = [];
    this.environmentBattery = [];

    this.parse = function() {

        //Create the object and start parsing by steps
        this.parsedObject = {
            "suites": {}
        };

        this.addSailfishStamp()
            .addSuites()
            .parseSuites()
            ;

        return this.parsedObject;
    };

    this.addSailfishStamp = function() {
        this.parsedObject._type = "Sailfish runner configuration";
        this.parsedObject._version = container.getParameter("VERSION");
        return this;
    };

    this.addSuites = function() {
        if(_.has(nativeObject, "suites")) {
            var suiteKeys = _.keys(nativeObject.suites);
            this._suiteKeys = suiteKeys; //Storing on the current instance (shortcut to suite keys)
            suiteKeys.forEach(function(suiteKey) {
                this.parsedObject.suites[suiteKey] = {};
            }, this);
        }
        return this;
    };

    this.parseSuites = function() {
        this._suiteKeys.forEach(function(suiteKey) {
            this.parseSuite(suiteKey);
        }, this);
    };

    this.parseSuite = function(suiteKey) {
        var self = this;
        var resultObject = {};
        var originalObject = nativeObject.suites[suiteKey];
        var serviceInjector = new serviceInjectorClass(container);

        this.replaceReferenceConfigurations(suiteKey);

        //Image
        resultObject.image = this.whichImage(originalObject.image);

        //Provision
        resultObject.provision = self.provisionBattery;
        if(_.has(originalObject, "provision")) {
            _.each(originalObject.provision, function(provisionCmd) {
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
        extractedEnvironment.forEach(function(envDefinition) {
            resultObject.environment.push(envDefinition);
        });

        //Command
        if(_.has(originalObject, "command")) {
            resultObject.command = originalObject.command;
        }

        //Services
        resultObject.containers = {};
        if(_.has(originalObject, "services") && _.isArray(originalObject.services)) {
            originalObject.services.forEach(function(serviceName) {
                resultObject.containers = _.extend(resultObject.containers, serviceInjector.configure(serviceName));
            });
        }

        //After services, attach extra containers if defined (this container can link to current services)
        if(_.has(originalObject, "containers")) {
            var containerKeysOriginalObject = _.keys(originalObject.containers);

            containerKeysOriginalObject.forEach(function(containerKey) {
                var containerOriginalConfiguration = originalObject.containers[containerKey];
                //Replace image
                containerOriginalConfiguration.image = this.whichImage(containerOriginalConfiguration.image);
                resultObject.containers[containerKey] = containerOriginalConfiguration;
            }, this);

        }


        //Remove empty objects if any
        if(_.isEmpty(resultObject.provision)) resultObject = _.omit(resultObject, "provision");
        if(_.isEmpty(resultObject.environment)) resultObject = _.omit(resultObject, "environment");
        if(_.isEmpty(resultObject.containers)) resultObject = _.omit(resultObject, "containers");

        this.parsedObject.suites[suiteKey] = resultObject;

        //Clear batteries
        this.provisionBattery = [];
        this.environmentBattery = [];
    };

    this.extractEnvironmentVariables = function(originalObject) {
        if(!_.has(originalObject, "environment") || !_.isArray(originalObject.environment)) {
            //Invalid definition of environment
            //TODO: Report error parsing
            return [];
        }

        //Has environmnet definition and its an array
        var environmentVariables = originalObject.environment;
        var environmentDefinitionToReturn = [];

        environmentVariables.forEach(function(envVarDef) {
            if(_.isString(envVarDef) && /^.*\=.*$/.test(envVarDef)) {
                //Its a valid definition
                environmentDefinitionToReturn.push(envVarDef);
            } else {
                //TODO: Report bad definition of environment variable
            }
        });

        return environmentDefinitionToReturn;
    };

    /**
     * Replace the link references on the configuration between
     * suites
     * @return void
     */
    this.replaceReferenceConfigurations = function(suiteKey) {
        var properties = _.keys(nativeObject.suites[suiteKey]);

        properties.forEach(function(property){
            var valueToCheck = nativeObject.suites[suiteKey][property];
            if(_.isString(valueToCheck) && S(valueToCheck).startsWith("@")) {

                var rePattern = new RegExp(/^\@(.*)$/);
                var arrMatches = valueToCheck.match(rePattern);

                if(arrMatches.length>1) {
                    var suiteReferenced = arrMatches[1];

                    /*
                     * Searching for referenced value on other suito
                     */
                     if(_.has(nativeObject.suites, suiteReferenced)) {
                        var referencedSuiteConfiguration = nativeObject.suites[suiteReferenced];

                        if(_.has(referencedSuiteConfiguration, property)) {
                            //Copying property
                            nativeObject.suites[suiteKey][property] = nativeObject.suites[suiteReferenced][property];
                        } else {
                            //TODO: Property reference on suite cannot be found, report it
                        }

                     } else {
                        //TODO: Referenced suite cannot be found
                     }

                }
            }
        }, this);
    };

    /**
     * Finds the image of docker to apply to the suite item
     *
     * @return String
     */
    this.whichImage = function(image) {
        var image_repository = container.getParameter("image_repository");
        if(_.has(image_repository, image)) {

            //The image key exists can be a string with the name of the image or a full object
            if(_.isString(image_repository[image])) {
                return image_repository[image];
            } else {
                //Adding provision extra on the image , or environment extra on the image
                if(_.has(image_repository[image], "provision")) {
                    image_repository[image].provision.forEach(function(provisionCmd) {
                        this.provisionBattery.push(provisionCmd);
                    });
                }

                if(_.has(image_repository[image], "environment")) {
                    image_repository[image].environment.forEach(function(environmentInit) {
                        this.environmentBattery.push(environmentInit);
                    }, this);
                }

                return image_repository[image].image;
            }


        } else {
            return image;
        }
    };

};

module.exports = function(container, nativeObject) {
    return new configurationParser(container, nativeObject);
};


