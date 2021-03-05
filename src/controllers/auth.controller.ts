import { PrismaClient } from '@prisma/client';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import User from './../interfaces/User';
import TokenData from './../interfaces/TokenData';

class AuthController {

    private prisma: any;
    private secret: any;
    
    constructor() {
        this.secret = process.env.secret
        this.prisma = new PrismaClient();
    }

    public login = async (req: express.Request, res: express.Response) => {
        try {
            const loginData: TokenData = req.body;
            const user = await this.prisma.user.findUnique({
                where: {
                    user_id:loginData?.userId
                }
            })
            if (user?.password === loginData.password) {
                const tokenData = this.generateToken(user);
                res.status(200).send({
                    message: 'Login successfully',
                    token: tokenData?.token
                })
            } else {
                res.status(401).send({
                    message: 'Invalid email or password',
                    token: null
                });
            }
        } catch (err) {
            res.status(500).send({
                message: err
            })
        }
    }

    public resetPassword = async (req: express.Request, res: express.Response) => {
        try {
            const userId = req?.body?.userId;
            const user = await this.prisma.findUnique({
                where: {
                    user_id: userId
                }
            })
            if (!user) res.status(404).send({
              message: 'User not found'  
            });
            
        } catch (err) {
            res.status(500).send({
                message: err
            })
        }
    }

    private generateToken = (user: User) => {
        const expiresIn = 24*60*60;
        
        return {
            expiresIn,
            token: jwt.sign({id: user.id, role: user.role}, this.secret, { expiresIn }),
        }
    }

}
export default AuthController;