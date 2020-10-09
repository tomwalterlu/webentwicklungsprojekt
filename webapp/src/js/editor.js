var link = window.location.href; //http.... id?=1
var tempid = link.slice(-2); // id?= <=
var id;
if (Number.isInteger(tempid.charAt(0))) {
	id = tempid;
}
else {
	id = link.slice(-1);
}

const minECTS = localStorage.getItem("minECTS");
var plan;
var remECTS = [];
var contains = [];
var rows = [];

function showEditor() {
	document.getElementById("planBox").innerHTML = "";
	fetch("/api/plan/" + id)
		.then(response => response.json())
		.then(data => {
			plan = data;
			addEntry(data);
			setCourseNames();
		});
}

showEditor();

function addEntry(plan) {
	var planBox = document.getElementById("planBox");
	var table = document.createElement("table");
	table.id = plan.id;

	var thead = document.createElement("tr");
	thead.className = "thead";
	var sem = document.createElement("td");
	sem.innerText = "Sem";
	var head = document.createElement("td");
	head.setAttribute("colspan", plan.maxECTS / minECTS);
	head.innerText = plan.name;
	head.id = "PlanName";
	var functBox = document.createElement("td");
	var editNameButton = document.createElement("button");
	editNameButton.innerText = "Edit Name";
	editNameButton.addEventListener("click", function () { editName(); });
	functBox.appendChild(editNameButton);
	localStorage.setItem("planname" + plan.id, plan.name);
	head.className = "planTitle";

	thead.append(sem, head, functBox);
	table.append(thead);

	for (var i = plan.semCount; i > 0; i--) {
		addSemester(i, plan, table);
	}

	var footer = document.createElement("tfoot");
	var ectsTd = document.createElement("td");
	ectsTd.innerText = "ECTS";
	footer.appendChild(ectsTd);
	for (var l = 0; l < (plan.maxECTS / minECTS); l++) {
		var ectsDisplay = document.createElement("td");
		ectsDisplay.innerText = minECTS;
		footer.appendChild(ectsDisplay);
	}

	localStorage.setItem("table" + plan.id, table.innerHTML);

	table.append(footer);

	planBox.appendChild(table);
	planBox.appendChild(document.createElement("br"));
}

function addSemester(i, plan, table) {
	var rowArr = [];
	var remainingECTS = plan.maxECTS;
	var row = document.createElement("tr");
	row.className = "planRow";
	var semNumber = document.createElement("td");
	semNumber.innerText = i;
	semNumber.className = "semNum";
	row.appendChild(semNumber);
	for (var j in plan.semesters[i - 1]) {
		rowArr.push(plan.semesters[i - 1][j].id);
		var course = document.createElement("td");
		remainingECTS -= minECTS * plan.semesters[i - 1][j].span;
		course.setAttribute("colspan", plan.semesters[i - 1][j].span);
		course.className = "course";
		course.innerText = plan.semesters[i - 1][j].id + "_id";
		course.id = plan.semesters[i - 1][j].id + "_course";
		row.appendChild(course);
		contains.push(plan.semesters[i - 1][j].id);
	}
	if (remainingECTS !== 0) {
		var emptyBlock = document.createElement("td");
		emptyBlock.setAttribute("colspan", remainingECTS / minECTS);
		emptyBlock.id = "empty_" + i;
		row.appendChild(emptyBlock);
	}
	var buttons = document.createElement("td");
	buttons.id = "buttons_" + i;
	var addButton = document.createElement("button");
	addButton.innerText = "+";
	addButton.id = "add_" + i;
	if (remainingECTS === 0) {
		addButton.setAttribute("disabled", "disabled");
	}
	var removeButton = document.createElement("button");
	removeButton.innerText = "-";
	addButton.id = "remove_" + i;
	if (remainingECTS === plan.maxECTS) {
		removeButton.setAttribute("disabled", "disabled");
	}
	rows[i - 1] = rowArr;
	addButton.addEventListener("click", function () { addcourse(i, addButton, removeButton); });
	removeButton.addEventListener("click", function () { removecourse(i, addButton, removeButton); });
	buttons.append(addButton, removeButton);
	row.appendChild(buttons);
	remECTS[i - 1] = parseInt(remainingECTS);
	table.append(row);
}

function setCourseNames() {
	fetch("/api/course")
		.then(response => response.json())
		.then(message => {
			var modules = document.getElementsByClassName("course");
			for (var i = 0; i < modules.length; i++) {
				var oldText = modules[i].innerText;
				for (var j = 0; j < message.data.length; j++) {
					var courseId = message.data[j].id;
					if (modules[i].innerText === (courseId + "_id")) {
						modules[i].innerText = message.data[j].name;
					}
				}
				if (oldText === modules[i].innerText) {
					var ret = oldText.replace("_id", "");
					for (var l = 0; l < plan.semesters.length; l++) {
						for (var k = 0; k < plan.semesters[l].length; k++) {
							if (plan.semesters[l][k].id === parseInt(ret)) {
								plan.semesters[l].splice(k, 1);
								applyChange();
								location.reload();
							}
						}
					}
				}
			}
		});
}

function editName() {
	var newname = prompt("Please enter new name");
	if (newname !== "" && newname !== null) {
		var newplan = plan;
		newplan.name = newname;
		let options = {
			method: "PUT",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(newplan)
		};
		fetch("api/plan/" + id, options)
			.then((response) => response.json())
			.then((data) => {
				if (data.errno === 19) {
					showStatus("Name " + newname + " existiert bereits!!");
				}
				if (data.message === "success") {
					document.getElementById("PlanName").innerText = newname;
				}
			});
	}
	else {
		showStatus("Name kann nicht leer sein!");
	}
}

function addcourse(semester, addB, remB) {
	fetch("api/course/")
		.then((response) => response.json())
		.then((message) => {
			var courses = [];
			var validId = [];
			var text = "";
			for (var i = 0; i < message.data.length; i++) {
				var course = message.data[i];
				if (!contains.includes(course.id) && course.ects <= remECTS[semester - 1]) {
					courses.push(course);
					validId.push(course.id);
					text += course.id + ": " + course.name + " (" + course.ects + " ECTS)\n";
				}
			}
			var entry = prompt("Chose Subject by id: \n" + text);
			if (entry) {
				if (entry === null || entry === "") {
					showStatus("Eingabe darf nicht leer sein!");
				}
				else {
					if (validId.includes(parseInt(entry))) {
						var newCourse;
						for (var j = 0; j < courses.length; j++) {
							if (courses[j].id === parseInt(entry)) {
								newCourse = courses[j];
								break;
							}
						}
						remECTS[semester - 1] -= newCourse.ects;
						var td = document.createElement("td");
						td.innerText = newCourse.name;
						td.setAttribute("colspan", newCourse.ects / minECTS);
						td.id = newCourse.id + "_course";
						contains.push(newCourse.id);
						var block = document.getElementById("empty_" + semester);
						var parent = block.parentElement;
						parent.insertBefore(td, block);
						if (remECTS[semester - 1] === 0) {
							block.parentElement.removeChild(block);
							addB.setAttribute("disabled", "disabled");
							remB.removeAttribute("disabled");
						}
						else {
							block.setAttribute("colspan", remECTS[semester - 1] / minECTS);
							remB.removeAttribute("disabled");
						}
						var planCourse = {
							id: newCourse.id,
							span: newCourse.ects / minECTS
						};
						plan.semesters[semester - 1].push(planCourse);
						rows[semester - 1].push(newCourse.id);
						applyChange();
					}
					else {
						showStatus("id nicht bekannt!");
					}
				}
			}
		});
}

function removecourse(semester, addB, remB) {
	fetch("api/course/")
		.then((response) => response.json())
		.then((message) => {
			var validId = rows[semester - 1];
			var text = "";
			for (var i = 0; i < message.data.length; i++) {
				var course = message.data[i];
				if (validId.includes(course.id)) {
					text += course.id + ": " + course.name + " (" + course.ects + " ECTS)\n";
				}
			}
			var entry = prompt("Chose Subject by id: \n" + text);
			if (entry) {
				if (entry === null || entry === "") {
					showStatus("Eingabe darf nicht leer sein!");
				}
				else {
					if (validId.includes(parseInt(entry))) {
						var td2del = document.getElementById(entry + "_course");
						var span = td2del.getAttribute("colspan");
						remECTS[semester - 1] += span * minECTS;
						td2del.parentElement.removeChild(td2del);
						var block = document.getElementById("empty_" + semester);
						if (block !== null) {
							block.setAttribute("colspan", remECTS[semester - 1] / minECTS);
						}
						else {
							block = document.createElement("td");
							block.setAttribute("colspan", remECTS[semester - 1] / minECTS);
							block.id = "empty_" + semester;
							var buttons = document.getElementById("buttons_" + semester);
							var parent = buttons.parentElement;
							parent.insertBefore(block, buttons);
						}
						for (var j = 0; j < plan.semesters[semester - 1].length; j++) {
							if (plan.semesters[semester - 1][j].id === parseInt(entry)) {
								plan.semesters[semester - 1].splice(j, 1);
								break;
							}
						}
						var containsIndex = contains.indexOf(parseInt(entry));
						contains.splice(containsIndex, 1);
						var rowsIndex = rows[semester - 1].indexOf(parseInt(entry));
						rows[semester - 1].splice(rowsIndex, 1);
						addB.removeAttribute("disabled");
						if (remECTS[semester - 1] === 0) {
							remB.setAttribute("disabled", "disabled");
						}
						applyChange();
					}
					else {
						showStatus("id nicht bekannt!");
					}
				}
			}
		});
}

function applyChange() {
	let options = {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(plan)
	};
	fetch("api/plan/" + id, options)
		.then((response) => response.json())
		.then((data) => {
			if (data.errno) {
				showStatus("Es ist ein Fehler ausgetretten!");
			}
		});
}

function showStatus(message) {
	var status = document.getElementById("planStatus");
	status.innerHTML = message;
	status.style.backgroundColor = "red";
	status.style.color = "white";
	setTimeout(function () {
		status.innerHTML = "&nbsp;";
		status.style.backgroundColor = "#f4f4f4";
	}, 3000);
}
