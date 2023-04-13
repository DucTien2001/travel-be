import { Router } from "express";
import { admin } from "middlewares";
import Controller from "./staff.controller";

export const router = Router();

router.route("/").get(admin, Controller.findAll);
router.route("/get-offers").get(admin, Controller.cancelSendOffer);
router.route("/send-offer/:id").post(admin, Controller.sendOffer);          // id ~ staffId
router.route("/accept-offer/:id").put(admin, Controller.acceptOffer);       // id ~ offerId
router.route("/cancel-offer/:id").delete(admin, Controller.cancelSendOffer);// id ~ offerId
router.route("/delete/:id").delete(admin, Controller.delete);               // id ~ staffId
