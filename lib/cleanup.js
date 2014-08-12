module.exports = function(filename) {
	if (!filename) {
		return null;
	}

	var songmeta = {
		artist: null,
		title: null,
		path: filename
	}

	songmeta.source = filename.endsWith(".youtube.mp4") ? "youtube" : "cdg";
	
	var newName = filename;
	

	if (newName.contains("Karaoke") && newName.toLowerCase().contains("you sing the hits") && !(newName.contains("Karaoke - You Sing"))) {
		var parts  = newName.split("Karaoke");
		var title = parts[0].trim();
		var artist = parts[1].substring(0, parts[1].toLowerCase().indexOf("you sing the hits")).trim();
		newName = artist + " - " + title;;	
	}


	if (newName.startsWith("Karaoke") && songmeta.source == "youtube" ) {
		newName = newName.replace("Karaoke", "");
		
		if (newName.contains("-")) {
			var parts = newName.split("-");
			var first = parts[0].trim();
			var second = parts[1].trim();
			parts = [ second, first ];
			newName = parts.join(" - ");
		}
		
		newName += ".youtube.mp4";
	}
	newName = newName.replace(/karaoke hd video/gi, "");
	newName = newName.replace(/karaoke video with lyrics/gi, "");
	newName = newName.replace(/karaoke video/gi, "");
	newName = newName.replace(/karoke video/gi, "");
	newName = newName.replace(/karaoke/gi, "");
	newName = newName.replace(/video HD/gi, "");
	newName = newName.replace(/\-  HD/gi, "");
	newName = newName.replace(/with lyrics/gi, "");
	newName = newName.replace(/lyrics/gi, "");
	 


	if (newName.contains("(In the style of")) {
		//The Greatest Love of All  (In the style of Whitney Houston).youtube.mp4
		newName = newName.replace("(In the style of", "(--");
		//The Greatest Love of All  (--Whitney Houston).youtube.mp4
		var parts = newName.split("(--");
		var artist = parts[1];
		var title = parts[0].trim();

		artist = artist.replace(").youtube.mp4", "").trim();
		newName = artist + " - " + title + ".youtube.mp4";
		//console.log("***FIXED TO " + newName);

	}

	if (newName.toLowerCase().contains("in the style of")) {
		//console.log("fixing song " + newName);
		newName = newName.replace(".youtube.mp4", "");
		var pos = newName.toLowerCase().indexOf("in the style of");
		var part1 = newName.substring(0, pos-1);
		var part2 = newName.substring(pos +1+ "in the style of".length, newName.length);

		newName = part2 + " - " + part1;
		

		if (newName.contains("(no lead vocal)")) {
			newName = newName.replace("(no lead vocal)", "");
		}
		if (newName.contains("(with lead vocal)")) {
			newName = newName.replace("(with lead vocal)", "");
			songmeta.hasLeadVocals = true;
		}
		newName = newName.replace(/\s+/gi, " ");
		newName = newName.trim();

		//console.log("Fixed in the style of song: " + newName);
	}

	if (newName.search(/with lead vocal/g) != -1) {
		songmeta.hasLeadVocals = true;
	}


	//todo: remove Feat.youtube.mp4
	//remove dupes + copies
	var remove = [
		".youtube",
		".mp4",
		"[Karaoke]",
		"[karaoke]",
		'.youtube.mp4',
		"karaoke video with lyrics",
		"karaoke sing along with lyrics",
		"karaoke video",
		"(no lead vocal)",
		"(with lead vocal)",
		"karaoke lyrics",
		"- Karaoke HD(",
		"with lyrics",
		"Karaoke HD",
		"(Karaoke)",
		"[Karaoke"
	];

	for (var i = 0; i < remove.length; i++) {

		var str= remove[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		var regexp = new RegExp(str, "gi")
		newName = newName.replace(regexp, "");
	}

	//fix apostrophes
	var fix_apostrophes = {
		"I ll": "I'll",
		"It s" : "It's",
		"Can t"  : "Can't",
		"Don t" : "Don't",
		"That s" : "That's",
		"Should ve" : "Should ve",
		"T s" : "Ts",

	}

	for (var key in fix_apostrophes) {
		//var search= key.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + " "
		var search = key + " ";
		var replace = fix_apostrophes[key] + " ";
		newName = newName.replace( new RegExp(search, "g"), replace);
	}

	newName = newName.trim();
	newName = newName.replace(") -", " -");
	newName = newName.replace(/(\-(\s)*)+/gi, "- ");
	newName = newName.replace(/\-\(/gi, "(");
	newName = newName.replace(/\s+/gi, " ");
	newName = newName.trim();


	newName = newName.replace("[]", "");
	newName = newName.replace("()", "");


	if (newName.contains("-")) {
		var parts = newName.split("-");
		songmeta.title = parts.pop().trim();
		songmeta.artist = parts.join(" ").trim();
	}
	else {
		songmeta.title = newName;
	}

	if (songmeta.hasLeadVocals) {
		songmeta.title += " (with lead vocals)";
		newName += " (with lead vocals)";
	}


	
	

	songmeta.displayName = newName;
	songmeta.displayName = songmeta.displayName.trim();

	if (songmeta.displayName.startsWith("-")) {
		songmeta.displayName = songmeta.displayName.replace("-", "");
	}
	if (songmeta.artist && songmeta.artist.startsWith("-")) {
		songmeta.artist = songmeta.artist.replace("-", "");
	}

	return songmeta;	
}