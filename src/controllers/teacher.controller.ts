import * as express from "express";

export default class TeacherController {

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
                    teacher_id: req.body.tokenData.id,
                    courses: { isActive: true },
                    isActive: true
                },
                include: {
                    courses: true,
                    time_table: true,
                    sections: { include: { batch: true } }
                }
            })
            res.status(200).send({ message: "data fetched.", data })
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "unable to get data.", error });
        }
    }

    public createPost = async (
        req: express.Request,
        res: express.Response
    ) => {
        try {
            const { files, body: { classId, title, isAssignment, description, deadline, totalMarks, allowComments } }: any = req;
            const file_paths = files.map((file: any) => file.filename)
            let data = await prisma.class_posts.create({
                data: {
                    class_id: parseInt(classId),
                    title,
                    description,
                    deadline,
                    total_marks: parseInt(totalMarks),
                    file_paths,
                    isAssignment: isAssignment === 'true',
                    allow_comments: allowComments === 'true'
                }
            })
            res.status(200).send({ message: 'data stored successfully', data })
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "unable to insert data in DB.", error });
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

    public getClassStudents = async (
        req: express.Request,
        res: express.Response
    ) => {
        try {
            const { classId }: any = req.query
            const data = await prisma.users.findMany({
                where: {
                    role: 'student',
                    isActive: true,
                    sections: {
                        classes: {
                            every: {
                                id: parseInt(classId)
                            }
                        }
                    }
                }, select: this.selectUser
            })
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
                    teacher_id: req.body.tokenData.id
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

    public markAttendance = async (
        req: express.Request,
        res: express.Response
    ) => {
        try {
            const { studentId, classId }: any = req.body;
            const data = await prisma.class_attendance.create({ data: { class_id: parseInt(classId), student_id: parseInt(studentId) } })
            res.status(200).send({ message: "data inserted.", data })
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "unable insert data.", error });
        }
    }

}