import express from "express";
import cors from "cors";
import * as bodyParser from "body-parser";
import router from "./routes";
import checkToken from "./midllewares/app.middleware";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient;
}

global.prisma = new PrismaClient();

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
  }

  public config(): void {
    this.app.set("port", process.env.PORT || 3000);
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(checkToken);
    this.app.use(router);
  }

  public start(): void {
    this.app.listen(this.app.get("port"), () => {
      console.log(`Server is listening at port ${this.app.get("port")}`);
    });
  }
}
const server = new Server();
server.start();
