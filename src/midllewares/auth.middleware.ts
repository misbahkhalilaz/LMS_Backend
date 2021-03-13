import { Request, Response, NextFunction } from "express";

export default function authRole(
  req: Request,
  res: Response,
  next: NextFunction,
  role: string
) {
  if (req.body.tokenData.role === role) {
    next();
  } else {
    res.status(401).send({ message: "unauthorized access" });
  }
}
