if (document.location.pathname !== "/config.html") {
	fetch("/api/config")
		.then((response) => response.json())
		.then((data) => {
			if (data.minECTS === 0) {
				window.location = "http://" + window.location.host + "/config.html";
			}
		});
}

switch (document.location.pathname) {
	case "/index.html":
		var ipsum = require("./ipsum.js");
		ipsum.ipsum();
		break;
	case "/course.html":
		require("./course.js");
		break;
	case "/config.html":
		require("./config.js");
		break;
	case "/plans.html":
		require("./plan.js");
		break;
	case "/planEditor.html":
		require("./editor.js");
		break;
	default:
}
