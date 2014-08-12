var models = require("./models.js");
var Promise = require("bluebird");

exports.clean = function() {
	return new Promise(function(resolve, reject) {
		console.log("Cleaning database");
		models.User.remove({}, function(err) {
			if (err) reject(err);
			models.ScheduleSlot.remove({}, function(err) {
				if (err) reject(err);
				else resolve()
			})
		})
	})
}
exports.populate = function() {
	
	
	return new Promise(function(resolve, reject) {
		var defaultUsers = require("./defaultData.js").users;
		models.User.create(defaultUsers, function(err) {
			if (err) reject(err);
			console.log("Created teacher and student, inserting schedule slot");
			
			models.User.findOne({ username: "aeinstein "}).exec(function(err, einstein) {
				new models.ScheduleSlot({
					time: new Date(),
					teacher: einstein
				}).save(function(err, res) {
					resolve();
				});
			})						

		})
	})
}