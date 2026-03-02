require("dotenv").config();
const express = require("express");
const path = require("node:path");

const app = express();

const PORT = process.env.SERVER_PORT;

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.listen(PORT, (error) => {
	if (error) {
		throw error;
	}

	console.log(`Listening to PORT: ${PORT}`);
});
