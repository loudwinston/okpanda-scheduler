
var walk = require("walk");
var cleanup = require("./cleanup.js");
var models = require("./models.js");
var Promise = require("bluebird");
var co = Promise.coroutine;


module.exports = function(directory, lookup, insert) { 
	console.log("Checking directory " + directory);
	
	return new Promise(function(resolve, reject) {
		var walker = walk.walk(directory, { followLinks: false });
		var promises = [];

		walker.on("file", function (root, stats, next) {
			var fullpath = root + "/" + stats.name;
			
			promises.push(co(function*(){
				var found = yield lookup(fullpath);
				if (!found) {
					var song = yield getSongIfo(fullpath);
					yield insert(song);
				}
			}));
			next();		
		});

		walker.on("end", function () {
			Promise.all(promises)
			.then(resolve)
			.fail(reject);
		});
	});
};