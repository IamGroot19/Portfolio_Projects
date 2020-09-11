let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let passport = require('passport');
let LocalStrategy = require('passport-local');
let expressSession = require('express-session');
let User = require('./db/user');
let seedDB = require('./seeds');
let Campground = require('./db/campgrounds.js');
const Comment = require('./db/comment.js');

mongoose.connect("mongodb://localhost/yelpCamp_db",  
                { useNewUrlParser: true, useUnifiedTopology: true }, 
                (err, client) => {
                    if (err) return console.log(err)
                    console.log("Successfully connected to DB...");
                });

let app = express();
app.use( bodyParser.urlencoded( { extended: true } ) );
app.set("view engine", "ejs"); 
app.use(express.static(__dirname + '/public'));

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

// homepage
app.get("/", (req,res) => {
    res.render("landing");
});

// INDEX route
app.get("/campgrounds", (req,res) => {

    Campground.find( {}, (err, allCamps) => {
        if(err) { console.log(err); }
        else{
            res.render("campgrounds/index.ejs", {camps:allCamps});
        }
    }); 

     
});

// CREATE Route
app.post('/campgrounds', (req,res) => {

    let name = req.body.campName; 
    let image = req.body.campImg; 
    let desc = req.body.description;
    let campgrd = { name: name, image: image, description:desc };
    Campground.create(campgrd)
        .then( (newlyCreatedCamp) => {
            console.log(campgrd);
        })
        .catch( (err) => {
            return console.log(err);
        });
    res.redirect("/campgrounds");
}); 

// NEW route
app.get("/campgrounds/new", (req,res) => {

    res.render("campgrounds/newcamp.ejs");
}); 


// SHOW route

app.get("/campgrounds/:id", (req,res)=>{

    Campground.findById(req.params.id)
        .populate("comments")
        .exec( (err, camp) => {
            
            if(err){ console.log(err); }
            else{
               // console.log(camp);
                res.render( "campgrounds/show.ejs", {camp:camp});     
            }
        }); 
});

app.get('/campgrounds/:id/comments/new', (req,res) => {
    
    Campground.findById( req.params.id, (err,camp) => {
        if(err) { console.log(err); }
        else{
            
            res.render("comments/newComment.ejs", {camp:camp});
        }
    });
    //res.send("Form to add comments");
});

app.post( "/campgrounds/:id/comments", (req,res) => {
    
    Campground.findById(req.params.id, (err, camp) =>{
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        }
        else{
            //console.log(req.body.commentAuthor, req.body.commentText);
            Comment.create( { author:req.body.commentAuthor, text:req.body.commentText } )
                .then( (savedComment) => {
                   // console.log(savedComment);
                    camp.comments.push(savedComment); 
                    camp.save();
                    res.redirect('/campgrounds/' + camp._id);
                })
                .catch( (err) => {
                    console.log(err);
                });
                
        }
    }); 
});

///////////////// END OF AUTH ROUTES /////////////////////////

// Show register form
app.get( '/register', (req,res)=>{
    res.render('register.ejs');
});

// handle signup logic
app.post("/register", (req,res)=>{
    
    let newUser = new User({ username: req.body.username});
    User.register(newUser, req.body.password, (err,user) =>{
        if(err) { 
            console.log(err); 
            return res.render("/register"); 
        };
        
        // once a user has signed up, we log them in, authenticate them and redirect them to campgrounds page once logged in. If
        passport.authenticate("local")(req,res, ()=>{
            res.redirect("/campgrounds");
        });
    });
});


/////////////  END OF ROUTING //////////

PORT = process.env.PORT || 6969; 
app.listen(PORT, process.env.IP, () => {
    console.log("Yelpcamp server started on Port ", PORT, "...");
});