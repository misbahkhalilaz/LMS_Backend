import express from "express";
import cors from 'cors';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import router from "./routes";
// test prisma ///////////////////////////////////////
import { PrismaClient } from '@prisma/client' // npm run prisma will generate schema according to connected db plus this client also created in node_modules to access db.

const prisma = new PrismaClient() //db client instance

 async function test() {
    const allUsers = await prisma.auth.findMany() //query
    console.log(allUsers)
  } 

  test()

///////////////////////////////////////////////


class Server {
 
  public app: express.Application;

  constructor() {
    dotenv.config();  //this must be called before any other func, otherwise this.config() will not get process.env.PORT
    this.app = express();
    this.config();
  }

  private config(): void {
    this.app.set('port', process.env.PORT || 3000);
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(cors());
    this.app.use(router);
  }

  public start(): void {
    this.app.get('/', (req, res) => prisma.auth.findMany().then(r => res.send(r))) // for hosting build test
    this.app.listen(this.app.get('port'), () => {
      console.log(`Server is listening at port ${this.app.get('port')}`)
      console.log(process.env.PORT);
    })
  }

}
const server = new Server();
server.start();