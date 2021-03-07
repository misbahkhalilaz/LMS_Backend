import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SENDER_EMAIL, 
      pass: process.env.SENDER_PASSWORD, 
    },
  });
export default transporter;