import Container from "typedi";
import Service from "./tour_on_sale.service";
import Validation from "./tour_on_sale.validation";
import { Request, Response } from "express";

export default class Controller {
  static create(req: Request, res: Response) {
    try {
      const value = Validation.create(req)
      const ServiceI = Container.get(Service);
      ServiceI.create(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const value = Validation.update(req)
      const ServiceI = Container.get(Service);
      ServiceI.update(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
