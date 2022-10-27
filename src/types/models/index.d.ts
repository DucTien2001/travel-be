import { CheckRoomAttributes, CheckRoomsInstance } from "database/models/checkRooms";
import { RoomBillAttributes, RoomBillsInstance } from "database/models/roomBills";
import { RoomOtherPriceAttributes, RoomOtherPricesInstance } from "database/models/roomOtherPrices";
import { RoomAttributes, RoomsInstance } from "database/models/rooms";
import { TourBillAttributes, TourBillsInstance } from "database/models/tourBills";
import { TourAttributes, ToursInstance } from "database/models/tours";
import { UserAttributes, UsersInstance } from "database/models/users";

declare global {
  namespace ModelsAttributes {
    export type User = UserAttributes;
    export type Tour = TourAttributes;
    export type Room = CheckRoomAttributes;
    export type CheckRoom = RoomAttributes;
    export type RoomOtherPrice = RoomOtherPriceAttributes;
    export type RoomBill = RoomBillAttributes;
    export type TourBill = TourBillAttributes;
  }

  namespace ModelsInstance {
    export type Users = UsersInstance;
    export type Tours = ToursInstance;
    export type Rooms = RoomsInstance;
    export type CheckRooms = CheckRoomsInstance;
    export type RoomOtherPrices = RoomOtherPricesInstance;
    export type RoomBills = RoomBillsInstance;
    export type TourBills = TourBillsInstance;
  }
}
