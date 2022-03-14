import express from "express";
import cors from 'cors'
import {readdirSync} from 'fs'
import mongoose from "mongoose";
const morgan = require('morgan')
require('dotenv').config();

//create express app
const app = express();

//db
mongoose.connect(process.env.DATABASE, {
    useUnifiedTopology: true,
}).then(()=>console.log('DB CONNECTED')).catch(err=>console.log('DB CONNECTED ERR => ', err))

//apply middleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

//route
readdirSync('./routes').map(route=>app.use('/api', require(`./routes/${route}`)))

//port
const port = process.env.PORT || 8000

app.listen(port, ()=> console.log(`Server is running on ${port}`) )