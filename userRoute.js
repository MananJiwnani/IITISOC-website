const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const router = express();
const userController = require('./userController');
const passport = require('passport'); 
require('./passport');

router.use(passport.initialize()); 
router.use(passport.session());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended:false }));

router.set('view engine','ejs');
router.set('views',path.join(__dirname, 'views'));

router.get('/login', userController.loadAuth);

router.get('/home', userController.homepage);
// Auth 
router.get('/auth/google' , passport.authenticate('google', { scope: 
	[ 'email', 'profile' ] 
})); 

// Auth Callback 
router.get( '/auth/google/callback', 
	passport.authenticate( 'google', { 
		successRedirect: '/success', 
		failureRedirect: '/failure'
}));

// Success 
router.get('/success', userController.successGoogleLogin); 

// failure 
router.get('/failure', userController.failureGoogleLogin);

module.exports = router;
