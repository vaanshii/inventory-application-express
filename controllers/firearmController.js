const { matchedData, validationResult } = require("express-validator");
const validateFirearm = require("../validators/firearmValidator");
const Firearm = require("../models/Firearm");

exports.listFirearmsGet = async (req, res) => {
	const firearmData = await Firearm.getAll();
	// * logging
	// console.log(firearmData);

	res.render("views/index", {
		title: "ArmaVault | Firearms",
		firearms: firearmData,
	});
};

exports.showFirearmGet = (req, res) => {
	// query firearm by Id here
	res.render("views/showFirearm", { title: "Gun Name" });
};

exports.addFirearmGet = (req, res) => {
	res.render("views/addFirearm", { title: "Add Firearm", formData: "" });
};

exports.addFirearmPost = [
	validateFirearm,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render("views/addFirearm", {
				title: "Add Firearm",
				errors: errors.array(),
				formData: req.body,
			});
		}
		const gunData = matchedData(req);
		console.log(gunData);

		Firearm.createWithCheck(gunData);
		res.redirect("/");
	},
];
