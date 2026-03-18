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

	static async getById(id) {
		const query = `
		SELECT * FROM Category WHERE category_id = $1;
		`;

		try {
			const { rows } = await pool.query(query, [id]);
			return rows;
		} catch (error) {
			console.log("[getById]Query Error: ", error);
			throw error;
		}
	}
}

module.exports = Category;
