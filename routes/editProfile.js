const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const RobotModel = require('../models/userModel')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}
router.get('/', ensureAuthenticated, function (req, res, next) {
    RobotModel.getUserByUsername(req.user.username, function (error, user) {
        if (error) {
            console.log("Error fetching user ", error)
        }
        if (user) {
            user.skill0 = user.skills[0];
            user.skill1 = user.skills[1];
            user.skill2 = user.skills[2];
            res.render("editUser", user)
        }
    })
})
router.post('/', ensureAuthenticated, function (req, res, next) {
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render("editUser", { errors: errors })
    }
    else {
        var updateData = {
            username: req.body.username,
            name: req.body.name,
            avatar: req.body.avatar,
            email: req.body.email,
            university: req.body.university,
            job: req.body.job,
            company: req.body.company,
            skills: [req.body.skill0, req.body.skill1, req.body.skill2],
            phone: req.body.phone,
            address: {
                street_num: req.body.street_num,
                street_name: req.body.street_name,
                city: req.body.city,
                state_or_province: req.body.state_or_province,
                country: req.body.country
            }
        }
        RobotModel.updateUser(req.body.username, updateData)
            .then(function (data) {
                res.render('user', data)
            })
            .catch(function (error) {
                console.log("Error not able to update user", error)
            })
    }
})
module.exports = router;
