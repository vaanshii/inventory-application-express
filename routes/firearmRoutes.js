const { Router } = require("express");
const firearmController = require("../controllers/firearmController");
const firearmRouter = Router();

firearmRouter.get("/{firearms}", firearmController.listFirearmsGet);

firearmRouter.get("/firearm/id", firearmController.showFirearmGet);

firearmRouter.get("/add", firearmController.addFirearmGet);

firearmRouter.post("/create", firearmController.addFirearmPost);

module.exports = firearmRouter;
