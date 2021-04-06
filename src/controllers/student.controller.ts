import * as express from "express";

export default class StudentController {

    public getClasses = async (
        req: express.Request,
        res: express.Response
    ) => {
        try {
            const data = await prisma.classes.findMany({
                where: {
                    sections: {users: req.body.tokenData.id},
                    isActive: true
                },
                include: {
                    courses: true,
                    time_table: true,
                    users: true
                }
            })
            res.status(200).send({ message: "data fetched.", data })
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "unable to insert data in DB.", error });
        }
    }

}