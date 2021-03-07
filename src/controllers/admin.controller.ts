import * as express from 'express';
import fs from 'fs'
import xlsToJson from 'convert-excel-to-json';


export default class AdminController{

    public createStdAccounts = async (req: express.Request, res: express.Response) => {
         const result = await xlsToJson({
            sourceFile: req.file.path,
            header:{
                rows: 1
            },
            columnToKey: {
                A: 'user',
                B: 'pass'
            }
         });
        console.log(result.Sheet1);
        fs.unlink(req.file.path, () => console.log(req.file.path, "deleted"))
        res.send(req.file.path)
    }

}