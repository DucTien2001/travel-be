import database from "database/models";
import { Container } from "typedi";

export default () => {
  Container.set("usersModel", database.users);
  Container.set("verifyCodesModel", database.verify_codes);
  Container.set("toursModel", database.tours);
  Container.set("tourBillsModel", database.tour_bills);
  Container.set("hotelsModel", database.hotels);
  Container.set("roomsModel", database.rooms);
  Container.set("roomBillsModel", database.room_bills);
  Container.set("roomBillDetailsModel", database.room_bill_details);
  Container.set("roomOtherPricesModel", database.room_other_prices);
  Container.set("checkRoomsModel", database.check_rooms);
  Container.set("tourCommentsModel", database.tour_comments);
  Container.set("hotelCommentsModel", database.hotel_comments);
};
