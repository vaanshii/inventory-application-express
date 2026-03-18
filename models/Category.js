const pool = require("../db/pool");

class Category {
	constructor({ id, name }) {
		((this.id = id), (this.name = name));
	}

	static async getAll() {
		const query = `
        SELECT * FROM Category ORDER BY Name ASC;
        `;

		try {
			const { rows } = await pool.query(query);
			return rows;
		} catch (error) {
			console.log("[getCategories]Query Error: ", error);
			throw error;
		}
	}
}

module.exports = Category;
