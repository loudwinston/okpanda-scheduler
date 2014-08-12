var fs = require("fs");
var walk = require("walk");

var BASE_PATH = "/Users/winston/Downloads/new_karaoke/mp4";
var walker = walk.walk(BASE_PATH, {});

	
walker.on("file", function (root, stats, next) {		
	var newName = stats.name;
	if (newName.indexOf(".youtube") != -1) {
		var parts = newName.split(".");
		newName = parts[0] + ".youtube.mp4";
	}
	else if (newName.indexOf(".avi.mp4") != -1) {
		var parts = newName.split(".");
		newName = parts[0] + ".mp4";
	}

	if (newName.indexOf(".output") != -1 || newName.indexOf(".avi") != -1) {
		console.log("oh shit");
		console.log(newName);

		process.exit();
	}

	var oldPath= BASE_PATH + "/" + stats.name;
	var newPath = BASE_PATH + "/" + newName;
	

	fs.renameSync(oldPath, newPath);

	
	next();
});