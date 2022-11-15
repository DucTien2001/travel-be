import { CheckRoomAttributes, CheckRoomsInstance } from "database/models/checkRooms";
import { HotelAttributes, HotelsInstance } from "database/models/hotels";
import { RoomBillDetailAttributes, RoomBillDetailsInstance } from "database/models/roomBillDetails";
import { RoomBillAttributes, RoomBillsInstance } from "database/models/roomBills";
import { RoomOtherPriceAttributes, RoomOtherPricesInstance } from "database/models/roomOtherPrices";
import { RoomAttributes, RoomsInstance } from "database/models/rooms";
import { TourBillAttributes, TourBillsInstance } from "database/models/tourBills";
import { TourAttributes, ToursInstance } from "database/models/tours";
import { UserAttributes, UsersInstance } from "database/models/users";
import { VerifyCodeAttributes, VerifyCodesInstance } from "database/models/verifyCodes";

declare global {
  namespace ModelsAttributes {
    export type User = UserAttributes;
    export type VerifyCode = VerifyCodeAttributes;
    export type Tour = TourAttributes;
    export type Hotel = HotelAttributes;
    export type Room = RoomAttributes;
    export type CheckRoom = CheckRoomAttributes;
    export type RoomOtherPrice = RoomOtherPriceAttributes;
    export type RoomBill = RoomBillAttributes;
    export type RoomBillDetail = RoomBillDetailAttributes;
    export type TourBill = TourBillAttributes;
  }

  namespace ModelsInstance {
    export type Users = UsersInstance;
    export type VerifyCodes = VerifyCodesInstance;
    export type Tours = ToursInstance;
    export type Hotels = HotelsInstance;
    export type Rooms = RoomsInstance;
    export type CheckRooms = CheckRoomsInstance;
    export type RoomOtherPrices = RoomOtherPricesInstance;
    export type RoomBills = RoomBillsInstance;
    export type RoomBillDetails = RoomBillDetailsInstance;
    export type TourBills = TourBillsInstance;
  }
}
