var Q = require ("q");
module.exports = function(promptvalue) {
	return function() {
		var deferred = Q.defer();
		var readline = require('readline');
		try {
			var rl = readline.createInterface(process.stdin, process.stdout);
			
			rl.setPrompt(promptvalue);
			rl.prompt();
			rl.on('line', function(line) { 
				rl.close();
				deferred.resolve(line);

			});

			return deferred.promise;	
		}
		catch (err) {
			deferred.reject(new Error(err));
		}
		
	}
}
