const express = require('express')
const router = express.Router()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const RobotModel = require('../models/userModel')

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/users/login');
	}
}
//Register
router.get('/register', function (req, res, next) {
    res.render('register');
})

// Login
router.get('/login', function (req, res) {
    res.render('login');
});

//Register New User
router.post('/register', function (req, res, next) {
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', { errors: errors });
    } else {
        var newUser = new RobotModel({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });
        RobotModel.createUser(newUser)
            .then(function (data) {
                req.flash('success_msg', 'You are registered and can now login');
                res.redirect('/users/login');
            })
            .catch(function (error) {
                console.log("Error creating new user ", error);
            })
    }
})

// Login
passport.use(new LocalStrategy(function (username, password, done) {
    RobotModel.getUserByUsername(username, function (err, user) {
        if (err) throw err;
        if (!user) {
            return done(null, false, { message: 'Unknown User' });
        }

        RobotModel.comparePassword(password, user.password, function (err, isMatch) {
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid password' });
            }
        });
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (_id, done) {
    RobotModel.getUserById(_id, function (err, user) {
        done(err, user);
    });
});
router.post('/login',
    passport.authenticate('local', { successRedirect: '/users', failureRedirect: '/users/login', failureFlash: true }),
    function (req, res, next) {
        res.redirect('/');
    });
//Log out
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});

/***LOADING USER DIRECTORY, USERS PROFILES, USERS BY COUNTRY, AND USERS BY SKILL ***/

//Load User Directory
router.get("/", ensureAuthenticated, function(req, res, next) {
    RobotModel.getAllUsers()
        .then(function (data) {
            res.render('userDirectory', { users: data })
        })
        .catch(function (error) {
            console.log("Error fetching users: ", error)
        })
})
router.get("/:username", ensureAuthenticated, function (req, res, next) {
    RobotModel.getUserByUsername(req.params.username, function (err, user) {
        if (err) throw err;
        if (user) {
            res.render('user', user)
        }
    })
})
router.get("/country/:country", ensureAuthenticated, function (req, res, next) {
    RobotModel.find().country(req.params.country)
        .then(function (data) {
            res.render('userDirectory', { users: data, country:req.params.country })
        })
        .catch(function (error) {
            console.log("Error fetching users by country: ", error)
        })
})
router.get("/skills/:skills",ensureAuthenticated, function (req, res, next) {
    RobotModel.find().skill(req.params.skills)
        .then(function (data) {
            res.render('userDirectory', { users: data })
        })
        .catch(function (error) {
            console.log("Error fetching users by skill: ", error)
        })
})
router.get("/status/employed",ensureAuthenticated, function (req, res, next) {
    RobotModel.find().employed(true)
        .then(function (data) {
            res.render('userDirectory', { users: data })
        })
        .catch(function (error) {
            console.log("Error fetching users by employment status: ", error)
        })
})
router.get("/status/unemployed", ensureAuthenticated, function (req, res, next) {
    RobotModel.find().employed(false)
        .then(function (data) {
            res.render('userDirectory', { users: data })
        })
        .catch(function (error) {
            console.log("Error fetching users by unemployment status: ", error)
        })
})

module.exports = router;
