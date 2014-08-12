var express = require("express");
var Promise = require("bluebird");
var co = Promise.coroutine;
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
co(function* (){
	

	var UserSchema = new Schema({
		name: String,
		isTeacher: boolean
	})

	var SlotSchema = new Schema({
		startTime: Date,
		team: { type: Schema.ObjectId, ref:'User'}
	})

	var UserModel = mongoose.model('User', UserSchema);
	var SlotSchema = mongoo.semodel('Slot', SlotSchema);

	//TODO: Make this based on environment variable
	var connection = mongoose.createConnection("mongdb://localhost/okpanda");




	var app = express();

	app.set('port', config.port);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.favicon("/public/favicon.ico"));

	app.use('/public', express.static("public"));


	app.get("/", function(req, res) {
		res.end("App is running, yay!");
	})


	var httpServer = http.createServer(app);
	yield httpServer.listen(app.get("port"));
	yield socketio.listen(httpServer);
	console.log('Server ready and listening on port ' + app.get('port'));

});



