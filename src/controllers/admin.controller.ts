import * as express from "express";
import fs from "fs";
import xlsToJson from "convert-excel-to-json";
import { User, Teacher, Program, Course } from "../interfaces/Admin";

export default class AdminController {
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
        prisma.users
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
      prisma.users
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
      prisma.programs
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

  public createCourse = async (req: express.Request, res: express.Response) => {
    try {
      const course: Course = {
        program_id: req.body.programId,
        name: req.body.name,
        credit_hr: req.body.creditHr,
        semester: req.body.semester,
        total_marks: req.body.totalMarks,
      };
      prisma.courses
        .create({ data: course })
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
