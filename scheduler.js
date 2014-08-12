var express = require("express");
var Promise = require("bluebird");
var co = Promise.coroutine;
var mongoose = require("mongoose");
var http = require("http");
var Schema = mongoose.Schema;

var bluebird = require("bluebird");
var session = require('express-session')






var models = require("./app/models.js");
var commandLineArgs = require("./app/commandLineArgs.js");
var middleware = require("./app/middleware.js");
var populate = require("./app/populate.js");
var routes = require("./app/routes.js");

var mongoUri = process.env.MONGOLAB_URI || "mongodb://localhost/okpandascheduler"





function startApp() {

	return new Promise(function(resolve, reject) {
		var app = express();

		app.set('port', process.env.PORT || 3000);
		app.set('views', __dirname + '/views');
		app.set('view engine', 'ejs');
		app.use(express.logger('dev'));
		app.use(express.bodyParser());
		app.use(session({secret: 'okpandascheduler12345'}))
		app.use(middleware.domainError);
		app.use('/public', express.static("public"));
		app.use(middleware.checkLogin);
		app.use(middleware.checkTeacher);

		routes.setupRoutes(app);

		
		var httpServer = http.createServer(app);
		httpServer.listen(app.get("port"), function(err) {
			if (err) reject(err);
			console.log('Server ready and listening on port ' + app.get('port'));
			resolve();
		});	
	
	})

}





function connectToMongo() {

	return new Promise(function(resolve, reject) {
		mongoose.connect(mongoUri, function(err) {
			if (err) reject(err);

			console.log("Success connecting to mongo");

			
			resolve();		
		})
	});
}

//Start the app
connectToMongo()
.then(function() {
	if (commandLineArgs.clean) {
		return populate.clean()
	}
}).then(function() {
	if (commandLineArgs.populate) {
		return populate.populate();
	}
}).then(startApp);



