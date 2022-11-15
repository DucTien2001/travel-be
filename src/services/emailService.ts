require("dotenv").config();
import { BuildOptions, Model, Sequelize } from "sequelize";
import nodemailer from "nodemailer";
// const nodemailer = require("nodemailer");
export class EmailService {
  static async sendConfirmSignUp(receiverEmail: string, authenticationLink: string) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_APP, // generated ethereal user
        pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
      },
    });

    // send mail with defined transport object
    return await transporter
      .sendMail({
        from: '"Travel service" <travelserviceute@gmail.com>', // sender address
        to: receiverEmail, // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `
        <h1>Test Sign up</h1>
        <a href=${authenticationLink} target="_blank">Click here</a>
        `, // html body
      })
      .then(() => {
        return { isSuccess: true };
      })
      .catch(() => {
        return { isSuccess: false };
      });
  }
  
  static async sendForgotPassword(receiverEmail: string, verifyCode: string) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_APP, // generated ethereal user
        pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
      },
    });

    // send mail with defined transport object
    return await transporter
      .sendMail({
        from: '"Travel service" <travelserviceute@gmail.com>', // sender address
        to: receiverEmail, // list of receivers
        subject: "Forgot password", // Subject line
        text: "Forgot password?", // plain text body
        html: `
        <h1>Test Sign up</h1>
        <p>Code verify: ${verifyCode}</p>
        `, // html body
      })
      .then(() => {
        return { isSuccess: true };
      })
      .catch(() => {
        return { isSuccess: false };
      });
  }
  
  static async sendConfirmBookTour(receiverEmail: string, authenticationLink: string) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_APP, // generated ethereal user
        pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
      },
    });

    // send mail with defined transport object
    return await transporter
      .sendMail({
        from: '"Travel service" <travelserviceute@gmail.com>', // sender address
        to: receiverEmail, // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `
        <h1>Test book tour</h1>
        <a href=${authenticationLink} target="_blank">Click here</a>
        `, // html body
      })
      .then(() => {
        return { isSuccess: true };
      })
      .catch(() => {
        return { isSuccess: false };
      });
  }
}
export default EmailService;
