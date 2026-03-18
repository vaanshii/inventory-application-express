const { matchedData, validationResult } = require("express-validator");
const validateFirearm = require("../validators/firearmValidator");

const Firearm = require("../models/Firearm");
const Category = require("../models/Category");
const getCurrentDate = require("../utils/getCurrentDate");

exports.listFirearmsGet = async (req, res) => {
	const { category } = req.query;
	let firearms;

	if (category) {
		firearms = await Firearm.getById(category);
	} else {
		firearms = await Firearm.getAll();
	}

	const categories = await Category.getAll();
	console.log(categories);

	res.render("views/index", {
		title: "ArmaVault | Firearms",
		firearms: firearms,
		categories: categories,
		index: "active",
		add: "",
	});
};

exports.showFirearmGet = (req, res) => {
	// query firearm by Id here
	res.render("views/showFirearm", { title: "Gun Name" });
};

exports.addFirearmGet = async (req, res) => {
	const today = getCurrentDate;
	const categories = await Category.getAll();
	console.log(categories);

	res.render("views/addFirearm", {
		title: "Add Firearm",
		formData: "",
		maxDate: today,
		categories: categories,
		add: "active",
		index: "",
	});
};

exports.addFirearmPost = [
	validateFirearm,
	async (req, res) => {
		const categories = await Category.getAll();
		const today = getCurrentDate;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render("views/addFirearm", {
				title: "Add Firearm",
				errors: errors.array(),
				maxDate: today,
				formData: req.body,
				categories: categories,
				add: "active",
				index: "",
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
					add: "active",
					index: "",
				});
			}
		}
	},
];
