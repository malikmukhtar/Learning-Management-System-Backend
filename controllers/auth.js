import User from "../models/user"
import { hashPassword, comparePassword } from "../utils/auth"

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