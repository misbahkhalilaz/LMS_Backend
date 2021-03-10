import * as express from 'express';
import fs from 'fs'
import xlsToJson from 'convert-excel-to-json';
import User from '../interfaces/createUser';
import {PrismaClient} from '@prisma/client'


export default class AdminController{

    private prisma: PrismaClient = new PrismaClient();

    public createStdAccounts = async (req: express.Request, res: express.Response) => {
        try {
            const students: Array<User> = await xlsToJson({  // convert uploaded xls to Json
                sourceFile: req.file.path,
                header: {
                    rows: 1
                },
                columnToKey: {
                    A: 'user_id',
                    B: 'name',
                    C: 'phone_no',
                    D: 'email'
                }
            }).Sheet1;

            fs.unlink(req.file.path, () => console.log(req.file.path, "deleted")); // delete xls file after storing data to db
        
            if (students) {
                this.prisma.users.createMany({ data: students.map(std => ({...std, phone_no: std.phone_no.toString()})), skipDuplicates: true })
                    .then(status => res.status(200).send({message: status.count + " Records added."}))
                    .catch(err => { throw { message: err } })
            } else throw {
                message: 'unable to read file'
            }

        } catch (error) {
            console.log(error);
            res.send(error)
        }
    }
         
}