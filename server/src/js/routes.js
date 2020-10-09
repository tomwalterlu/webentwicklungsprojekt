const express = require("express");
const db = require("./database");
const fs = require("fs");
var router = new express.Router();
//post and get to/from course
//req.body holds parameters that are sent up from the client as part of a POST request.
router.route("/course")
	.get(function (req, res) {
		var sql = "select * from course";
		var params = [];
		db.all(sql, params, (err, rows) => {
			if (err) {
				res.json(err);
				return;
			}
			res.json({
				message: "success",
				data: rows
			});
		});
	})
	.post(function (req, res) {
		var data = req.body;
		var sql = "INSERT INTO course (name, ects) VALUES (?,?)";
		var params = [data.name, data.ects];
		db.run(sql, params, function (err) {
			if (err) {
				res.json(err);
				return;
			}
			res.json({
				message: "success",
				data: data,
				id: this.lastID
			});
		});
	});

router.route("/course/:id")
	.put(function (req, res) {
		var data = req.body;
		db.run(
			`UPDATE course set 
			   name = ?
			   WHERE id = ?`,
			[data.name, req.params.id],
			function (err) {
				if (err) {
					res.json(err);
					return;
				}
				res.json({
					message: "success"
				});
			});
	})
	.get(function (req, res) {
		var sql = "select * from course where id = ?";
		var params = [req.params.id];
		db.get(sql, params, (err, row) => {
			if (err) {
				res.json(err);
				return;
			}
			res.json({
				message: "success",
				data: row
			});
		});
	})
	.delete(function (req, res) {
		db.run(
			"DELETE FROM course WHERE id = ?",
			req.params.id,
			function (err) {
				if (err) {
					res.json(err);
					return;
				}
				res.json({ message: "deleted", changes: this.changes });
			});
	});
router.route("/course/:id")
	.put(function (req, res) {
		var data = req.body;
		db.run(
			`UPDATE course set 
			   name = ?
			   WHERE id = ?`,
			[data.name, req.params.id],
			function (err) {
				if (err) {
					res.json(err);
					return;
				}
				res.json({
					message: "success"
				});
			});
	})
	.get(function (req, res) {
		var sql = "select * from course where id = ?";
		var params = [req.params.id];
		db.get(sql, params, (err, row) => {
			if (err) {
				res.json(err);
				return;
			}
			res.json({
				message: "success",
				data: row
			});
		});
	})
	.delete(function (req, res) {
		db.run(
			"DELETE FROM course WHERE id = ?",
			req.params.id,
			function (err) {
				if (err) {
					res.json(err);
					return;
				}
				res.json({ message: "deleted", changes: this.changes });
			});
	});
router.route("/config")
	.get(function (req, res) {
		var sql = "select * from config where id = ?";
		var params = [329812];
		db.get(sql, params, (err, row) => {
			if (err) {
				res.status(400).json({ error: err.message });
				return;
			}
			res.json(row);
		});
	})
	.put(function (req, res) {
		var data = req.body;
		db.run(
			`UPDATE config set 
			   minECTS = ?
			   WHERE id = ?`,
			[data.minECTS, 329812],
			function (err) {
				if (err) {
					res.json(err);
					return;
				}
				res.json({
					message: "success"
				});
			});
	});

router.route("/plan")
	.get(function (req, res) {
		var sql;
		var params;
		if (req.query.page && req.query.items) {
			sql = "select * from plans LIMIT ? OFFSET ?";
			params = [req.query.items, (req.query.page - 1) * req.query.items];
		}
		else {
			sql = "select * from plans";
			params = [];
		}
		db.all(sql, params, (err, rows) => {
			if (err) {
				res.json(err);
				return;
			}
			db.all("SELECT * FROM plans", (err, count) => {
				if (err) {
					res.json(err);
					return;
				}
				var response = {
					total: count.length,
					data: []
				};
				var len = rows.length;
				var cnt = 0;
				rows.forEach(function (element) {
					var file = JSON.parse(fs.readFileSync("plans/" + element.file, "UTF8"));
					response.data.push(file);
					cnt++;
					if (cnt === len) {
						res.json(response);
					}
				});
			});
		});
	})
	.post(function (req, res) {
		var data = req.body;
		var sql = "INSERT INTO plans (name, file) VALUES (?,?)";
		var params = [data.name, data.name + ".json"];
		db.run(sql, params, function (err) {
			if (err) {
				res.json(err);
				return;
			}
			var file = {
				id: this.lastID,
				name: data.name,
				semCount: data.sem,
				maxECTS: data.maxECTS,
				semesters: []
			};
			for (var i = 0; i < data.sem; i++) {
				var semester = [];
				file.semesters.push(semester);
			}
			fs.writeFile("plans/" + data.name + ".json", JSON.stringify(file, null, 4), function (err) {
				if (err) {
					res.json(err);
					return;
				}
				res.json({
					message: "success",
					id: file.id
				});
			});
		});
	});

router.route("/plan/:id")
	.delete(function (req, res) {
		db.get(
			"SELECT * FROM plans WHERE id = ?",
			req.params.id,
			(err, row) => {
				if (err) {
					res.json(err);
					return;
				}
				fs.unlink("plans/" + row.file, function () { return; });
				db.run(
					"DELETE FROM plans WHERE id = ?",
					req.params.id,
					function (err) {
						if (err) {
							res.json(err);
							return;
						}
						res.json({ message: "deleted", changes: this.changes });
					});
			});
	})
	.get(function (req, res) {
		var sql = "select * from plans where id = ?";
		var params = [req.params.id];
		db.get(sql, params, (err, row) => {
			if (err || row === undefined) {
				res.json(err);
				return;
			}
			var file = JSON.parse(fs.readFileSync("plans/" + row.file, "UTF8"));
			res.json(file);
			return;
		});
	})
	.put(function (req, res) {
		var sql = "select * from plans where id = ?";
		var params = [req.params.id];
		db.get(sql, params, (err, row) => {
			if (err) {
				res.json(err);
				return;
			}
			if (row.name !== req.body.name) {
				var updateSql = `UPDATE plans set 
						name = ?, file = ?
						WHERE id = ?`;
				var updateParams = [req.body.name, req.body.name + ".json", req.params.id];
				db.run(updateSql, updateParams, (err) => {
					if (err) {
						res.json(err);
						return;
					}
					fs.writeFile("plans/" + req.body.name + ".json", JSON.stringify(req.body, null, 4), function (err) {
						if (err) {
							res.json(err);
							return;
						}
						res.json({
							message: "success",
						});
					});
				});
			}
			else {
				fs.writeFile("plans/" + row.name + ".json", JSON.stringify(req.body, null, 4), function (err) {
					if (err) {
						res.json(err);
						return;
					}
					res.json({
						message: "success",
					});
				});
			}
		});
	});

module.exports = router;
