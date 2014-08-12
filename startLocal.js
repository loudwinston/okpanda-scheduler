var forever = require("forever-monitor");
var fs = require("fs");
if (!fs.existsSync("./mongodb.db")) {
	fs.mkdirSync("./mongodb.db");
}
var child = forever.start([ 'mongod', '--config', './mongodb.conf' ], {
    max : 1,
    silent : false
 });