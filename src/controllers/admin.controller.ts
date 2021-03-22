import * as express from "express";
import fs from "fs";
import xlsToJson from "convert-excel-to-json";
import { User, Teacher, Program, Course, Batch } from "../interfaces/Admin";

export default class AdminController {

  public createTeacherAccounts = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const data: Teacher = {
        user_id: req.body.userId,
        name: req.body.name,
        phone_no: req.body.phone_no,
        email: req.body.email,
        role: "teacher",
      };
      prisma.users
        .create({ data })
        .then((status) =>
          res.status(200).send({ message: status.user_id + " added." })
        )
        .catch((error) => {
          console.log(error);
          res.status(500).send(error);
        });
    } catch (error) {
      res.status(500).send({ message: "unable to insert data in DB.", error });
    }
  };

  public createProgram = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const data: Program = {
        name: req.body.name,
        no_of_years: req.body.noOfYears,
        max_enrol_years: req.body.maxEnrolYears,
      };
      prisma.programs
        .create({ data })
        .then((status) =>
          res.status(200).send({ message: status.name + " added." })
        )
        .catch((error) => {
          console.log(error);
          res.status(500).send(error);
        });
    } catch (error) {
      res.status(500).send({ message: "unable to insert data in DB.", error });
    }
  };

  public createCourse = async (req: express.Request, res: express.Response) => {
    try {
      const data: Course = {
        program_id: req.body.programId,
        name: req.body.name,
        code: req.body.code,
        credit_hr: req.body.creditHr,
        semester: req.body.semester,
        total_marks: req.body.totalMarks,
      };
      prisma.courses
        .create({ data })
        .then((status) =>
          res.status(200).send({ message: status.name + " added." })
        )
        .catch((error) => {
          console.log(error);
          res.status(500).send(error);
        });
    } catch (error) {
      res.status(500).send({ message: "unable to insert data in DB.", error });
    }
  };

  private createBatchPayload = async (req: any) => {
    const files: any = await req.files
    let payload = {
      program_id: parseInt(req.body.programId),
      name: req.body.name,
      shift: req.body.shift,
      starting_yr: req.body.startingYr,
      ending_yr: req.body.endingYr,
      sections: await {
        create: files.map((file: any) => {
          let users = xlsToJson({
            // convert uploaded xls to Json
            sourceFile: file.path,
            header: {
              rows: 1,
            },
            columnToKey: {
              A: "user_id",
              B: "name",
              C: "phone_no",
              D: "email",
            },
          }).Sheet1
          return {
            name: file.fieldname,
            users: {create: users.map(user => ({...user, phone_no: user.phone_no.toString()}))}
          }} )

      }
    }
    return payload
  }

  public createBatch = async (req: express.Request, res: express.Response) => {
    try {
      // console.log(req.files);
      let files: any = req.files;
      if(files){
        let data = await this.createBatchPayload(req);
        files.forEach((file: any) => fs.unlink(file.path, () => console.log(file.path, "deleted")))
        // res.send(data)
        prisma.batch
          .create({data})
          .then((status) =>{
            console.log(status)
            res.status(200).send({ message: status.name + " added." })
          }
          )
          .catch((error) => {
            console.log(error);
            res.status(500).send(error);
          })}
          else{
            throw{
              error: "files missing"
            }
          }
    } catch (error) {
      console.log(error)
      res.status(500).send({ message: "unable to insert data in DB.", error });
    }
  };
}
