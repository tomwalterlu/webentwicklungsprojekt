const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./js/routes");
const app = express();
const port = 8080;
const rootdir = __dirname + "/../../dist";

app.set("json spaces", 4);
app.use(bodyParser.json());
app.use(express.static(rootdir));

app.use("/api", routes);

app.listen(port, function () {
	console.log("Server listening at http://localhost:" + port);
});
