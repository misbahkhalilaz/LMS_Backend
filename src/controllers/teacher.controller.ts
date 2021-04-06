import * as express from "express";

export default class TeacherController {

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
            const { files, body: { classId, title, isAssignment, description, deadline, totalMarks } }: any = req;
            const file_paths = files.map((file: any) => file.filename)
            let data = await prisma.class_posts.create({
                data: {
                    class_id: parseInt(classId),
                    title,
                    description,
                    deadline,
                    total_marks: parseInt(totalMarks),
                    file_paths,
                    isAssignment: isAssignment === 'true'
                }
            })
            res.status(200).send({ message: 'data stored successfully', data })
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "unable to insert data in DB.", error });
        }
    }

}