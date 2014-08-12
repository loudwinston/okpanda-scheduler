//This is crap
exports.checkLogin = function(req, res,next) {
	
	var isHome = req.url == '/';
	var isLoginPage = req.url.indexOf("/login") == 0;
	console.log("LOGIN PAGE? " + isLoginPage);
	var isPopulate = req.url == "/populate"; 
	var isSlots = req.url == "/slots"; 
	var userLoggedIn = req.session && req.session.username;

	//allow the request to continue if isLoginPagin || isLoginAttempt || userLoggedIn
	if (userLoggedIn || isLoginPage || isPopulate || isSlots ) {
		console.log("user is logged in");
		next();
	}
	else {
		console.log("user is not logged in");
		res.redirect("/login");
	}
}

exports.checkTeacher = function(req, res, next) {
	var isTeacherPage = req.url.indexOf("/teacher") == 0;
	if (isTeacherPage && !req.session.isTeacher) {
		res.status(403).end('Permission Denied');
	}
	else {
		next();
	}
}
var domain = require("domain");
exports.domainError = function(req, res, next){
		var d = domain.create ();
		d.add (req);
		d.add (res);
		d.on ("error", function (error){
			res.on ("close", function (){
				d.exit ();
			});
			next(error);
			
		});
		d.run (next);
};