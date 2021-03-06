import { PrismaClient } from '@prisma/client';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import User from './../interfaces/User';
import TokenData from './../interfaces/TokenData';
import transporter from '../utils/email/sendEmail';

class AuthController {

    private prisma: any = new PrismaClient();
    private secret: any;
    
    constructor() {
        this.secret = process.env.secret
        this.prisma = new PrismaClient();
    }

    public login = async (req: express.Request, res: express.Response) => {
        try {
            const loginData: TokenData = req.body;
            const user = await this.prisma.users.findUnique({
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
            const user = await this.prisma.users.findUnique({
                where: {
                    user_id: userId
                }
            });
            if (!user) res.status(404).send({
              message: 'User not found'  
            });
            const randomOTP = Math.floor(100000 + Math.random() * 900000);
            const expiresIn = 120;
            const token = jwt.sign({id: user.id, role: user.role, otp: randomOTP}, this.secret, {expiresIn});
            console.log(user?.email);
            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: process.env.SENDER_EMAIL, // sender address
                to: user?.email, // list of receivers
                subject: "Reset Password", // Subject line
                text: "Your OTP is " + randomOTP, // plain text body
                // html: "<b>Hello world?</b>", // html body
            });
            console.log("Message sent: %s", info.messageId);
            res.status(200).send({
                message: info,
                token: token
            })
            
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