import * as express from "express";

export default class StudentController {

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

  public getClasses = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const data = await prisma.classes.findMany({
        where: {
          sections: { users: { some: { id: req.body.tokenData.id } } },
          courses: { isActive: true },
          users: { isActive: true },
          isActive: true,
        },
        include: {
          courses: true,
          time_table: true,
          users: { select: this.selectUser },
        },
      });
      res.status(200).send({ message: "data fetched.", data })
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable to get data.", error });
    }
  }

  public getPosts = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      const { classId }: any = req.query
      const data = await prisma.class_posts.findMany({ where: { class_id: parseInt(classId) } })
      res.status(200).send({ message: "data fetched.", data })
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable to get data.", error });
    }
  }

  public getTimeTable = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      let data = await prisma.time_table.findMany({
        where: {
          isActive: true,
          sections: {
            users: {
              some: {
                id: req.body.tokenData.id
              }
            }
          }
        },
        include: {
          time_table: true
        }
      })
      res.status(200).send({ message: "data fetched.", data })
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "unable to get data.", error });
    }
  }

}