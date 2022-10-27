import database from "database/models";
import { Container } from "typedi";

export default () => {
  Container.set("usersModel", database.users);
  Container.set("toursModel", database.tours);
  Container.set("tourBillsModel", database.tour_bills);
  Container.set("roomsModel", database.rooms);
  Container.set("roomBillsModel", database.room_bills);
  Container.set("roomOtherPricesModel", database.room_other_prices);
  Container.set("checkRoomsModel", database.check_rooms);
};
