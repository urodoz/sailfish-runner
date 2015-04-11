var fs = require('fs');
var jf = require('jsonfile');
var reader = require('./reader.js');

fs.readFile('sailfish_branches.output', 'utf8', function (err,data) {
    finalOutput = reader.parseBranchesOutput(data);
    jf.writeFileSync("/workspace/sailfish_branches.json", finalOutput);
});