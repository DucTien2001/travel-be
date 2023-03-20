import { Router } from "express";
import { staff } from "middlewares";
import Controller from "./tour_schedule.controller";

export const router = Router();

router.route("/").post(staff, Controller.createOne);

router.route("/multi").post(staff, Controller.createMultiple);

router.route("/:id")
    .put(staff, Controller.update)
    .delete(staff, Controller.delete);
