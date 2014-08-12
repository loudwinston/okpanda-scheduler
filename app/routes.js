var models = require("./models.js");
var http = require("http");
var populate = require("./populate.js");
var moment = require("moment");
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
	models.User.findOne({ username: teacherUsername }).exec(function(err, teacher) {
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
		models.ScheduleSlot.find(query).lean().exec(function(err, slots) {
			console.log("slots is " + slots)
			cb({ teacher: teacher, slots: slots, startDate: week.first });	
		})
		
	})
}


exports.setupRoutes = function(app) {
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

		models.User.find({isTeacher: true}, function(err, teachers) {
			console.log("Teachers is " + teachers);
			res.render("teachers", { teachers: teachers });
		})


		
	})

	//Display a list of logins and let the user choose one to use for their session
	app.get("/login", function(req, res) {
		models.User.find({}).lean().exec(function(err, users) {
			res.render("login", { users: users });	
		})
	})

	//Log a user in with the provided username
	//Sets the username on their session
	//This should really be a POOST
	app.get("/login/:username", function(req, res) {
		models.User.findOne({ username: req.params.username }).lean().exec(function(err, user) {
			console.log("User logged in successfully");
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
		models.User.find({isTeacher: true}).exec(function(err, teachers) {
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

		models.User.findOne({username: req.session.username}).exec(function(err, teacher) {
			new models.ScheduleSlot({
				time: date,
				teacher: teacher
			}).save(function() {
				//TODO: Check for errors, send proper HTTP code
				res.end("{ success: true }")
			})
		});
	})



	app.get("/slots", function(req, res) {
		models.ScheduleSlot.find({}).lean().exec(function(err, slots) {
			res.end(JSON.stringify(slots));
		})
	})

	
	

	app.post("/student/claimSlot/:slotId", function(req, res) {
		var slotId = req.params.slotId;

		models.User.findOne({ username: req.session.username }).exec(function(err, student) {
			models.ScheduleSlot.update({ _id: slotId }, { $set: { student: student }}, function(err, slot) {
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


	app.get("/populate", function(req, res) {
		populate.clean().then(populate.populate).then(function() {
			res.end("Database repopulated successfully");
		})
	})

}