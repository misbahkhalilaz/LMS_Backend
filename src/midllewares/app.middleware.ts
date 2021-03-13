import * as express from "express";
import * as jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const checkToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const openPaths = ["/auth/login", "/auth/forgetPassword"];
    const specialTokenPaths = ["/auth/verifyOtp", "/auth/resetPassword"];
    if (req.headers.authorization) {
      const requestToken = req?.headers?.authorization?.split(" ")[1];
      if (requestToken) {
        const secret: any = await process.env.secret;
        const tokenData: any = await jwt.verify(requestToken, secret);
        if (specialTokenPaths.includes(req.path)) {
          req.body.tokenData = tokenData;
          next();
        } else {
          const prisma = new PrismaClient();
          const user: any = await prisma.users.findUnique({
            where: {
              id: tokenData?.id,
            },
          });
          if (await bcrypt.compare(tokenData?.password, user?.password)) {
            req.body.tokenData = { id: tokenData.id, role: tokenData.role };
            next();
          } else {
            throw {
              message: "wrong credentials",
            };
          }
        }
      } else {
        throw { message: "Bearer token required in authorization header" };
      }
    } else if (openPaths.includes(req.path)) {
      next();
    } else {
      throw { message: "Bearer token required in authorization header" };
    }
  } catch (err) {
    res.status(401).send(err);
  }
};

export default checkToken;
