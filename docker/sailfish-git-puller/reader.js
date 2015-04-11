var S = require("string");
var _ = require("underscore");

module.exports = {

    parseBranchesOutput: function(output) {
        var output = output.split("\n");

        var trimmedOutput = [];
        _.each(output, function(line) {
            var trimmedItem = S(line).trim().s;
            if(!_.isEmpty(trimmedItem) && !/^.*\/HEAD.*$/.test(trimmedItem) && !/.*Permanently\sadded.*/.test(trimmedItem)) {
                trimmedOutput.push(trimmedItem.replace("origin/", ""));
            }
        });

        var finalOutput = [];
        _.each(trimmedOutput, function(trimmedItem) {
            var splitItem = trimmedItem.split("\t"); //Should have a \t between commit and branch description

            if(splitItem.length===2) {
                var pathRepoBranch = splitItem[1].split("/");
                finalOutput.push(pathRepoBranch[pathRepoBranch.length-1]);
            }

        });

        return finalOutput;
    },

    parseCommitsOutput: function(stdout, stderr) {
        var output = stdout;
        if(_.isEmpty(output)) output = stderr;

        var splitOutput = output.split("\n");

        var trimmedOutput = [];
        splitOutput.forEach(function(line) {
            var newTrimmedItem = S(line).trim().s;
            if(!_.isEmpty(newTrimmedItem)) trimmedOutput.push(line);
        });

        //Detect pairs
        var pairIndexes = [];

        trimmedOutput.forEach(function(line, index) {
            if(/^commit\s[a-zA-Z0-9]+$/.test(line)) pairIndexes.push(index);
        });

        //Group information from pair index until end or next pair index
        var commits = [];
        pairIndexes.forEach(function(pairIndex, index) {
            var commitObject = {
                commit: trimmedOutput[pairIndex].replace("commit ", ""),
                lines: []
            }

            if(_.has(pairIndexes, index+1)) {
                //Is not the last one, all the lines until the next pairIndex should be added to the commit information
                for(var i = pairIndex+1; i < pairIndexes[index+1]; i++) {
                    if(_.has(trimmedOutput, i)) commitObject.lines.push(trimmedOutput[i]);
                }
            } else {
                //If the last pairIndex, all the remaining lines should be added to the commit information
                for(var i = pairIndex+1; i < trimmedOutput.length; i++) {
                    if(_.has(trimmedOutput, i)) commitObject.lines.push(trimmedOutput[i]);
                }
            }

            commits.push(commitObject);
        });

        var parsedOutput = [];

        commits.forEach(function(commitObject) {
            parsedOutput.push({
                "commit": S(commitObject.commit).trim().s,
                "description": commitObject.lines.join("\n")
            });
        });

        return parsedOutput;
    }

}