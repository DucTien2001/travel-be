import { Router } from "express";
import { enterpriseRouter } from "./enterprise_dashboard";
import { mainRouter } from "./main";

export const v1Router = Router();

v1Router.use('/', mainRouter);
v1Router.use('/enterprise', enterpriseRouter);