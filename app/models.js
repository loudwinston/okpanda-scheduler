var mongoose = require("mongoose");
var Schema = mongoose.Schema;


module.exports.User = mongoose.model("User", new Schema({
	name: String,
	username: String,
	isTeacher: Boolean	
}));

module.exports.ScheduleSlot = mongoose.model("ScheduleSlot", new Schema({
	time: Date, //indicates when the slot starts.  all slots are 30 minutes
	teacher: { type: Schema.ObjectId, ref: 'User'},
	student: { type: Schema.ObjectId, ref: 'User'},

}));
