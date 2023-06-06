import Container from "typedi";
import Service from "./room.service";
import Validation from "./room.validation";
import { Request, Response } from "express";

export default class Controller {
  static findAll(req: Request, res: Response) {
    try {
      const value = Validation.findAll(req);
      const ServiceI = Container.get(Service);
      ServiceI.findAll(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = Validation.findOne(req);
      const ServiceI = Container.get(Service);
      ServiceI.findOne(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static create(req: Request, res: Response) {
    try {
      const value = Validation.create(req);
      const ServiceI = Container.get(Service);
      ServiceI.create(value, req.files as Express.Multer.File[], req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = Validation.update(req);
      const ServiceI = Container.get(Service);
      ServiceI.update(Number(id), value, req.files as Express.Multer.File[], req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ServiceI = Container.get(Service);
      ServiceI.delete(Number(id), req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static createOrUpdateCheckRoom(req: Request, res: Response) {
    try {
      const value = Validation.createOrUpdateCheckRoom(req);
      const ServiceI = Container.get(Service);
      ServiceI.createOrUpdateCheckRoom(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
