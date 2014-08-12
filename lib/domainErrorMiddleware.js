var domain = require("domain");
module.exports = function(req, res, next){
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