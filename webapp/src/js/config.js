document.getElementById("configForm").addEventListener("submit", function () { validateForm(); });

function validateForm() {
	var newECTS = document.getElementById("minECTS");
	if (parseInt(newECTS.value) <= 0) {
		showStatus("Zahl muss größer als 0 sein!");
		return;
	}
	else {
		updateConfig(newECTS.value);
	}
	newECTS.innerHTML = "";
}

function showStatus(message) {
	var status = document.getElementById("configStatus");
	status.innerHTML = message;
	status.style.backgroundColor = "red";
	status.style.color = "white";
	setTimeout(function () {
		status.innerHTML = "&nbsp;";
		status.style.backgroundColor = "#f4f4f4";
	}, 3000);
}

function updateConfig(ECTS) {
	let ects = {
		minECTS: ECTS
	};
	let options = {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(ects)
	};
	fetch("/api/config", options)
		.then((response) => response.json())
		.then((data) => {
			if (data.message === "success") {
				localStorage.setItem("minECTS", ECTS);
				window.location = "http://" + window.location.host + "/index.html";
			}
		});
}
