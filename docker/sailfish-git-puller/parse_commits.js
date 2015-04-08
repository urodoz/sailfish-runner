var fs = require('fs');
var S = require("string");
var _ = require("underscore");
var jf = require('jsonfile');
var sys = require('sys');
var exec = require('child_process').exec;


var inputFile = "/workspace/sailfish_branches.json";
var outputFile = "/workspace/sailfish_commits.json";


var branches = jf.readFileSync(inputFile);

var outputObject = {};

var parseBranch = function(branch, callback) {
    var shellCommand = 'git rev-list --format=%B --max-count=100 origin/'+branch;
    exec(shellCommand, function(error, stdout, stderr) {
        var output = stdout;
        if(_.isEmpty(output)) output = stderr;

        var splitOutput = output.split("commit");

        var trimmedOutput = [];
        _.each(splitOutput, function(line) {
            var newTrimmedItem = S(line).trim().s;
            if(!_.isEmpty(newTrimmedItem)) trimmedOutput.push(line);
        });

        //TODO: Support multi line on commits

        var parsedOutput = [];
        _.each(trimmedOutput, function(line) {
            var line = line.replace("\n\n", "");
            var explodedLine = line.split("\n");
            parsedOutput.push({
                "commit": S(explodedLine[0]).trim().s,
                "description": S(explodedLine[1]).trim().s
            });
        });

        outputObject[branch] = parsedOutput;

        callback();
    });
}

var currenIndex = 0;

var doNext = function() {
    if(currenIndex<branches.length) {
        parseBranch(branches[currenIndex], function() {
            currenIndex++;
            doNext();
        })
    } else {
        jf.writeFileSync(outputFile, outputObject);
    }
}

doNext();