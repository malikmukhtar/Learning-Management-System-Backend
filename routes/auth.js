import express from "express";

const router = express.Router();

//controllers
import {register} from '../controllers/auth'

//route
router.post('/register', register)

module.exports = router;