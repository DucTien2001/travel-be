import { Router } from "express";
import { enterprise } from "middlewares";
import Controller from "./commission.controller";

export const router = Router();

router.route("/").get(enterprise, Controller.findAll);

router.route("/:id").get(enterprise, Controller.findOne);
