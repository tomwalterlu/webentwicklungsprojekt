document.getElementById("courseForm").addEventListener("submit", function () { createCourse(); });
var courses = [];

initTable();

function initTable() {
	fetch("/api/course")
		.then((response) => response.json())
		.then((message) => {
			for (var i = 0; i < message.data.length; i++) {
				addEntry(message.data[i]);
			}
		});
}

function createCourse() {
	var minECTS = localStorage.getItem("minECTS");
	let cName = document.getElementById("courseName");
	let ects = document.getElementById("courseEcts");
	if (parseInt(ects.value) % parseInt(minECTS) !== 0) {
		showStatus("Die ECTS Anzahl muss " + minECTS + " oder ein vielfaches davon betragen!");
		return;
	}
	let course = {
		name: cName.value,
		ects: parseInt(ects.value)
	};
	let options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(course)
	};
	fetch("/api/course", options)
		.then((response) => response.json())
		.then((data) => {
			if (data.data) {
				if (data.data.ects) {
					let course = {
						id: data.id,
						name: data.data.name,
						ects: data.data.ects
					};
					courses.push(course);
					addEntry(course);
				}
			}
			if (data.errno) {
				if (data.errno === 19) {
					showStatus("Name existiert bereits!!");
				}
			}
		});
	cName.value = "";
	ects.value = "";
}

function showStatus(message) {
	var status = document.getElementById("courseStatus");
	status.innerHTML = message;
	status.style.backgroundColor = "red";
	status.style.color = "white";
	setTimeout(function () {
		status.innerHTML = "&nbsp;";
		status.style.backgroundColor = "#f4f4f4";
	}, 3000);
}

function addEntry(course) {
	var tr = document.createElement("tr");
	tr.id = course.id;
	var tdname = document.createElement("td");
	tdname.innerText = course.name;
	tr.appendChild(tdname);
	var tdects = document.createElement("td");
	tdects.innerText = course.ects;
	tr.appendChild(tdects);
	var tdfunct = document.createElement("td");
	var delbutton = document.createElement("button");
	var editbutton = document.createElement("button");
	editbutton.id = course.id + "_edit";
	delbutton.id = course.id + "_del";
	delbutton.innerText = "delete";
	editbutton.innerText = "edit";
	tdfunct.appendChild(delbutton);
	tdfunct.appendChild(editbutton);
	tr.appendChild(tdfunct);
	document.getElementById("courseTable").appendChild(tr);
	delbutton.addEventListener("click", function () { deleteCourse(course.id); });
	editbutton.addEventListener("click", function () { editCourse(course.id); });
}

function removeEntry(id) {
	var entry = document.getElementById(id);
	entry.parentNode.removeChild(entry);
}

function updateEntry(id, name) {
	document.getElementById(id).firstChild.innerText = name;
}

function deleteCourse(id) {
	let options = {
		method: "DELETE"
	};
	fetch("/api/course/" + id, options);
	removeEntry(id);
}

function editCourse(id) {
	var newname = prompt("Please enter new name");
	if (newname !== "" && newname !== null) {
		var course = {
			name: newname
		};
		let options = {
			method: "PUT",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(course)
		};
		fetch("api/course/" + id, options)
			.then((response) => response.json())
			.then((data) => {
				if (data.errno === 19) {
					showStatus("Name " + newname + " existiert bereits!!");
				}
				if (data.message === "success") {
					updateEntry(id, newname);
				}
			});
	}
	else {
		showStatus("Name kann nicht leer sein!");
	}
}
