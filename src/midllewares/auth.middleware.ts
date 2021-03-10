import * as express from "express";
import * as jwt from "jsonwebtoken";

const checkToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const openPaths = ["/auth/login", "/auth/forgetPassword"];
    if (req.headers.authorization) {
    //   break token, check bearer, decrypt it and attach to req.
    next();
  } else if (openPaths.includes(req.path)) {
    next();
  } else {
    res.send({ message: "Bearer token required in authorization header" });
  }
};

export default checkToken;
