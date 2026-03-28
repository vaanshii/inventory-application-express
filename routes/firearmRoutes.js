const { Router } = require("express");
const firearmController = require("../controllers/firearmController");
const firearmRouter = Router();

firearmRouter.delete("/firearm/delete/:id", firearmController.firearmDelete);

firearmRouter.get("/{firearms}", firearmController.listFirearmsGet);

firearmRouter.get("/firearm/:id", firearmController.showFirearmGet);

firearmRouter.get("/add", firearmController.addFirearmGet);

firearmRouter.post("/create", firearmController.addFirearmPost);

firearmRouter.get("/firearm/edit/:id", firearmController.editFirearmGet);

firearmRouter.put("/firearm/update/:id", firearmController.updateFirearmPut);

module.exports = firearmRouter;
