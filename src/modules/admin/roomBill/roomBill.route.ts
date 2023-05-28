import { Router } from "express";
import Controller from "./roomBill.controller";
import { admin, superAdmin } from "middlewares";

export const router = Router();

router.route("/filter/:id").get(superAdmin, Controller.getFiltersForStayOfUser);    // id ~ enterpriseId
router.route("/statistic").get(superAdmin, Controller.statisticAllUsers);
router.route("/statistic/user/:id").get(superAdmin, Controller.statisticOneUser);
router.route("/statistic/stay/:id").get(superAdmin, Controller.statisticOneStay);
router.route("/statistic/room/:id").get(superAdmin, Controller.statisticOneRoom);
router.route("/order-refund").get(admin, Controller.findAllOrderNeedRefund);
router.route("/order-refund/:id").put(admin, Controller.updateRefunded);
