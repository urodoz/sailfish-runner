var fs = require('fs');
var reader = require('./reader.js');
var jf = require('jsonfile');
var sys = require('sys');
var exec = require('child_process').exec;
var reader = require('./reader.js');

var inputFile = "/workspace/sailfish_branches.json";
var outputFile = "/workspace/sailfish_commits.json";

var branches = jf.readFileSync(inputFile);

var outputObject = {};

var parseBranch = function(branch, callback) {
    var shellCommand = 'git rev-list --format=%B --max-count=100 origin/'+branch;
    exec(shellCommand, function(error, stdout, stderr) {
        var parsedCommits = reader.parseCommitsOutput(stdout, stderr);
        outputObject[branch] = parsedCommits;
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