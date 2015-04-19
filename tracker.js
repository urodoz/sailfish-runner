/**
 * Tracker JS
 *
 * This script, executes a collection (serial) of scripts, and collects the output and
 * errors of each. Stores in a JSON object and outputs the result in a file
 *
 * Arguments:
 * --input={inputFilename} Array of string commands
 * --output={outputFilename} String which the result of all the scripts will be stored
 */
var _ = require("lodash"),
    async = require("async"),
    sys = require('sys'),
    exec = require('child_process').exec,
    jf = require('jsonfile'),
    argv = require('minimist')(process.argv.slice(2)),
    uuid = require("node-uuid"),
    t = require('exectimer');

if(!_.has(argv, "input") || !_.has(argv, "output")) {
    console.log("input and/or output argument does not exist");
    throw Error("Argument error");
}

var input = argv["input"],
    output = argv["output"],
    outputLog = output+".log",
    outputLogJson = [],
    inputJSON = require(input);

//Checking structure
if(!_.has(inputJSON, "provision") || !_.has(inputJSON, "commands") || !_.has(inputJSON, "beforeClose")) {
    throw Error("Bad file structure for input. The keys 'provision', 'commands' and 'beforeClose' must be defined");
}

//Checking types
if(!_.isArray(inputJSON["provision"])) throw Error("Input JSON.provision is not an array");
if(!_.isArray(inputJSON["commands"])) throw Error("Input JSON.commands is not an array");
if(!_.isArray(inputJSON["beforeClose"])) throw Error("Input JSON.beforeClose is not an array");

//Generating the array of commands to execute as serial
var commandArray = [];

["provision", "commands", "beforeClose"].forEach(function(phase) {
    _.each(inputJSON[phase], function(commandToExecute) {
        commandArray.push(function(callback){

            //Init time
            var uuidTimer = uuid.v4();
            var tick = new t.Tick(uuidTimer);
            tick.start();

            var child = exec(commandToExecute, function(error, stdout, stderr) {

                //Output to log archive
                outputLogJson.push({
                    stdout: stdout,
                    stderr: stderr
                });
                //Flush to archive
                jf.writeFileSync(outputLog, outputLogJson);

                var encoded_stdout = null;

                if(!_.isEmpty(stdout) || !_.isEmpty(stderr)) {
                    if (!_.isEmpty(stdout)) encoded_stdout = new Buffer(stdout).toString('base64');
                    if (!_.isEmpty(stderr)) encoded_stdout = new Buffer(stderr).toString('base64');
                }

                tick.stop();
                var commandTimer = t.timers[uuidTimer];
                var duration = (commandTimer.duration())/1000000; //To miliseconds

                callback(null, {"phase": phase, "command": commandToExecute, "stdout": encoded_stdout, "duration": duration});
            });
        });
    });
});

//Executing
async.series(commandArray, function(err, results){
    jf.writeFileSync(output, results);
});