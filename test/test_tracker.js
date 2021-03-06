var assert = require("chai").assert,
    currentDir = __dirname,
    sys = require('sys'),
    exec = require('child_process').exec,
    uuid = require("node-uuid"),
    fs = require("fs-extra"),
    Mustache = require("mustache"),
    _ = require("lodash");

/**
 * @code
 * NODE_PATH=$NODE_PATH:./lib node_modules/.bin/mocha --recursive test/test_tracker.js
 * @endcode
 */
describe("tracker", function() {

    it('input set 1', function(done) {

        var randomOutput = "/tmp/"+uuid.v4()+".json";
        var inputFile = currentDir+"/sets/tracker/input_set_1.json";
        var child = exec('node '+currentDir+'/../tracker.js --input='+inputFile+' --output='+randomOutput+' ', function(error, stdout, stderr) {
            if (error !== null) {
                throw Error(error);
            }

            //load the output
            var outputJSON = require(randomOutput);

            assert.ok(_.isArray(outputJSON));
            assert.equal(3, outputJSON.length);

            //First command - ps aux
            var command1 = outputJSON[0];
            assert.equal("ps aux", command1["command"]);
            assert.equal("provision", command1["phase"]);
            assert.ok(_.isNumber(command1["duration"]));
            assert.ok(!_.isEmpty(command1["stdout"]));
            var b = new Buffer(command1["stdout"], 'base64');
            var s = b.toString();

            //Second command - ls -lah /tmp
            var command2 = outputJSON[1];
            assert.equal("ls -lah /tmp", command2["command"]);
            assert.equal("commands", command2["phase"]);
            assert.ok(_.isNumber(command2["duration"]));
            assert.ok(!_.isEmpty(command2["stdout"]));
            var b = new Buffer(command2["stdout"], 'base64');
            var s = b.toString();

            //Third command - whoami
            var command3 = outputJSON[2];
            assert.equal("whoami", command3["command"]);
            assert.equal("beforeClose", command3["phase"]);
            assert.ok(_.isNumber(command3["duration"]));
            assert.ok(!_.isEmpty(command3["stdout"]));
            var b = new Buffer(command3["stdout"], 'base64');
            var s = b.toString();

            done();
        });

    });

    it("check output logging", function(done) {

        var randomOutput = "/tmp/"+uuid.v4()+".json",
            logFile = "/tmp/"+uuid.v4()+".log",
            inputFile = currentDir+"/sets/tracker/input_set_2.json",
            cmdTpl = 'node {{&trackerPath}} --input={{&inputFile}} --output={{&outputFile}} --log={{&logFile}}',
            execCommand = Mustache.render(cmdTpl, {
                trackerPath: currentDir+"/../tracker.js",
                inputFile: inputFile,
                outputFile: randomOutput,
                logFile: logFile
            });
        var child = exec(execCommand, function(error, stdout, stderr) {

            var bufferContent = fs.readFileSync(logFile);
            var utf8Content = bufferContent.toString('utf-8');

            var contentArray = utf8Content.split('\n');

            assert.equal('provision_step', contentArray[0]);
            assert.equal('commands_step', contentArray[1]);
            assert.equal('beforeClose_step', contentArray[2]);

            done();
        });

    });


});