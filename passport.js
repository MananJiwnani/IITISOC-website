const passport = require('passport'); 
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./user');

const GoogleStrategy = require('passport-google-oauth2').Strategy; 

passport.serializeUser((user , done) => { 
	done(null, user._id); 
}) 

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
// async (request, accessToken, refreshToken, profile, done) => { 
// 	try {
// 	  // Find or create a user in your database
// 	  let user = await User.findOne({ googleId: profile.id });
  
// 	  if (!user) {
// 		user = new User({
// 		  googleId: profile.id,
// 		  email: profile.emails[0].value,
// 		  name: profile.displayName
// 		});
// 		await user.save();
// 	  }
  
// 	  return done(null, user); 
// 	} catch (err) {
// 	  return done(err, null);
// 	}
// }));

