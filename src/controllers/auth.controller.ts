import { PrismaClient } from '@prisma/client';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import User from './../interfaces/User';
import TokenData from './../interfaces/TokenData';
import transporter from '../utils/email/sendEmail';
import bcrypt from 'bcrypt';

class AuthController {

    private prisma: any;
    private secret: any;

    constructor() {
        this.secret = process.env.secret;
        this.prisma = new PrismaClient();
    }

    public login = async (req: express.Request, res: express.Response) => {
        try {
            const loginData: TokenData = req.body;
            const user = await this.prisma.users.findUnique({
                where: {
                    user_id: loginData?.userId
                }
            })
            if (user?.password) {  // check if user & it's password exists && user pass matches
                const compare: boolean = await bcrypt.compare(loginData.password, user.password);
                if (compare) {
                   const tokenData = this.generateToken(user);
                    res.status(200).send({
                        message: 'Login successfully',
                        token: tokenData?.token
                    }) 
                }
                 else {
                    res.status(401).send({
                        message: 'wrong password',
                        token: null
                    });
                }
                
            } 
            else
                if (user?.password === null) { // if pass is null, means user registered by admin but user never setup it's account.
                res.status(401).send({
                    message: 'Account regesterd but incomplete, create password for your account.'
                });
                } 
                else {
                    res.status(401).send({
                        message: 'Invalid email or password',
                        token: null
                    });
                }
        } catch (err) {
            console.log(err);
            res.status(500).send({
                message: err
            })
        }
    }

    public forgetPassword = async (req: express.Request, res: express.Response) => {
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
            const token = jwt.sign({ id: user.id, otp: randomOTP }, this.secret, { expiresIn });
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
                message: `OTP sent at ${info.accepted[0]}`,
                token: token
            })

        } catch (err) {
            res.status(500).send({
                message: err
            })
        }
    }

    public verifyOtp = async (req: express.Request, res: express.Response) => {
        try {
            if (req?.body?.otp) {
                const otp = parseInt(req?.body?.otp);
                const requestToken = req?.headers?.authorization?.split(' ')[1];
                if (requestToken) {
                    const user: any = jwt.verify(requestToken, this.secret);
                    if (user.otp === otp) {
                        const expiresIn = 5 * 60;
                        const token = jwt.sign({ id: user.id, otpSuccess: true }, this.secret, { expiresIn });
                        res.status(200).send({
                            message: 'Valid OTP',
                            token: token
                        })
                    } else {
                        res.status(404).send({
                            message: 'Invalid OTP'
                        })
                    }
                } else {
                    res.status(401).send({
                        message: 'Unauthorized token'
                    })
                }
            } else {
                res.status(500).send({
                    message: 'OTP is missing'
                })
            }
        } catch (err) {
            res.status(500).send({
                message: err
            })
        }
    }

    public resetPassword = async (req: express.Request, res: express.Response) => {
        try {
            if (req?.headers?.authorization) {
                const requestToken = req?.headers?.authorization?.split(' ')[1];
                if (requestToken) {
                    const verifyToken: any = jwt.verify(requestToken, this.secret);
                    if (verifyToken?.otpSuccess) {
                        const pass = await bcrypt.hash(req?.body?.password, 10);
                        const user = await this.prisma.users.update({
                            where: {
                                id: verifyToken.id
                            },
                            data: {
                                password: pass
                            }
                        });
                        if (user) {
                            res.status(200).send({
                                message: 'Password updated successfully'
                            })
                        }
                    } else {
                        throw {
                            unauthorized: true
                        }
                        
                    }
                } else {
                    throw {
                        unauthorized: true
                    }
                }
            } else {
                throw {
                    unauthorized: true
                }
            }
            
        } catch (err) {
            if (err.unauthorized) {
                res.status(401).send({
                    message: 'Unauthorized User'
                })
            } else {
                res.status(500).send({
                    message: err
                })
            }
        }
    }

    private generateToken = (user: User) => {
        const expiresIn = 24 * 60 * 60;

        return {
            expiresIn,
            token: jwt.sign({ id: user.id, role: user.role }, this.secret, { expiresIn }),
        }
    }

}
export default AuthController;