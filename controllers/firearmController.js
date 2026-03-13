const { matchedData, validationResult } = require("express-validator");
const validateFirearm = require("../validators/firearmValidator");

const Firearm = require("../models/Firearm");
const Category = require("../models/Category");
const getCurrentDate = require("../utils/getCurrentDate");

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

exports.addFirearmGet = async (req, res) => {
	const today = getCurrentDate;
	const categories = await Category.getCategories();
	console.log(categories);

	res.render("views/addFirearm", {
		title: "Add Firearm",
		formData: "",
		maxDate: today,
		categories: categories,
	});
};

exports.addFirearmPost = [
	validateFirearm,
	async (req, res) => {
		const categories = await Category.getCategories();
		const today = getCurrentDate;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render("views/addFirearm", {
				title: "Add Firearm",
				errors: errors.array(),
				maxDate: today,
				formData: req.body,
				categories: categories,
			});
		}
		const gunData = matchedData(req);
		console.log(gunData);
		try {
			await Firearm.createWithCheck(gunData);
			res.redirect("/");
		} catch (error) {
			if (error.code === "23505") {
				return res.status(400).render("views/addFirearm", {
					title: "Add Firearm",
					errors: [{ msg: "Serial number already exists." }],
					maxDate: today,
					formData: req.body,
					categories: categories,
				});
			}
		}
	},
];
