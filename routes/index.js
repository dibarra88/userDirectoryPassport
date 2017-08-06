const express = require('express')
const router = express.Router()
const RobotModel = require('../models/userModel')

router.get("/", ensureAuthenticated, function (req, res, next) {
    res.render('login');
})

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/users/login');
	}
}
module.exports = router;
