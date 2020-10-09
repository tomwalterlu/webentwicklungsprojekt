function tablegen() {
	document.getElementById("Tabelle").innerHTML = generateString(6, 6, "Informatik Allgemein");
}

function generateString(rownb, colnb, Studiengang) {
	var alles = "";
	alles += "<tr><th>" + Studiengang + "</th><tr>";
	if ((rownb <= 10) && (colnb <= 10)) {
		for (var i = 1; i <= colnb; i++) {
			alles += "<tr>";
			for (var j = rownb; j > 0; j--) {
				alles += "<td> Beispielklasse </td>";
			}
			alles += "</tr>";
		}
		return alles;
	}
	else {
		return "<tr><td>set lower numbers</td></tr>";
	}
}

exports.tablegen = tablegen;
