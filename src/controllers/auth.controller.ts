import * as express from "express";
import * as jwt from "jsonwebtoken";
import {
  LoginReq,
  LoginToken,
  LoginRes,
  AuthRes,
  ForgetpassToken,
  VerifyOtpToken,
} from "../interfaces/Auth";
import transporter from "../utils/email/sendEmail";
import bcrypt from "bcrypt";

class AuthController {
  private secret: any;

  constructor() {
    this.secret = process.env.secret;
  }

  public login = async (req: express.Request, res: express.Response) => {
    try {
      const loginData: LoginReq = req.body;
      const user = await prisma.users.findUnique({
        where: {
          user_id: loginData?.userId,
        },
      });
      if (!user) {
        res.status(401).send({ message: "user does not exist" });
      } else if (user.isActive) {
        if (user.password) {
          // check if user & it's password exists && user pass matches
          const compare: boolean = await bcrypt.compare(
            loginData.password,
            user.password
          );
          if (compare) {
            const tokenData: LoginToken = {
              id: user.id,
              password: loginData.password,
              role: user.role,
            };

            const token = jwt.sign(tokenData, this.secret, {
              expiresIn: 24 * 60 * 60,
            });
            const loggedIn: LoginRes = {
              message: "Loggedin successfully",
              token,
              userId: user.user_id,
              name: user.name,
              role: user.role,
              email: user.email,
              phone: user.phone_no,
            };
            res.status(200).send(loggedIn);
          } else {
            res.status(401).send({
              message: "wrong password",
            });
          }
        } else {
          // if pass is null, means user registered by admin but user never setup it's account.
          res.status(401).send({
            message:
              "Account setup incomplete, create password for your account.",
          });
        }
      } else {
        res.status(401).send({ message: "account disabled, contact admin" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message: err,
      });
    }
  };

  public forgetPassword = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const userId = req?.body?.userId;
      const user: any = await prisma.users.findUnique({
        where: {
          user_id: userId,
        },
      });
      if (!user)
        res.status(404).send({
          message: "User not found",
        });
      const randomOTP = Math.floor(100000 + Math.random() * 900000);
      const forgetpassToken: ForgetpassToken = { id: user.id, otp: randomOTP };
      const token = await jwt.sign(forgetpassToken, this.secret, {
        expiresIn: 120,
      });
      console.log(user?.email);
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: process.env.SENDER_EMAIL, // sender address
        to: user?.email, // list of receivers
        subject: "Reset Password", // Subject line
        text: "Your OTP is " + randomOTP, // plain text body
        // html: "<b>Hello world?</b>", // html body
      });
      console.log("Message sent: %s", info.messageId);
      const forgetpassRes: AuthRes = {
        message: `OTP sent at ${info.accepted[0]}`,
        token: token,
      };
      res.status(200).send(forgetpassRes);
    } catch (err) {
      res.status(500).send({
        message: err,
      });
    }
  };

  public verifyOtp = async (req: express.Request, res: express.Response) => {
    try {
      if (req?.body?.otp) {
        const otp = parseInt(req?.body?.otp);
        const user: any = req.body.tokenData;
        if (user) {
          if (user.otp === otp) {
            const otpToken: VerifyOtpToken = { id: user.id, otpSuccess: true };
            const token = jwt.sign(otpToken, this.secret, {
              expiresIn: 5 * 60,
            });
            const otpRes: AuthRes = {
              message: "Valid OTP",
              token: token,
            };
            res.status(200).send(otpRes);
          } else {
            res.status(404).send({
              message: "Invalid OTP",
            });
          }
        } else {
          res.status(401).send({
            message: "Unauthorized token",
          });
        }
      } else {
        res.status(500).send({
          message: "OTP is missing",
        });
      }
    } catch (err) {
      res.status(500).send({
        message: err,
      });
    }
  };

  public resetPassword = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      if (req.body.tokenData?.otpSuccess) {
        const pass = await bcrypt.hash(req?.body?.password, 10);
        const user = await prisma.users.update({
          where: {
            id: req.body.tokenData.id,
          },
          data: {
            password: pass,
          },
        });
        if (user) {
          res.status(200).send({
            message: "Password updated successfully",
          });
        }
      } else
        throw {
          unauthorized: true,
        };
    } catch (err) {
      if (err.unauthorized) {
        res.status(401).send({
          message: "Unauthorized User",
        });
      } else {
        res.status(500).send({
          message: err,
        });
      }
    }
  };
}
export default AuthController;
