import res from "express/lib/response"
import User from "../models/user"
import { hashPassword, comparePassword } from "../utils/auth"
import jwt from 'jsonwebtoken'
import AWS from 'aws-sdk'
import { nanoid } from "nanoid"


const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    apiVersion: process.env.AWS_API_VERSION
}

//configuring aws ses
const SES = new AWS.SES(awsConfig)

export const register =async (req, res)=>{
try {
    //destructuring
    const {name, email, password} = req.body

    //validation
    if(!name) return res.status(400).send('name is required')
    if(!password || password.length < 6) return res.status(400).send('Password is required and must be greater that 5 characters')

    //check if email exist
    let userExit = await User.findOne({email}).exec()
    if(userExit) return res.status(400).send('Email already taken')

    //hash password
    const hashedPassword = await hashPassword(password)

    //save into database
    const user = new User({name, email, password:hashedPassword})

    await user.save()
    // console.log("🚀 ~ file: auth.js ~ line 24 ~ register ~ user", user)
    return res.json({name,email})
} catch (err) {
console.log("🚀 ~ file: auth.js ~ line 8 ~ register ~ err", err)
    return res.status(400).send('Error, Try Again')
}
}


export const login =async (req, res)=>{
    try {
        const {email, password} =req.body;

        const user = await User.findOne({email}).exec()

        if(!user) return res.status(400).send('No user found')

        const match = await comparePassword(password, user.password)

        if (!match) return res.status(400).send('Wrong Password')

        const token = jwt.sign({_id : user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        user.password = undefined;

        res.cookie('token', token, {
            httpOnly: true,
        })

        res.json(user)
    } catch (err) {
        console.log(err)
        return res.status(400).send('Error. Try Again.')
    }
}

export const logout=async(req, res)=>{
    try {
        res.clearCookie('token')
        return res.json({message: 'Signout success'})
    } catch (err) {
        console.log(err)
    }
}

export const currentUser = async (req, res) =>{
    try {
        const user = await User.findById(req.user._id).select('-password').exec()
        console.log("🚀 ~ file: auth.js ~ line 72 ~ currentUser ~ user", user)
        
        return res.json({ok: true})
    } catch (err) {
        console.log(err)
    }
}

export const sendTestEmail = async (req, res) =>{
    const params = {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses : ['malikmukhtar63@gmail.com']
        },
        ReplyToAddresses: [process.env.EMAIL_FROM],
        Message: {
            Body:{
                Html: {
                    Charset : 'UTF-8',
                    Data: `
                    <html>
                    <h1>Reset password link</h1>
                    <p>Please use this link to reset password</p>
                    <p>Id you didn't request for this please contact support team immediately</p>
                    </html>
                    `
                }
            },
            Subject:{
                Charset : 'UTF-8',
                Data: 'Password reset link'
            }
        }
    }

    const emailSent =  SES.sendEmail(params).promise();

    emailSent.then((data)=>{
        console.log(data)
        res.json({ok: true})
    }).catch(err=>{
        console.log(err)
    })
}


export const forgotPassword = async (req, res)=>{
    try {
        const {email} = req.body

        const shortcode = nanoid(6).toUpperCase();
        const user = await User.findOneAndUpdate({email}, {passwordResetCode: shortcode})

        if(!user) return res.status(400).send('User not found')

        const params = {
            Source : process.env.EMAIL_FROM,
            Destination: {
                ToAddresses: [email]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: `
                        <html>
                        <h1>Reset Password</h1>
                        <p>use this code to reset your password</p>
                        <h2 style='color:red;'>${shortcode}</h2>
                        <br/>
                        <i>ndemy.com</i>
                        </html>
                        `
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: 'Reset Password'
                }
            },
            
        }
        const emailSent = SES.sendEmail(params).promise();
        emailSent.then((data)=>{
            console.log(data)
            res.json({ok:true})
        }).catch(err=>{
        console.log("🚀 ~ file: auth.js ~ line 172 ~ emailSent.then ~ err", err)
            // console.log(err)
        })
    } catch (err) {
        console.log("🚀 ~ file: auth.js ~ line 175 ~ forgotPassword ~ err", err)
        // console.log(err)
    }
}


export const resetPassword = async (req, res)=>{
    try {
        const {email, code, newPassword} = req.body;

        const hashedPassword = await hashPassword(newPassword)

        const user = User.findOneAndUpdate({
            email, 
            passwordResetCode: code,
        }, {
            password: hashedPassword,
            passwordResetCode:''
        }).exec();
        res.json({ok:true})

    } catch (err) {
        console.log(err)
        return res.status(400).send('Error, try again')
    }
}