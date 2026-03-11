const pool = require("../db/pool");

class Firearm {
	constructor({
		id,
		modelName,
		serialNumber,
		ammoType,
		caliberName,
		purchasePrice,
		newManufacturerName,
		country,
		manufacturerId,
		imagePath,
	}) {
		this.id = id;
		this.modelName = modelName;
		this.serialNumber = serialNumber;
		this.ammoType = ammoType;
		this.caliberName = caliberName;
		this.purchasePrice = purchasePrice;
		this.newManufacturerName = newManufacturerName;
		this.country = country;
		this.manufacturerId = manufacturerId;
		this.imagePath = imagePath || "default-gun-png";
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

	static async createWithCheck(gunData) {
		this.validate(gunData);

		const client = await pool.connect();

		try {
			client.query("BEGIN");

			let finalMfgId = gunData.manufacturerId;
			let finalAmmoId = gunData.ammoId;

			if (!finalMfgId && gunData.newManufacturerName && gunData.country) {
				const mfgResult = await pool.query(
					`INSERT INTO Manufacturers (Name, Country) VALUES ($1, $2) 
                 ON CONFLICT (Name) DO UPDATE SET Name=EXCLUDED.Name 
                 RETURNING ManufacturerID`,
					[gunData.newManufacturerName, gunData.country],
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
            INSERT INTO Firearms (ModelName, SerialNumber, ManufacturerID, AmmoID)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
			const values = [
				gunData.modelName,
				gunData.serialNumber,
				finalMfgId,
				finalAmmoId,
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
