var fs = require("fs");
var walk = require("walk");


String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.startsWith = function(chars) {
    return this.indexOf(chars) == 0;
};

var optimist = require('optimist');
var options = optimist.argv;




var SOURCE_PATH = options.source || "/Volumes/250EXT/Karaoke/input";
var DEST_PATH = options.dest || "/Volumes/250EXT/Karaoke/output";

var PROCESSED_PATH = options.processed || "/Volumes/250EXT/Karaoke/processed_input";


var escapeShell = function(cmd) {
  return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
};


var filesToEncode = [];

	

//remove any spaces between name an extension
//rename .avi.mp4 to just .mp4
//rename .youtube.output.mp4 to just .youtube.mp4
function cleanup(basePath, cb) {
	var walker = walk.walk(basePath, {});

	walker.on("file", function(root, stats, next) {
		if (stats.name.startsWith(".")) {
			next();
			return;
		}


		var parts = stats.name.split(".");
		
		for (var i = 0; i < parts.length; i++) {
			parts[i] = parts[i].trim();
		}

		var newName = parts.join(".")

		if (newName.endsWith(".avi.mp4")) {
			newName = newName.replace(".avi.mp4", ".mp4");
		}

		if (newName.indexOf(".youtube") != -1) {
			newName = parts[0] + ".youtube.mp4";
		}


		var oldPath= basePath + "/" + stats.name;
		var newPath = basePath + "/" + newName;


		if (oldPath != newPath) {
			console.log("Renaming " + stats.name + " to " + newName);
			fs.renameSync(oldPath, newPath);
		}


		next();
	});
	walker.on("end", function() {
		if (cb) cb();
	});

}



function encode() {
	console.log("CHecking " + SOURCE_PATH);
	var walker = walk.walk(SOURCE_PATH, {});
	walker.on("file", function (root, stats, next) {	
		if (stats.name.startsWith(".")) {
			next();
			return;
		}	

		var targetName = stats.name;

		console.log("Found " + targetName);
		if (targetName.endsWith(".avi")) {
			targetName = stats.name.replace(".avi", ".mp4");
		}

		var oldPath= SOURCE_PATH + "/" + stats.name;
		var processedPath= PROCESSED_PATH + "/" + stats.name;
		var newPath = DEST_PATH + "/" + targetName;



		if (!fs.existsSync(newPath)) {
			//console.log("Need to encode " + stats.name);
			console.log("Target name is" + targetName);
			filesToEncode.push({
				source: oldPath,
				processed: processedPath,
				dest: newPath
			});
		}
		else {
			var processedPath = PROCESSED_PATH + "/" + stats.name;
			console.log("copying " + stats.name);
			fs.renameSync(oldPath, processedPath);
		}
	
		next();
	});

	walker.on("end", function() {
		
		console.log("Need to encode " + filesToEncode.length + " files");
		
		var execSync = require("exec-sync");

		for (var i = 0; i < filesToEncode.length; i++) {
			var file = filesToEncode[i];
			var output = file.source + ".output";

			execSync("/Users/winston/HandbrakeCLI -i '"+file.source+"' -o '"+output+"' -e x264 -q 30 -B 64 -Y 240 -I -O --loose-anamorphic --crop 0:0:0:0 1>> handbrake.log 2>&1");
			fs.renameSync(output, file.dest);
			fs.renameSync(file.source, file.processed);
		}
	});
}

encode();


