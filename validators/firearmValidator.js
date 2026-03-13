const { body } = require("express-validator");
const Firearm = require("../models/Firearm");

const lengthErrorMsg = (number) =>
	`must be between 1 and ${number} characters.`;

const emptyValue = "cannot be empty.";

const validateFirearm = [
	body("modelName")
		.trim()
		.notEmpty()
		.withMessage(`Model Name ${emptyValue}`)
		.bail()
		.isLength({ min: 1, max: 50 })
		.withMessage(`Model name ${lengthErrorMsg(50)}`),
	body("serialNumber")
		.trim()
		.notEmpty()
		.withMessage(`Serial Number ${emptyValue}`)
		.bail()
		.isLength({ min: 1, max: 20 })
		.withMessage(`Serial Number ${lengthErrorMsg(20)}`)
		.bail()
		.custom(async (serialNumber) => {
			const firearm = await Firearm.findBySerialNumber(serialNumber);

			if (firearm) {
				throw new Error("Serial number already exists.");
			}

			return true;
		}),
	body("ammoType")
		.trim()
		.notEmpty()
		.withMessage(`Ammo Type ${emptyValue}`)
		.bail()
		.isLength({ min: 1, max: 20 })
		.withMessage(`Ammo type ${lengthErrorMsg(20)}`),
	body("caliberName")
		.trim()
		.notEmpty()
		.withMessage(`Caliber Name ${emptyValue}`)
		.bail()
		.isLength({ min: 1, max: 30 })
		.withMessage(`Caliber Name ${lengthErrorMsg(30)}`),
	body("manufacturerName")
		.trim()
		.notEmpty()
		.withMessage(`Manufacturer Name ${emptyValue}`)
		.bail()
		.isLength({ min: 1, max: 30 })
		.withMessage(`Manufacturer Name ${lengthErrorMsg(30)}`),
	body("country")
		.trim()
		.notEmpty()
		.withMessage(`Country ${emptyValue}`)
		.bail()
		.isAlpha("en-US", { ignore: " " })
		.withMessage("Country must only contain letters.")
		.isLength({ min: 1, max: 30 })
		.withMessage(`Country name ${lengthErrorMsg(30)}`),
	body("purchasePrice")
		.trim()
		.optional({ values: "falsy" })
		.isNumeric()
		.withMessage("Purchase price must be a number.")
		.isLength({ min: 1, max: 20 })
		.withMessage(`Purchase price ${lengthErrorMsg(20)}`),
	body("imagePath")
		.trim()
		.optional({ values: "falsy" })
		.isURL()
		.withMessage("Image Link must be a valid link."),
];

module.exports = validateFirearm;
