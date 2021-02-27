import express from "express";
import cors from 'cors';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as Sequelize from 'sequelize';

class Server {
 
  public app: express.Application;

  constructor() {
    dotenv.config();  //this must be called before any other func, otherwise this.config() will not get process.env.PORT
    this.app = express();
    this.config();
  }

  // testing github username only

  private config(): void {
    this.app.set('port', process.env.PORT || 3000);
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(cors());
  }

  public start(): void {
    this.app.listen(this.app.get('port'), () => {
      console.log(`Server is listening at port ${this.app.get('port')}`)
      console.log(process.env.PORT);
    })
  }

}
const server = new Server();
server.start();