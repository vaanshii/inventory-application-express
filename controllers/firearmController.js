exports.listFirearmsGet = (req, res) => {
	// query here to get all firearms
	res.render("views/index", {
		title: "Armory Inventory | Firearms",
	});
};

exports.showFirearmGet = (req, res) => {
	// query firearm by Id here
	res.render("views/showFirearm", { title: "Gun Name" });
};

exports.addFirearmGet = (req, res) => {
	res.render("views/addFirearm", { title: "Add Firearm" });
};
