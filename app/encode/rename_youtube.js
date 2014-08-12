var fs = require("fs");
var walk = require("walk");

var SOURCE_PATH = "/Users/winston/Downloads/karaoke";
var walker = walk.walk(SOURCE_PATH, {});


String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


	
walker.on("file", function (root, stats, next) {		
	


	var parts = stats.name.split(".");
	var newName = stats.name;
	if (parts[0].trim() != parts[0]) {
		newName = parts[0].trim() + ".youtube.mp4";
	}

	
	
	var oldPath= SOURCE_PATH + "/" + stats.name;
	var newPath = SOURCE_PATH + "/" + newName;
	
	if (oldPath != newPath) {
		console.log(stats.name);
		fs.renameSync(oldPath, newPath);
	}
	
	next();
});