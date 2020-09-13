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
    
    let newUser = new User({ 
        username: req.body.username, 
        firstName: req.body.firstname, 
        lastName: req.body.lastname, 
        avatar: req.body.avatar, 
        email: req.body.email,
        bio: req.body.bio 
    });

    if(req.body.admincode == 'secretADMINcode'){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err,user) =>{
        if(err) { 
            req.flash("error", err.message);
            return res.redirect("/register"); 
        };
        
        // once a user has signed up, we log them in, authenticate them and redirect them to campgrounds page once logged in. If
        passport.authenticate("local")(req, res, ()=>{
            if(user.isAdmin){
                req.flash("success", "Welcome to YelpCamp "+ user.username + ".You are also an Admin");
            }
            else{
                req.flash("success", "Welcome to YelpCamp "+ user.username );
            }
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

// Display Profile Page (SHOW route type)
router.get("/users/:userID", (req,res)=>{
    User.findById(req.params.userID, (err, foundUser) =>{
        if(err){
            req.flash("error", "There was a problem in fetching profile");    
            res.redirect("/campgrounds" + req.params.id); 
        }
        res.render("users.ejs", {user:foundUser} );
    });
});

// Log out route
router.get('/logout', (req,res)=>{

    req.logout(); //This comes from the passport-local-mongoose methods added to UserSchema
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

// Password reset  (EDIT route)
router.get('/users/:userID/password/reset', (req,res) =>{
    User.findById( req.params.userID, (err, foundUser) =>{
        res.render('pwdReset.ejs', {user: foundUser}); 
    });
});

// Password reset (UPDATE route) 
router.post('/users/:userID/password', (req,res) =>{
    User.findById(req.params.userID, (err,foundUser) =>{
        
        if(err){ throw err; res.status(500).json({'message':"user doesnt exist"}); }
        else{
            foundUser.setPassword( req.body.newPassword, () =>{
                foundUser.save();
                req.flash("success", "Password changed successfully");
                res.redirect('/users/' + foundUser._id); //their profile page
            });
        }
    });
});


// 
function isLoggedIn(req,res,next){

    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Log in!")
    res.redirect('/login');
}

module.exports = router; 