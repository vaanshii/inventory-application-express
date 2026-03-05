require("dotenv").config();
const { Pool } = require("pg");

module.exports = new Pool({
	host: process.env.HOST,
	user: process.env.USER,
	database: process.env.DATABASE_NAME,
	password: process.env.PASSWORD,
	port: process.env.PORT,
});
