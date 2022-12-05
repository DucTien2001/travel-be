import Container from "typedi";
import TourService from "./tour.service";
import TourValidation from "./tour.validation";
import { Request, Response } from "express";

export default class TourController {
  static getTour(req: Request, res: Response) {
    try {
      const { tourId } = req.params;
      const TourServiceI = Container.get(TourService);
      TourServiceI.getTour( Number(tourId), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getTours(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const TourServiceI = Container.get(TourService);
      TourServiceI.getTours(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getAllTours(req: Request, res: Response) {
    try {
      const TourServiceI = Container.get(TourService);
      TourServiceI.getAllTours(res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static createNewTour(req: Request, res: Response) {
    try {
      const value = TourValidation.createNewTour(req);
      const TourServiceI = Container.get(TourService);
      TourServiceI.createNewTour(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static updateTour(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourValidation.updateTour(req);
      const TourServiceI = Container.get(TourService);
      TourServiceI.updateTour(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static temporarilyStopWorking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const TourServiceI = Container.get(TourService);
      TourServiceI.temporarilyStopWorking(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static workAgain(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const TourServiceI = Container.get(TourService);
      TourServiceI.workAgain(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static deleteTour(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const TourServiceI = Container.get(TourService);
      TourServiceI.deleteTour(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static searchTours(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const TourServiceI = Container.get(TourService);
      TourServiceI.searchTour(name, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static searchByLocation(req: Request, res: Response) {
    try {
      const { location } = req.params;
      const TourServiceI = Container.get(TourService);
      TourServiceI.searchByLocation(location, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
