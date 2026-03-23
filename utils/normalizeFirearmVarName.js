function normalizeFirearmVarName(firearmData) {
	const purchaseDate = firearmData.purchasedate;
	const stringedDate = purchaseDate ? purchaseDate.toISOString() : "";
	const formattedDate = stringedDate.split("T")[0];

	return {
		modelName: firearmData.modelname,
		serialNumber: firearmData.serialnumber,
		ammoType: firearmData.ammo_category,
		caliberName: firearmData.caliber,
		manufacturerName: firearmData.manufacturer_name,
		country: firearmData.manufacturer_country,
		purchasePrice: firearmData.purchaseprice,
		purchaseDate: formattedDate,
		imagePath: firearmData.imagepath,
		category_name: firearmData.category_name || "",
	};
}

module.exports = normalizeFirearmVarName;
