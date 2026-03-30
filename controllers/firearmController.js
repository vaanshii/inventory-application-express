const { matchedData, validationResult } = require("express-validator");
const validateFirearm = require("../validators/firearmValidator");

const Firearm = require("../models/Firearm");
const Category = require("../models/Category");

const getCurrentDate = require("../utils/getCurrentDate");
const normalizeFirearmVarName = require("../utils/normalizeFirearmVarName");
const today = require("../utils/getCurrentDate");

exports.listFirearmsGet = async (req, res) => {
	const { category } = req.query;
	let firearms;
	let currentCategoryName;

	try {
		if (category) {
			firearms = await Firearm.getByCategory(category);

			const currentCategory = await Category.getById(category);
			currentCategoryName = currentCategory[0].name;
		} else {
			firearms = await Firearm.getAll();
		}

		const categories = await Category.getAll();

		res.render("index", {
			title: "ArmaVault | Firearms",
			firearms: firearms,
			categories: categories,
			activePage: "index",
			currentCategoryName: currentCategoryName,
		});
	} catch (error) {
		console.error("[listFirearmsGet]: ", error);
		res.status(400).json({
			success: false,
			message: "Internal error occure",
		});
	}
};

exports.showFirearmGet = async (req, res) => {
	const param = req.params;
	const firearmId = param.id;

	try {
		const firearmData = await Firearm.getById(firearmId);
		console.log({ firearmData });

		const categories = await Category.getAll();
		res.render("showFirearm", {
			title: firearmData[0].modelname,
			activePage: "",
			categories: categories,
			firearm: firearmData[0],
		});
	} catch (error) {
		console.error("[showFirearmGet]: ", error);
		res.status(400).json({
			success: false,
			message: "Internal error occure",
		});
	}
};

exports.addFirearmGet = async (req, res) => {
	const today = getCurrentDate;

	try {
		const categories = await Category.getAll();

		res.render("addFirearm", {
			title: "Add Firearm",
			formData: "",
			maxDate: today,
			categories: categories,
			activePage: "add",
			action: "/create",
			isEdit: false,
		});
	} catch (error) {
		console.error("[addFirearmGet]: ", error);
		res.status(400).json({
			success: false,
			message: "Internal error occure",
		});
	}
};

exports.addFirearmPost = [
	validateFirearm,
	async (req, res) => {
		const categories = await Category.getAll();
		const today = getCurrentDate;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render("addFirearm", {
				title: "Add Firearm",
				errors: errors.array(),
				maxDate: today,
				formData: req.body,
				categories: categories,
				activePage: "add",
				action: "/create",
				isEdit: false,
			});
		}
		const gunData = matchedData(req);
		console.log(gunData);
		try {
			await Firearm.createWithCheck(gunData);
			res.redirect("/");
		} catch (error) {
			if (error.code === "23505") {
				return res.status(400).render("addFirearm", {
					title: "Add Firearm",
					errors: [{ msg: "Serial number already exists." }],
					maxDate: today,
					formData: req.body,
					categories: categories,
					activePage: "add",
					action: "/create",
					isEdit: false,
				});
			}
		}
	},
];

exports.editFirearmGet = async (req, res) => {
	const param = req.params;
	const firearmId = param.id;

	try {
		const firearmData = await Firearm.getById(firearmId);
		console.log({ firearmData });

		const normalizedFormDataVar = normalizeFirearmVarName(firearmData[0]);
		console.log({ normalizedFormDataVar });

		const categories = await Category.getAll();
		const today = getCurrentDate;

		res.render("components/firearmForm", {
			categories: categories,
			formData: normalizedFormDataVar,
			action: `/firearm/update/:id`,
			maxDate: today,
			title: `Edit Firearm Details`,
			activePage: "",
			isEdit: true,
			errors: null,
		});
	} catch (error) {
		console.error("[editFirearmGet]: ", error);
		res.status(400).json({
			success: false,
			message: "Internal error occure",
		});
	}
};

exports.updateFirearmPut = [
	validateFirearm,
	async (req, res) => {
		const firearmId = req.params.id;

		const today = getCurrentDate;
		const categories = await Category.getAll();
		const errors = validationResult(req);

		console.log(errors.array());

		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				errors: errors.array(),
			});
		}

		const gunData = matchedData(req);
		console.log({ gunData });

		try {
			await Firearm.updateWithCheck(firearmId, gunData);
			return res.status(200).json({
				success: true,
				message: "Firearm updated successfully!",
			});
		} catch (error) {
			console.error("[updateFirearmPut]: ", error);
			if (error.code === "23505") {
				return res.status(400).render("components/firearmForm", {
					categories: categories,
					formData: normalizedFormDataVar,
					action: `/firearm/update/:id`,
					maxDate: today,
					title: `Edit Firearm Details`,
					activePage: "",
					isEdit: true,
					errors: [{ msg: "Serial number already exists." }],
				});
			}
		}
	},
];

exports.firearmDelete = async (req, res) => {
	const firearmId = req.params.id;

	try {
		const deleted = await Firearm.deleteById(firearmId);

		if (deleted) {
			return res.status(200).json({
				success: true,
				message: `Firearm deleted with id: ${firearmId}`,
			});
		} else {
			return res.status(404).json({
				success: false,
				message: "Firearm not found",
			});
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Server error during deletion." });
	}
};
