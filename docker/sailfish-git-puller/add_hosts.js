var _ = require("underscore");
var fs = require("fs");

var sailfishHosts = process.env.SAILFISH_HOSTS;

if(!_.isEmpty(sailfishHosts)) {

    var splittedHosts = sailfishHosts.split(",");
    fs.appendFileSync("/etc/hosts", "\n"); //Add new line to hosts
    _.each(splittedHosts, function(hostDefinition) {
        if(/^.*=[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$/.test(hostDefinition)) {
            var hostDup = hostDefinition.split("="); //From host.name={IP} to [host.name, IP]
            fs.appendFileSync("/etc/hosts", hostDup[1]+"  "+hostDup[0]+"\n");
        }
    });

}