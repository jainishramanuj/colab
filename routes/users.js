
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');


// user model
const User = require('../models/User')

// login page
router.get('/login', forwardAuthenticated, (req,res) => res.render('login'));

// register page
router.get('/register', forwardAuthenticated, (req,res) => res.render('register'));

router.get('/dashboard', ensureAuthenticated, (req,res) => res.render('dashboard'));
router.get('/dashboard/profile', ensureAuthenticated, (req,res) => {
    Id=req.query.channelId
    res.render('profile',{channelId: Id})
    // console.log(req.query.channelId);
});


// Register handle :-
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //check required fields
    if(!name || !email || !password || !password2){
        errors.push({ msg : 'Please fill in all fields' });
    }

    //check password match
    if(password !== password2){
        errors.push({ msg : 'Password do not match'});
    }

    //check pass length
    if(password.length < 6){
        errors.push({ msg : 'Password should be at least 6 characters' });
    }

    if(errors.length > 0){
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else{
        // validation passed
        User.findOne({ email: email })
            .then(user => {
                if(user){
                    //User exists
                    errors.push({ msg : 'Email is already registred'});
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                }
                else{
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    // Hash password
                    bcrypt.genSalt(10, (err, salt) => 
                        bcrypt.hash(newUser.password, salt, (errl, hash) => {
                            if(errl) throw errl;
                            //set password to hash
                            newUser.password = hash;
                            //save User
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registred and can log in.');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                    }));
                }
            });
    }
});

// Login Handle :-
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/users/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle :-
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are Logged Out');
    res.redirect('/users/login');
});

module.exports = router;