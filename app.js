require("dotenv").config();
const express = require("express");
const path = require("node:path");
const app = express();

const firearmRouter = require("./routes/firearmRoutes");

const PORT = process.env.SERVER_PORT;

app.set("views", path.join(__dirname), "views");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use("/", firearmRouter);

app.listen(PORT, (error) => {
	if (error) {
		throw error;
	}

	console.log(`Listening to PORT: ${PORT}`);
});
