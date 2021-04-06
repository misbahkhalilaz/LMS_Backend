import * as express from "express";

export default class TeacherController {

    public getClasses = async (
        req: express.Request,
        res: express.Response
    ) => {
        try {
            const data = await prisma.classes.findMany({
                where: {
                    teacher_id: req.body.tokenData.id
                },
                include: {
                    courses: true,
                    time_table: true,
                    sections: true
                }
            })
            res.status(200).send({ message: "data fetched.", data })
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "unable to insert data in DB.", error });
        }
    }

}