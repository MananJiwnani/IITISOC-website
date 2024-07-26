const passport = require('passport'); 
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./user');

const GoogleStrategy = require('passport-google-oauth2').Strategy; 

passport.serializeUser((user , done) => { 
	// done(null , user); 
	done(null, user);
}); 

// passport.deserializeUser(function(user, done) { 
// 	done(null, user); 
// }); 

passport.deserializeUser(async (id, done) => {
	try {
	  const user = await User.findById(id);
	  done(null, user);
	} catch (err) {
	  done(err, null);
	}
});  

passport.use(new GoogleStrategy({ 
	clientID:process.env.CLIENT_ID,  
	clientSecret:process.env.CLIENT_SECRET, 
	callbackURL:"http://localhost:3000/auth/google/callback", 
	passReqToCallback:true
}, 
function(request, accessToken, refreshToken, profile, done) { 
	return done(null, profile); 
} 
));

