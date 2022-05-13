import express from "express";
import cors from 'cors'
import {readdirSync} from 'fs'
import mongoose from "mongoose";
import csrf from 'csurf'
import cookieParser from "cookie-parser";
const morgan = require('morgan')
require('dotenv').config();

const csrfProtection = csrf({cookie:true})

//create express app
const app = express();

//db
mongoose.connect(process.env.DATABASE, {
    useUnifiedTopology: true,
}).then(()=>console.log('DB CONNECTED')).catch(err=>console.log('DB CONNECTED ERR => ', err))

//apply middleware
app.use(cors())
app.use(express.json({limit: '5mb'}))
app.use(cookieParser())
app.use(morgan('dev'))

//route
readdirSync('./routes').map(route=>app.use('/api', require(`./routes/${route}`)))

//csrf
app.use(csrfProtection)

app.get('/api/csrf-token', (req, res)=>{
    res.json({csrfToken: req.csrfToken()})
})

//port
const port = process.env.PORT || 8000

app.listen(port, ()=> console.log(`Server is running on ${port}`) )