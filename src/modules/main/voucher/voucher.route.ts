import { Router } from "express";
import { staff } from "middlewares";
import Controller from "./voucher.controller";

export const router = Router();

router.route("/").get(staff, Controller.findAll);

router.route("/:id").get(staff, Controller.findOne);
