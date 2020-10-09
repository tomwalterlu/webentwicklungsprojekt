const loremIpsum = require("lorem-ipsum").loremIpsum;

function ipsum() {
	document.getElementById("Text").innerHTML = loremIpsum({ count: 2, units: "paragraphs" });
	setInterval(function () {
		document.getElementById("Text").innerHTML = loremIpsum({ count: 2, units: "paragraphs" });
	}, 5000);
}

exports.ipsum = ipsum;
