var Q = require ("q");
module.exports = function(object, props) {
	var f = function() {
		var self = this;
		if (!props || props.length == 0) {
			props = Object.keys(object);
		}
		props.forEach(function(prop)  {
			if (typeof object[prop] === 'function') {
				var orig = object[prop];
				var promised = function() {
					var args = arguments;
					return function() {
						return Q.npost(object, prop, args);	
					}
				}
				self[prop] = promised;
			}
		});
	}
	f.prototype = object;

	return new f();
}



