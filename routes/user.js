const express = require('express')
const router = express.Router();

const{handleUserSignup}= require("../controllers/userController")



router.post('/', handleUserSignup)

module.exports = router;