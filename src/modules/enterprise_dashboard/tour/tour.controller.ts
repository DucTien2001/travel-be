import Container from "typedi";
import Service from "./tour.service";
import Validation from "./tour.validation";
import { Request, Response } from "express";

export default class Controller {
  static findAll(req: Request, res: Response) {
    try {
      const value = Validation.findAll(req)
      const ServiceI = Container.get(Service);
      ServiceI.findAll(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static create(req: Request, res: Response) {
    try {
      const value = Validation.create(req)
      const ServiceI = Container.get(Service);
      ServiceI.create(value, req.files as Express.Multer.File[], req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
