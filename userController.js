const express= require('express');
const app= express();

const loadAuth = (req, res) => {
    res.render('login.ejs');
}

const homepage = (req, res) => {
    res.render('home.ejs');
}

const successGoogleLogin = (req, res) => { 
	if(!req.user) 
		res.redirect('/failure'); 
    console.log(req.user);
	// res.send("Welcome " + req.user.email);
    res.redirect('/home');
}

const failureGoogleLogin = (req, res) => { 
	res.send("Error"); 
}

module.exports = {
    loadAuth,
    homepage,
    successGoogleLogin,
    failureGoogleLogin
}