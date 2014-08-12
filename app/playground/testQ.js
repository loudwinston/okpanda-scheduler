var Q = require ("q");
var fs = require("fs");
var sqlite3 = require('sqlite3').verbose();
var prompt = require("./lib/promisePrompt.js");
var promiseWrapper = require("./lib/promiseWrapper.js");




var dbFile = "testQ.db";
if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);


var db = new sqlite3.Database(dbFile);
var promisedDB = promiseWrapper(db, ['get', 'run']);

db.serialize();

//this is the goal
Q()
.then( 
	promisedDB.run("CREATE TABLE songs (path TEXT, filename TEXT, artist TEXT, title TEXT, displayName TEXT, lyrics TEXT)") 
)
//.then( promisedDB.run("INSERT INTO songs (artist, title) VALUES ('The Joes', 'My Name is so generic')") )
.then( 
	promisedDB.run("INSERT INTO songs (artist, title) VALUES (?, ?)", ['Bob smith and his orchestra', 'goddammit we suck']) 
)
.then(
	promisedDB.get("SELECT * FROM songs")
)
.then(function(item) { 
	console.log("got item " + JSON.stringify(item)); 
})
.then(
	prompt("Please press a buttons")
)
.then (
	function() { console.log("Complete!"); 
})
.catch(function(err) {
	console.log("CAUGHT ERROR : " + err);
})
.fail(function(err) {
	console.log("FAIL:" + err);
});
