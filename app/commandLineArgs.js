
var program = require("commander")
	  .version('0.0.1')
	  .option('--clean', 'Delete all database entries on startup')
	  .option('--populate', 'Populate the database with default values on startup')
	  .parse(process.argv);

module.exports = program;