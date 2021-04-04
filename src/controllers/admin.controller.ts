import * as express from "express";
import fs from "fs";
import xlsToJson from "convert-excel-to-json";
import { TimeTable, Teacher, Program, Course } from "../interfaces/Admin";

export default class AdminController {

  private selectUser = {
    id: true,
    user_id: true,
    name: true,
    phone_no: true,
    email: true,
    role: true,
    admission_year: true,
    isActive: true,
  }

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

      let response = await prisma.users.create({ data })
      res.status(200).send({ message: response.user_id + " added.", data: response })

    } catch (error) {
      console.log(error);
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

      let response = await prisma.programs.create({ data })
      res.status(200).send({ message: response.name + " added.", data: response })

    } catch (error) {
      console.log(error);
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

      let response = await prisma.courses.create({ data })
      res.status(200).send({ message: response.name + " added.", data: response })

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

  public createBatch = async (req: express.Request, res: express.Response) => {
    try {
      let files: any = req.files;
      if (files.length >= 1) {
        console.log(files);
        let data = this.createBatchPayload(req);
        files.forEach((file: any) =>
          fs.unlink(file.path, () => console.log(file.path, "deleted"))
        );

        let response = await prisma.batch.create({ data, include: { sections: { include: { users: true } } } })
        res.status(200).send({ message: response.name + " added.", data: response })

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

  public createClass = async (req: express.Request, res: express.Response) => {
    try {
      let data = {
        course_id: req.body.courseId,
        section_id: req.body.sectionId,
        teacher_id: req.body.teacherId,
      };
      let status;
      if (req.body.labTeacherId)
        status = await prisma.classes.createMany({ data: [data, { ...data, teacher_id: req.body.labTeacherId, type: 'Lab' }] })
      else
        status = await prisma.classes.create({ data })

      res.status(200).send({ message: "class added.", data: status });
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
      let where = {
        isActive: query.isActive ? query.isActive === "true" : undefined,
        user_id: query.userId,
        role: query.role,
      }

      let totalPages: any = null;
      let pageSize: number = parseInt(query.pageSize) > 0 ? parseInt(query.pageSize) : 20;

      if (query.page === '1') {
        totalPages = await prisma.users.count({ where })
      }

      let data = await prisma.users.findMany({
        where,
        select: this.selectUser,
        skip: query.page ? (parseInt(query.page) - 1) * pageSize : 0,
        take: pageSize
      });
      res.status(200).send({ message: "data fetched", data, totalPages: Math.floor((totalPages + pageSize - 1) / pageSize) });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable get data from DB.", error });
    }
  };

  public changeUserIsactive = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      let response = await prisma.users.update({
        where: {
          id: req.body.id
        },
        data: {
          isActive: req.body.isActive
        },
        select: this.selectUser,
      })
      res.status(200).send({ message: "User Updated", data: response })
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable to update.", error });
    }
  };

  public getProgramsWithDetails = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      let response = await prisma.programs.findMany({
        where: {
          id: {
            gt: 1
          }
        },
        include: {
          batch: {
            where: {
              isActive: true
            },
            include: {
              sections: true
            }
          }
        }
      })
      res.status(200).send({ message: "data fetched", data: response })
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable get data from DB.", error });
    }
  }

  public getStudents = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      let query: any = req.query;
      let pageSize: number = parseInt(query.pageSize) > 0 ? parseInt(query.pageSize) : 20;

      let where: any = {
        role: 'student',
        isActive: req.query.isActive ? req.query.isActive === "true" : undefined,
      };

      where = query.sectionId ?
        { ...where, section_id: parseInt(query.sectionId) }
        : query.batchId ?
          { ...where, sections: { batch_id: parseInt(query.batchId) } }
          : query.programId ?
            { ...where, sections: { batch: { program_id: parseInt(query.programId) } } }
            : query.shift ?
              { ...where, sections: { batch: { shift: query.shift } } }
              : where;

      let totalPages: any = null;
      if (query.page === '1') {
        totalPages = await prisma.users.count({ where })
      }

      let data = await prisma.users.findMany({
        where,
        select: this.selectUser,
        skip: query.page ? (parseInt(query.page) - 1) * pageSize : 0,
        take: pageSize
      })
      res.status(200).send({ message: "data fetched.", filters: where, data, totalPages: Math.floor((totalPages + pageSize - 1) / pageSize) })
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable get data from DB.", error });
    }
  }

  public searchUsers = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      let body: any = req.body
      let query: any = req.query
      let pageSize: number = parseInt(query.pageSize) > 0 ? parseInt(query.pageSize) : 20;

      let where = {
        AND: [
          body.filters,
          {
            OR: [
              { user_id: { contains: body.query } },
              { name: { contains: body.query } },
              { phone_no: { contains: body.query } },
              { email: { contains: body.query } }
            ]
          }
        ]
      }

      let totalPages: any = null;
      if (query.page === '1') {
        totalPages = await prisma.users.count({ where })
      }

      let data = await prisma.users.findMany({
        where,
        select: this.selectUser,
        skip: query.page ? (parseInt(query.page) - 1) * pageSize : 0,
        take: pageSize
      })
      res.status(200).send({ message: "data fetched.", data, totalPages: Math.floor((totalPages + pageSize - 1) / pageSize) })
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "No data found.", error });
    }
  }

  public getCourses = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      let { isActive, programId, semester, sectionId }: any = req.query;
      let data;
      let where = {
        isActive: isActive ? isActive === "true" : undefined,
        program_id: programId ? parseInt(programId) : undefined,
        semester: semester ? parseInt(semester) : undefined
      }
      if (sectionId) {
        data = await prisma.courses.findMany({ where: { ...where, classes: { every: { section_id: { not: parseInt(sectionId) } } } } })
      }
      else
        data = await prisma.courses.findMany({ where })
      res.status(200).send({ message: 'data fetched.', data })
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "No data found.", error });
    }
  }

  public changeCourseIsActive = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      let response = await prisma.courses.update({
        where: {
          id: req.body.id
        },
        data: {
          isActive: req.body.isActive
        }
      })
      res.status(200).send({ message: "Course Updated", data: response })
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable to update.", error });
    }
  };

  public createTimeTable = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const data: Array<TimeTable> = req.body.map(
        ({ classId, semester, shift, sectionId, day, teacherId, period, roomId }: any) =>
          ({ class_id: classId, semester, shift, section_id: sectionId, teacher_id: teacherId, period, room_id: roomId, day }));

      let response = await prisma.time_table.createMany({ data })
      res.status(200).send({ message: "schedule added.", data: response })
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable to insert data in DB.", error });
    }
  }

  public getClassesBySection = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      let { sectionIds }: any = req.query;
      sectionIds = sectionIds.split(',').map((id: any) => parseInt(id))
      let data: any = await prisma.classes.findMany({
        where: {
          section_id: { in: sectionIds },
          isActive: true
        },
        include: {
          users: { select: this.selectUser },
          courses: true
        }
      })
      res.status(200).send({ message: "data fetched.", data })
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "No data found.", error });
    }
  }

  public getAvailableRooms = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const { shift }: any = req.query
      let availableRooms =
        [
          [1, 2, 3], //Mon
          [1, 2, 3], //Tue
          [1, 2, 3], //wed
          [1, 2, 3], //thu
          [1, 2]     //fri
        ]

      const getRooms = (shift: string, day: number, period: number) => prisma.rooms.findMany({
        where: {
          time_table: {
            none: {
              AND: [
                { isActive: true },
                { shift },
                { period },
                { day }
              ]
            }
          }
        }
      })

      let data: any = await Promise.all(availableRooms.map(
        (dayArr, dayI) =>
          prisma.$transaction(dayArr.map(
            period =>
              getRooms(shift, dayI + 1, period)
          )
          )
      )
      )

      data = data.map(
        (dayArr: any, dayI: any) => ({
          [dayI + 1]: dayArr.map(
            (periods: any, perriodI: any) => ({
              [perriodI + 1]: periods
            }))
        }))

      res.status(200).send({ message: "data fetched", data })
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "No data found.", error });
    }

  }
}
