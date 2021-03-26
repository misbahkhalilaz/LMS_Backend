import * as express from "express";
import fs from "fs";
import xlsToJson from "convert-excel-to-json";
import { User, Teacher, Program, Course } from "../interfaces/Admin";

export default class AdminController {
  public createTeacherAccounts = (
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
          res
            .status(200)
            .send({ message: status.user_id + " added.", data: status })
        )
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable to insert data in DB.", error });
    }
  };

  public createProgram = (
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
          res
            .status(200)
            .send({ message: status.name + " added.", data: status })
        )
        
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable to insert data in DB.", error });
    }
  };

  public createCourse = (req: express.Request, res: express.Response) => {
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
          res
            .status(200)
            .send({ message: status.name + " added.", data: status })
        )
        
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable to insert data in DB.", error });
    }
  };

  private createBatchPayload = (req: express.Request) => {
    const files: any = req.files;
    let payload = {
      program_id: parseInt(req.body.programId),
      name: req.body.name,
      shift: req.body.shift,
      starting_yr: req.body.startingYr,
      ending_yr: req.body.endingYr,
      sections: {
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
          }).Sheet1;
          return {
            name: file.fieldname,
            users: {
              create: users.map((user) => ({
                ...user,
                phone_no: user.phone_no.toString(),
              })),
            },
          };
        }),
      },
    };
    return payload;
  };

  public createBatch = (req: express.Request, res: express.Response) => {
    try {
      let files: any = req.files;
      if (files.length >= 1) {
        console.log(files);
        let data = this.createBatchPayload(req);
        files.forEach((file: any) =>
          fs.unlink(file.path, () => console.log(file.path, "deleted"))
        );
        prisma.batch
          .create({ data, include: { sections: { include: { users: true } } } })
          .then((status) => {
            console.log(status);
            res
              .status(200)
              .send({ message: status.name + " added.", data: status });
          })
         
      } else {
        throw {
          error: "files missing",
        };
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable to insert data in DB.", error });
    }
  };

  public createClass = (req: express.Request, res: express.Response) => {
    try {
      let data = {
        course_id: req.body.courseId,
        section_id: req.body.sectionId,
        teacher_id: req.body.teacherId,
      };
      prisma.classes
        .create({ data })
        .then((status) => {
          console.log(status);
          res.status(200).send({ message: "class added.", data: status });
        })
      
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable to insert data in DB.", error });
    }
  };

  public getProgramData = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      console.log(req.query);
      let query: any = req.query;
      let batches = await prisma.programs.findMany({
        where: {
          id: query.programId ? parseInt(query.programId) : undefined,
        },
        include: {
          batch: {
            where: {
              isActive: true,
              shift: query.shift,
            },
            include: {
              sections: true,
            },
          },
          courses: {
            where: {
              isActive: true,
            },
          },
        },
      });
      res.status(200).send({ message: "data fetched", data: batches });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable get data from DB.", error });
    }
  };

  public getUsers = async (req: express.Request, res: express.Response) => {
    try {
      let query: any = req.query;
      let data = await prisma.users.findMany({
        where: {
          isActive: query.isActive ? query.isActive === "true" : undefined,
          user_id: query.userId,
          role: query.role,
        },
        select: {
          id: true,
          user_id: true,
          name: true,
          phone_no: true,
          email: true,
          role: true,
          admission_year: true,
          isActive: true,
        },
      });
      res.status(200).send({ message: "data fetched", data });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable get data from DB.", error });
    }
  };

  public toggleUserInactive = (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      prisma.users.update({
        where: { user_id: req.body.userId }, data: { isActive: req.body.isActive }, select: {
          id: true,
          user_id: true,
          name: true,
          phone_no: true,
          email: true,
          role: true,
          admission_year: true,
          isActive: true,
        }
      })
        .then(status => res.status(200).send({ message: "User Updated", data: status }))
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable to update.", error });
    }
  };

  public getProgramsWithDetails = (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      prisma.programs.findMany({
        where: { id: { gt: 1 } },
        include: {
          batch: { where: { isActive: true }, include: { sections: true } }
        }
      }).then(data => res.status(200).send({message: "data fetched", data}))
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable get data from DB.", error });
    }
  }

}
