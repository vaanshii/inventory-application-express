const pool = require("../db/pool");

class Firearm {
	constructor({
		id,
		modelName,
		serialNumber,
		ammoType,
		caliberName,
		purchasePrice,
		purchaseDate,
		manufacturerName,
		country,
		manufacturerId,
		imagePath,
		category,
	}) {
		this.id = id;
		this.modelName = modelName;
		this.serialNumber = serialNumber;
		this.ammoType = ammoType;
		this.caliberName = caliberName;
		this.purchasePrice = purchasePrice;
		this.purchaseDate = purchaseDate;
		this.manufacturerName = manufacturerName;
		this.country = country;
		this.manufacturerId = manufacturerId;
		this.imagePath = imagePath || "default-gun-png";
		this.category = category;
	}

	static validate(data) {
		if (!data.modelName || data.modelName.length < 2) {
			throw new Error("Invalid Model Name");
		}
		if (!data.serialNumber) {
			throw new Error("Serial Number is required");
		}
		return true;
	}

	static async getAll() {
		const query = `
			SELECT
				f.*,
				m.Name as manufacturer_name,
				m.Country as manufacturer_country,
				a.CaliberName as caliber,
				a.Type as ammo_category,
				c.Name as category_name
			FROM Firearms f
			LEFT JOIN Manufacturers m ON f.ManufacturerID = m.ManufacturerID
			LEFT JOIN Ammo_Types a ON f.AmmoID = a.AmmoID
			LEFT JOIN Category c ON f.category_id = c.Category_ID;
		`;

		try {
			const { rows } = await pool.query(query);
			return rows;
		} catch (error) {
			console.error("[getAll]Query Error: ", error);
			throw error;
		}
	}

	static async getById(id) {
		const query = `
			SELECT
				f.*,
				m.Name as manufacturer_name,
				m.Country as manufacturer_country,
				a.CaliberName as caliber,
				a.Type as ammo_category,
				c.Name as category_name
			FROM Firearms f
			LEFT JOIN Manufacturers m ON f.ManufacturerID = m.ManufacturerID
			LEFT JOIN Ammo_Types a ON f.AmmoID = a.AmmoID
			LEFT JOIN Category c ON f.category_id = c.category_id
			WHERE f.firearmid = $1;
		`;

		try {
			const { rows } = await pool.query(query, [id]);
			return rows;
		} catch (error) {
			console.error("[getById]Query Error: ", error);
			throw error;
		}
	}

	static async createWithCheck(gunData) {
		this.validate(gunData);

		const client = await pool.connect();

		try {
			client.query("BEGIN");

			let finalMfgId = gunData.manufacturerId;
			let finalAmmoId = gunData.ammoId;

			if (!finalMfgId && gunData.manufacturerName && gunData.country) {
				const mfgResult = await pool.query(
					`INSERT INTO Manufacturers (Name, Country) VALUES ($1, $2) 
                 ON CONFLICT (Name) DO UPDATE SET Name=EXCLUDED.Name 
                 RETURNING ManufacturerID`,
					[gunData.manufacturerName, gunData.country],
				);
				finalMfgId = mfgResult.rows[0].manufacturerid;
			}

			if (!finalAmmoId && gunData.caliberName && gunData.ammoType) {
				const ammoResult = await pool.query(
					`
                INSERT INTO Ammo_Types (CaliberName, Type) VALUES($1, $2)
                ON CONFLICT (CaliberName) DO UPDATE SET CaliberName=EXCLUDED.CaliberName
                RETURNING  AmmoID
                `,
					[gunData.caliberName, gunData.ammoType],
				);
				finalAmmoId = ammoResult.rows[0].ammoid;
			}

			const query = `
            INSERT INTO Firearms (ModelName, SerialNumber, PurchasePrice, ManufacturerID, AmmoID, imagepath, category_id, PurchaseDate)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `;
			const values = [
				gunData.modelName,
				gunData.serialNumber,
				gunData.purchasePrice,
				finalMfgId,
				finalAmmoId,
				gunData.imagePath,
				gunData.category,
				gunData.purchaseDate,
			];
			const { rows } = await pool.query(query, values);

			await client.query("COMMIT");

			return rows[0];
		} catch (error) {
			await client.query("ROLLBACK");
			console.error("[createWithCheck] Transaction Error: ", error);
			throw error;
		} finally {
			client.release();
		}
	}

	static async updateWithCheck(id, gunData) {
		this.validate(gunData);
		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			let finalMfgId = gunData.manufacturerId;
			let finalAmmoId = gunData.ammoId;

			if (!finalMfgId && gunData.manufacturerName) {
				const mfgResult = await client.query(
					`INSERT INTO Manufacturers (Name, Country) VALUES ($1, $2) 
                 ON CONFLICT (Name) DO UPDATE SET Name=EXCLUDED.Name 
                 RETURNING ManufacturerID`,
					[gunData.manufacturerName, gunData.country || "Unknown"],
				);
				finalMfgId = mfgResult.rows[0].manufacturerid;
			}

			if (!finalAmmoId && gunData.caliberName) {
				const ammoResult = await client.query(
					`INSERT INTO Ammo_Types (CaliberName, Type) VALUES($1, $2)
                 ON CONFLICT (CaliberName) DO UPDATE SET CaliberName=EXCLUDED.CaliberName
                 RETURNING AmmoID`,
					[gunData.caliberName, gunData.ammoType || "Unknown"],
				);
				finalAmmoId = ammoResult.rows[0].ammoid;
			}

			const query = `
            UPDATE Firearms 
            SET ModelName = $1, SerialNumber = $2, PurchasePrice = $3, 
                ManufacturerID = $4, AmmoID = $5, imagepath = $6, 
                category_id = $7, PurchaseDate = $8
            WHERE FirearmID = $9 
            RETURNING *;
        `;

			const values = [
				gunData.modelName,
				gunData.serialNumber,
				gunData.purchasePrice,
				finalMfgId,
				finalAmmoId,
				gunData.imagePath,
				gunData.category,
				gunData.purchaseDate,
				id,
			];

			const { rows } = await client.query(query, values);
			await client.query("COMMIT");
			return rows[0];
		} catch (error) {
			await client.query("ROLLBACK");
			console.error("[updateWithCheck] Error: ", error);
			throw error;
		} finally {
			client.release();
		}
	}

	static async findById(id) {
		const query = `
            SELECT f.*, m.Name as ManufacturerName
            FROM Firearms f
            JOIN Manufacturers m ON f.ManufacturerID = m.ManufacturerID
            WHERE f.FirearmID = $1;
        `;
		const { rows } = await pool.query(query, [id]);
		return rows[0] ? new Firearm(rows[0]) : null;
	}

	static async findBySerialNumber(serialNumber) {
		try {
			const result = await pool.query(
				`SELECT firearmid FROM firearms WHERE serialnumber = $1`,
				[serialNumber],
			);

			return result.rows[0];
		} catch (error) {
			console.error("[findBySerialNumber] Query Error: ", error);
			throw error;
		}
	}

	async getAttachments() {
		const query = `
            SELECT a.* FROM Attachments a
            JOIN Firearm_attachments fa ON a.AttachmentID = fa.AttachmentID
            WHERE fa.FirearmID = $1;
        `;
		const { rows } = await pool.query(query, [this.id]);

		return rows;
	}
}

module.exports = Firearm;
