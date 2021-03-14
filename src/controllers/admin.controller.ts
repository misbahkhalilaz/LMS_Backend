import * as express from "express";
import fs from "fs";
import xlsToJson from "convert-excel-to-json";
import { User, Teacher } from "../interfaces/createUser";
import Program from "../interfaces/Program";
import { PrismaClient } from "@prisma/client";

export default class AdminController {
  private prisma: PrismaClient = new PrismaClient();

  public createStdAccounts = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      if (!req.file) {
        throw {
          error: "file not attached",
        };
      }
      const students: Array<User> = await xlsToJson({
        // convert uploaded xls to Json
        sourceFile: req.file.path,
        header: {
          rows: 1,
        },
        columnToKey: {
          A: "user_id",
          B: "name",
          C: "phone_no",
          D: "email",
        },
      }).Sheet1;

      fs.unlink(req.file.path, () => console.log(req.file.path, "deleted")); // delete xls file after storing data to db

      if (students) {
        this.prisma.users
          .createMany({
            data: students.map((std) => ({
              ...std,
              phone_no: std.phone_no.toString(),
            })),
            skipDuplicates: true,
          })
          .then((status) =>
            res.status(200).send({ message: status.count + " Records added." })
          );
      } else
        throw {
          error: "unable to read file",
        };
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  };

  public createTeacherAccounts = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const teacher: Teacher = {
        user_id: req.body.userId,
        name: req.body.name,
        phone_no: req.body.phone_no,
        email: req.body.email,
        role: "teacher",
      };
      this.prisma.users
        .upsert({
          where: { user_id: teacher.user_id },
          update: teacher,
          create: teacher,
        })
        .then((status) =>
          res.status(200).send({ message: status.user_id + " added." })
        )
        .catch((error) => {
          console.log(error);
          throw { error };
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
      const program: Program = {
        name: req.body.name,
        no_of_years: req.body.noOfYears,
        max_enrol_years: req.body.maxEnrolYears,
      };
      this.prisma.programs
        .create({ data: program })
        .then((status) =>
          res.status(200).send({ message: status.name + " added." })
        )
        .catch((error) => {
          console.log(error);
          throw { error };
        });
    } catch (error) {
      res.status(500).send({ message: "unable to insert data in DB.", error });
    }
  };
}
