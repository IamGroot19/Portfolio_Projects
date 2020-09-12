////////////  ALL PRIMARY (index) ROUTES CAN BE FOUND HERE //////////////////

let router = require('express').Router();
let passport = require('passport'); 

let User = require('../db/user');

// homepage
router.get("/", (req,res) => {
    res.render("landing");
});

// Show register form
router.get( '/register', (req,res)=>{
    res.render('register.ejs');
});

// Handle signup logic
router.post("/register", (req,res)=>{
    
    let newUser = new User({ username: req.body.username});
    User.register(newUser, req.body.password, (err,user) =>{
        if(err) { 
            req.flash("error", err.message);
            return res.redirect("/register"); 
        };
        
        // once a user has signed up, we log them in, authenticate them and redirect them to campgrounds page once logged in. If
        passport.authenticate("local")(req, res, ()=>{
            req.flash("success", "Welcome to YelpCamp "+ user.username);
            res.redirect("/campgrounds"); });
    });
});

// Handle signin
router.get( '/login', (req, res) =>{
    res.render('login.ejs');
});

// you are essentially passing a passport middleware directly to ascertain whether login has occured or not. 
router.post('/login', 
        passport.authenticate("local", 
            {
                successRedirect: "/campgrounds", 
                failureRedirect:"/login",
                failureFlash: true,
            }), 
        (req,res) =>{ } //callback useless here since middleware takes care of everything - including redirect
);

// Log out route
router.get('/logout', (req,res)=>{

    req.logout(); //This comes from the passport-local-mongoose methods added to UserSchema
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});


function isLoggedIn(req,res,next){

    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Log in!")
    res.redirect('/login');
}

module.exports = router; 