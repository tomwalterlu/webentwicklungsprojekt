document.getElementById("planForm").addEventListener("submit", function () { createPlan(); });
const htmlToImage = require("html-to-image");
var PHE = require("print-html-element");
const minECTS = localStorage.getItem("minECTS");
window.addEventListener("resize", function () { checkSpace(); });
var curItems = -1;

// Reserved Screenheight = 230px, Screenheight 8 Semester = 400px

function checkSpace() {
	var items = Math.floor((document.documentElement.clientHeight - 230) / 310);
	if (items !== curItems) {
		curItems = items;
		showPlans(1, items);
	}
	if (items <= 0) {
		document.getElementById("pages").innerHTML = "";
		document.getElementById("planBox").innerHTML = "";
		var message = document.createElement("p");
		message.innerText = "Fenster ist zu klein! Bitten vergrößern sie das Fenster.";
		message.style.textAlign = "center";
		document.getElementById("planBox").appendChild(message);
	}
}

checkSpace();

function showPlans(page, items) {
	document.getElementById("planBox").innerHTML = "";
	fetch("/api/plan?page=" + page + "&items=" + items)
		.then(response => response.json())
		.then(data => {
			for (var i = 0; i < data.data.length; i++) {
				addEntry(data.data[i]);
			}
			setCourseNames();
			if (data.data.length > 0) {
				createPagination(Math.ceil(data.total / items), page, items);
			}
		});
}

function createPagination(pages, currentPage, items) {
	var parent = document.getElementById("pages");
	parent.innerHTML = "";
	var previous = document.createElement("button");
	previous.className = "disabledButton";
	previous.innerText = "<<";
	parent.appendChild(previous);
	if (currentPage !== 1) {
		previous.className = "pageButton";
		previous.addEventListener("click", function () { showPlans(currentPage - 1, items); });
	}
	for (var i = 1; i <= pages; i++) {
		addPageButton(currentPage, i, items);
	}
	var next = document.createElement("button");
	next.className = "disabledButton";
	next.innerText = ">>";
	parent.appendChild(next);
	if (currentPage !== pages) {
		next.className = "pageButton";
		next.addEventListener("click", function () { showPlans(currentPage + 1, items); });
	}
}

function addPageButton(currentPage, i, items) {
	var parent = document.getElementById("pages");
	var pageBtn = document.createElement("button");
	pageBtn.addEventListener("click", function () { showPlans(i, items); });
	pageBtn.innerText = i;
	pageBtn.id = "page" + i;
	if (i === currentPage) {
		pageBtn.className = "pageButtonCurrent";
	}
	else {
		pageBtn.className = "pageButton";
	}
	parent.appendChild(pageBtn);
}

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
	localStorage.setItem("planname" + plan.id, plan.name);
	head.className = "planTitle";

	thead.append(sem, head);
	table.append(thead);

	for (var i = plan.semCount; i > 0; i--) {
		var remainingECTS = plan.maxECTS;
		localStorage.setItem("maxECTS" + plan.id, remainingECTS);
		var row = document.createElement("tr");
		row.className = "planRow";
		var semNumber = document.createElement("td");
		semNumber.innerText = i;
		semNumber.className = "semNum";
		row.appendChild(semNumber);
		for (var j in plan.semesters[i - 1]) {
			var course = document.createElement("td");
			remainingECTS -= minECTS * plan.semesters[i - 1][j].span;
			course.setAttribute("colspan", plan.semesters[i - 1][j].span);
			course.className = "course";
			course.innerText = plan.semesters[i - 1][j].id + "_id";
			row.appendChild(course);
		}
		if (remainingECTS !== 0) {
			for (var k = 0; k < (remainingECTS / minECTS); k++) {
				var defModule = document.createElement("td");
				defModule.setAttribute("colspan", 1);
				defModule.innerText = "Wahlpflichtmodul";
				row.appendChild(defModule);
			}
		}
		table.append(row);
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

	var buttons = document.createElement("caption");
	buttons.setAttribute("colspan", (plan.maxECTS / minECTS) + 1);
	var delbutton = document.createElement("button");
	var editbutton = document.createElement("button");
	var downloadbutton = document.createElement("button");
	var printbutton = document.createElement("button");
	delbutton.innerText = "delete";
	editbutton.innerText = "edit";
	downloadbutton.innerText = "to PNG";
	printbutton.innerText = "Print...";
	buttons.appendChild(delbutton);
	buttons.appendChild(editbutton);
	buttons.appendChild(downloadbutton);
	buttons.appendChild(printbutton);
	delbutton.addEventListener("click", function () { deletePlan(plan.id); });
	editbutton.addEventListener("click", function () { editPlan(plan.id); });
	downloadbutton.addEventListener("click", function () { downloadPlan(plan.id); });
	printbutton.addEventListener("click", function () { printPlan(plan.id); });
	localStorage.setItem("table" + plan.id, table.innerHTML);

	table.append(footer, buttons);

	planBox.appendChild(table);
	planBox.appendChild(document.createElement("br"));
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
					modules[i].innerText = "Wahlpflichtmodul";
					if (modules[i].getAttribute("colspan") > 1) {
						var currentSpan = modules[i].getAttribute("colspan");
						modules[i].setAttribute("colspan", 1);
						for (var k = 1; k < currentSpan; k++) {
							var td = document.createElement("td");
							td.innerText = "Wahlpflichtmodul";
							modules[i].parentElement.appendChild(td);
						}
					}
				}
			}
		});
}

function removeEntry(id) {
	var entry = document.getElementById(id);
	entry.parentNode.removeChild(entry);
}

function downloadPlan(id) {
	var plan = document.getElementById(id);
	plan.style.margin = "1px";
	htmlToImage.toPng(plan)
		.then(function (dataUrl) {
			var a = document.body.appendChild(
				document.createElement("a")
			);
			a.download = "plan_" + id + ".png";
			a.href = dataUrl;
			a.click();
			document.body.removeChild(a);
			plan.style.margin = "auto";
		});
}

function printPlan(id) {
	var plan = document.getElementById(id);
	PHE.printElement(plan);
}

function createPlan() {
	var name = document.getElementById("planName").value;
	var sem = document.getElementById("semCount").value;
	var mod = document.getElementById("modCount").value;
	if (sem > 0) {
		if ((mod % minECTS) === 0) {
			let plan = {
				name: name,
				sem: sem,
				maxECTS: mod
			};
			let options = {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(plan)
			};
			fetch("/api/plan", options)
				.then(response => response.json())
				.then(data => {
					if (data.message) {
						if (data.message === "success") {
							editPlan(data.id);
						}
					}
					if (data.errno) {
						if (data.errno === 19) {
							showStatus("Name ist bereits vergeben.");
						}
					}
				});
		}
		else {
			showStatus("Die ECTS Anzahl muss " + minECTS + " oder ein vielfaches davon betragen!");
		}
	}
	else {
		showStatus("Es muss mindestens 1 Semester sein.");
	}
}

function editPlan(id) {
	window.location = "/planEditor.html?id=" + id;
	localStorage.setItem("id", id);
}

function deletePlan(id) {
	let options = {
		method: "DELETE"
	};
	fetch("/api/plan/" + id, options);
	removeEntry(id);
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
