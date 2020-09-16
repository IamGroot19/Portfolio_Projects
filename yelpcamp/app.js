const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
let flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const expressSession = require('express-session');

const methodOverride = require('method-override');
let nodemailer = require('nodemailer');
let async = require('async');
let crypto = require('crypto'); // it's a part of node, no need to separately install.


const User = require('./db/user');
const seedDB = require('./seeds');
const Campground = require('./db/campgrounds.js');
const Comment = require('./db/comment.js');

const campgroundRoutes = require('./routes/campgroundRoutes');
const commentRoutes = require('./routes/commentRoutes');
const indexRoutes = require('./routes/indexRoutes');
const credentialRoutes = require('./routes/credentialRoutes');

mongoose.connect(process.env.DB_URL,  
                { useNewUrlParser: true, useUnifiedTopology: true }, 
                (err, client) => {
                    if (err) return console.log(err)
                    console.log("Freaking connected to Atlas DB...");
                });


let app = express();

app.use( bodyParser.urlencoded( { extended: true } ) );
app.set("view engine", "ejs"); 
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use( flash() ); // for flash notifs  (must come before passport configs)

// makes momentJS available for usage in all files as a variable named 'moment'
app.locals.moment = require('moment-timezone');  

// Purge the DB
//seedDB();

////////////// PASSPORT CONFIGURATION ///////////////////

app.use( expressSession({
    secret: "Some random sentence for key",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// you are defining a new Local Strategy object and are using it inside passport.use().
// passport-local-mongoose comes with methods like .authenticate(), .serializeUser() etc. that you plug in inside the UserSchema.  If you dont wanna use passport-local-mongoose, you can also define your own methods.btn

passport.use( new LocalStrategy( User.authenticate() )); 
passport.serializeUser( User.serializeUser() );
passport.deserializeUser( User.deserializeUser() );

////////////  Setting up basic routes  /////////////////////

//define a middleware to pass on the user details to every route  (so that you can restrict access based on whether they have logged in or not)
app.use( (req,res,next) => {

    res.locals.currentUser = req.user; // locals is the set of data available inside a template
    res.locals.success = req.flash("success"); 
    res.locals.error = req.flash("error");
    next(); //without this it will just stop and wont go to the route
});



// Importing router from routes file
app.use( '/', indexRoutes);  
app.use( '/campgrounds', campgroundRoutes);
app.use( '/campgrounds/:id/comments', commentRoutes);
app.use('/', credentialRoutes); 
/////////////  END OF ROUTING //////////

PORT = process.env.PORT || 6969; 
app.listen(PORT, process.env.IP, () => {
    console.log("Yelpcamp server started on Port ", PORT, "...");
});