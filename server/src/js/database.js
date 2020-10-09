const sqlite3 = require("sqlite3");
const fs = require("fs");

fs.mkdir("plans", function () { return; });

var db = new sqlite3.Database(":memory:", (err) => {
	if (err) {
		return console.error(err.message);
	}
	db.serialize(() => {
		db.run("CREATE TABLE IF NOT EXISTS course (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT type UNIQUE, ects INT)");
		db.run("CREATE TABLE IF NOT EXISTS plans (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT type UNIQUE, file TEXT type UNIQUE)");
		db.run("CREATE TABLE IF NOT EXISTS config (id INT, minECTS INT)");

		db.run("INSERT INTO config (id, minECTS) VALUES (329812, 0)");
	});
	console.log("Connected to the in-memory SQlite database.");

	return 1;
});

module.exports = db;
