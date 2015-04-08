var fs = require('fs');
var S = require("string");
var _ = require("underscore");
var jf = require('jsonfile');

fs.readFile('sailfish_branches.output', 'utf8', function (err,data) {

    var output = data.split("\n");

    var trimmedOutput = [];
    _.each(output, function(line) {
        var trimmedItem = S(line).trim().s;
        if(!_.isEmpty(trimmedItem) && !/^.*\/HEAD.*$/.test(trimmedItem)) {
            trimmedOutput.push(trimmedItem.replace("origin/", ""));
        }
    });

    var finalOutput = [];
    _.each(trimmedOutput, function(trimmedItem) {
        var splitItem = trimmedItem.split("\t");
        var pathRepoBranch = splitItem[1].split("/");
        finalOutput.push(pathRepoBranch[pathRepoBranch.length-1]);
    });

    jf.writeFileSync("/workspace/sailfish_branches.json", finalOutput);

});