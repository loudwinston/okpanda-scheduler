var express = require("express");
var Promise = require("bluebird");
var co = Promise.coroutine;
var mongoose = require("mongoose");
var http = require("http");
var Schema = mongoose.Schema;
var program = require("commander");
var bluebird = require("bluebird");
var session = require('express-session')
var domainError = require("./lib/domainErrorMiddleware.js")
var moment = require("moment");


program
	  .version('0.0.1')
	  .option('--clean', 'Delete the database on startup')
	  .parse(process.argv);

var mongoUri = process.env.MONGOLAB_URI || "mongodb://localhost/okpandascheduler"


var User = mongoose.model("User", new Schema({
	name: String,
	username: String,
	isTeacher: Boolean	
}));

var ScheduleSlot = mongoose.model("ScheduleSlot", new Schema({
	time: Date, //indicates when the slot starts.  all slots are 30 minutes
	teacher: { type: Schema.ObjectId, ref: 'User'},
	student: { type: Schema.ObjectId, ref: 'User'},

}));



//Returns an object like with first and last properites, indicating the first and last days of the week

function getWeekBounds(date) {
	var first = date.getDate() - date.getDay(); // First day is the day of the month - the day of the week
	var last = first + 6; // last day is the first day + 6

	var firstOfWeek = new Date(date.setDate(first));
	var lastOfWeek = new Date(date.setDate(last));

	//TODO: probably need to add hours to lastOfWeek so its equal to 11:59pm
	return {
		first: firstOfWeek,
		last: lastOfWeek
	}

}

function checkLogin(req, res,next) {
	
	var isHome = req.url == '/';
	var isLoginPage = req.url.indexOf("/login") == 0;
	
	var userLoggedIn = req.session && req.session.username;

	//allow the request to continue if isLoginPagin || isLoginAttempt || userLoggedIn
	if (userLoggedIn || isLoginPage) {
		console.log("user is logged in");
		next();
	}
	else {
		res.redirect("/login");
	}
}

function checkTeacher(req, res, next) {
	var isTeacherPage = req.url.indexOf("/teacher") == 0;
	if (isTeacherPage && !req.session.isTeacher) {
		res.status(403).end('Permission Denied');
	}
	else {
		next();
	}
}


function getDateFromRequest(req) {
	var date = null;
	if (req.params.date) {
		date = new Date(parseInt(req.params.date));
	}
	else {
		date = new Date();
	}
	return date;
}



//TODO: Handle errors
//TODO: Load associations in mongo query
function getTeacherSchedule(teacherUsername, date, openOnly, cb) {
	//Get the teacher
	User.findOne({ username: teacherUsername }).exec(function(err, teacher) {
		var week = getWeekBounds(date);

		

		var query = {};
		query.time = {
			"$gte": week.first,
			"$lte": week.last
		}

		if (openOnly) {
			query.student = null
		}
		//get the teacheres schedule slots
		ScheduleSlot.find(query).lean().exec(function(err, slots) {
			console.log("slots is " + slots)
			cb({ teacher: teacher, slots: slots, startDate: week.first });	
		})
		
	})
}



function startApp() {

	return new Promise(function(resolve, reject) {
		var app = express();

		app.set('port', process.env.PORT || 3000);
		app.set('views', __dirname + '/views');
		app.set('view engine', 'ejs');
		app.use(express.logger('dev'));
		app.use(express.bodyParser());
		app.use(session({secret: 'okpandascheduler12345'}))
		app.use(domainError);
		app.use('/public', express.static("public"));
		app.use(checkLogin);
		app.use(checkTeacher);


		

		app.get("/", function(req, res) {
			if (req.session.isTeacher) {
				res.redirect("/teacher");
			}
			else {
				res.redirect("/student");
			}
		})

		//SHows a list of all teachers
		app.get("/teachers", function(req, res) {

			User.find({isTeacher: true}, function(err, teachers) {
				console.log("Teachers is " + teachers);
				res.render("teachers", { teachers: teachers });
			})


			
		})

		//Display a list of logins and let the user choose one to use for their session
		app.get("/login", function(req, res) {
			User.find({}).lean().exec(function(err, users) {
				res.render("login", { users: users });	
			})
		})

		//Log a user in with the provided username
		//Sets the username on their session
		//This should really be a POOST
		app.get("/login/:username", function(req, res) {
			User.findOne({ username: req.params.username }).lean().exec(function(err, user) {
				req.session.username = user.username;
				req.session.isTeacher = user.isTeacher;
				res.redirect("/");
			})
		})

		app.get("/logout", function(req, res) {
			if (req.session) {
				req.session.destroy();	
			}
			res.redirect("/");
		})
		
		//Shows the schedule for a particular teacher
		app.get("/schedule/:teacher/:date?", function(req, res) {
			var date = getDateFromRequest(req);
			
			getTeacherSchedule(req.params.teacher, date, true, function(scheduleInfo) {
				res.render("teacher", { 
					date: scheduleInfo.startDate, 
					isTeacher: false , 
					teacher: scheduleInfo.teacher, 
					slots: scheduleInfo.slots,
					moment: moment
				})
			});
		})


		app.get("/student", function(req, res) {
			User.find({isTeacher: true}).exec(function(err, teachers) {
				res.render("student", { teachers: teachers });		
			})
		
		})

		app.get("/teacher/:date?", function(req, res) {
			var date = getDateFromRequest(req);

			getTeacherSchedule(req.session.username, date, false, function(scheduleInfo) {
				res.render("teacher", { 
					date: scheduleInfo.startDate, 
					isTeacher: true , 
					teacher: scheduleInfo.teacher, 
					slots: scheduleInfo.slots,
					moment: moment
				})
			});
		})
		
		//Time should be a UNIX timestamp
		app.post("/teacher/createSlot/:date", function(req, res) {
			var date = getDateFromRequest(req);

			User.findOne({username: req.session.username}).exec(function(err, teacher) {
				new ScheduleSlot({
					time: date,
					teacher: teacher
				}).save(function() {
					//TODO: Check for errors, send proper HTTP code
					res.end("{ success: true }")
				})
			});
		})



		app.get("/slots", function(req, res) {
			ScheduleSlot.find({}).lean().exec(function(err, slots) {
				res.end(JSON.stringify(slots));
			})
		})

		
		

		app.post("/student/claimSlot/:slotId", function(req, res) {
			var slotId = req.params.slotId;

			User.findOne({ username: req.session.username }).exec(function(err, student) {
				ScheduleSlot.update({ _id: slotId }, { $set: { student: student }}, function(err, slot) {
					if (err) {
						console.log("OH SHIT ERROR");
						res.end();
					}
					else {
						res.end("{ success: true }");
					}

				});	
		
			})
			
		})



		app.post("/deleteSlot", function(req, res) {

		})










		var httpServer = http.createServer(app);
		httpServer.listen(app.get("port"), function(err) {
			if (err) reject(err);
			console.log('Server ready and listening on port ' + app.get('port'));
			resolve();
		});	

	})

}

function setupDB() {
	
	if (!program.clean) return;
	return new Promise(function(resolve, reject) {
		console.log("Cleaning");
		
		User.remove({}, function(err) {
			if (err) reject(err);
			ScheduleSlot.remove({}, function(err) {
				if (err) reject(err);
				else {
					
					var defaultUsers = require("./defaultData.js").users;
					User.create(defaultUsers, function(err) {
						if (err) reject(err);
						console.log("Created teacher and student, inserting schedule slot");
						
						User.findOne({ username: "aeinstein "}).exec(function(err, einstein) {
							new ScheduleSlot({
								time: new Date(),
								teacher: einstein
							}).save(function(err, res) {
								resolve();
							});
						})


						

					})
				}
			})
		})
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
connectToMongo().then(setupDB).then(startApp);



