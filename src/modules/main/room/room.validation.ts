import * as yup from "yup";
import { Request } from "express";

export default class RoomValidation {
  static createNewRoom(req: Request) {
    const schema = yup
      .object({
        title: yup.string(),
        description: yup.string(),
        discount: yup.number(),
        tags: yup.string().nullable(),
        images: yup.string().nullable(),
        hotelId: yup.number(),
        numberOfBed: yup.number(),
        numberOfRoom: yup.number(),
        mondayPrice: yup.number(),
        tuesdayPrice: yup.number(),
        wednesdayPrice: yup.number(),
        thursdayPrice: yup.number(),
        fridayPrice: yup.number(),
        saturdayPrice: yup.number(),
        sundayPrice: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static updateRoomInformation(req: Request) {
    const schema = yup
      .object({
        title: yup.string(),
        description: yup.string(),
        tags: yup.string().nullable(),
        images: yup.string().nullable(),
        numberOfBed: yup.number(),
        numberOfRoom: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
  
  static updateRoomPrice(req: Request) {
    const schema = yup
      .object({
        discount: yup.number(),
        mondayPrice: yup.number(),
        tuesdayPrice: yup.number(),
        wednesdayPrice: yup.number(),
        thursdayPrice: yup.number(),
        fridayPrice: yup.number(),
        saturdayPrice: yup.number(),
        sundayPrice: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
  
  static getRoomsAvailable(req: Request) {
    const schema = yup
      .object({
        hotelId: yup.number(),
        startDate: yup.date(),
        endDate: yup.date(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
