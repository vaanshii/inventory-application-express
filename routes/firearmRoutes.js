const { Router } = require("express");
const firearmController = require("../controllers/firearmController");
const firearmRouter = Router();

firearmRouter.get("/", firearmController.listFirearmsGet);

firearmRouter.get("/firearm/id", firearmController.showFirearmGet);

firearmRouter.get("/add", firearmController.addFirearmGet);

module.exports = firearmRouter;
