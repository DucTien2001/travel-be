import { Router } from "express";
import Controller from "./comment.controller";
import { auth } from "middlewares";

export const commentRouter = Router();

commentRouter.route("/").get(Controller.findAll).post(auth, Controller.findAll);
commentRouter.route("/:id").put(auth, Controller.update).delete(auth, Controller.delete);
commentRouter.route("/reply").post(auth, Controller.reply);
