import { PrismaClient } from '@prisma/client';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';

class AuthController {

    private prisma: any;
    private secret: any;
    
    constructor() {
        this.secret = process.env.secret
        this.prisma = new PrismaClient();
    }

    public login = async (req: express.Request, res: express.Response) => {
        try {
            const loginData = req.body;
            const user = await this.prisma.user.findUnique({
                where: {
                    email:loginData?.email
                }
            })
            if (user && user?.password === loginData.password) {
                const tokenData = this.generateToken(user);
                res.status(200).send({
                    message: 'Login successfully',
                    token: tokenData?.token
                })
            } else {
                res.status(401).send({
                    accessToken: null,
                    message: 'Invalid email or password'
                });
            }
        } catch (err) {
            res.status(500).send({
                message: err
            })
        }
    }

    private generateToken = (user: any) => {
        const expiresIn = 60*60;
        
        
        return {
            expiresIn,
            token: jwt.sign({id: user.id}, this.secret, { expiresIn }),
        }
    }

}
export default AuthController;