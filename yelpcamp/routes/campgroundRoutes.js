///////////////////  ALL CAMPGROUNDS RELATED ROUTES IN THIS FILE //////////////////////

let router = require('express').Router();
const { request } = require('express');
let Campground = require('../db/campgrounds');
let Comment = require('../db/comment');


// INDEX route
router.get("/", (req,res) => {

    Campground.find( {}, (err, allCamps) => {
        if(err) { console.log(err); }
        else{
            res.render("campgrounds/index.ejs", {camps:allCamps, currUser:req.user});
        }
    });   
});

// CREATE Route
router.post('/', isLoggedIn,  (req,res) => {
    
    let name = req.body.campName; 
    let image = req.body.campImg; 
    let desc = req.body.description;
    let author = { id : req.user._id, username: req.user.username };
    let campgrd = { name: name, image: image, description:desc, author:author };
    
    Campground.create(campgrd)
        .then( (newlyCreatedCamp) => {
           // console.log(campgrd);
        })
        .catch( (err) => {
            return console.log(err);
        });
    req.flash("success", "Campground Created Successfully!!!")
    res.redirect("/campgrounds");
}); 

// NEW route
router.get("/new", isLoggedIn, (req,res) => {

    res.render("campgrounds/newcamp.ejs");
}); 


// SHOW route
router.get("/:id", isLoggedIn, (req,res)=>{

    Campground.findById(req.params.id)
        .populate("comments")
        .exec( (err, camp) => {
            
            if(err){ req.flash("error", "There was a problem in fetching the Campground from database"); }
            else{
                //console.log(camp);
                res.render( "campgrounds/show.ejs", {camp:camp});     
            }
        }); 
});

// EDIT campground
router.get('/:id/edit', checkCampgrdOwner, (req,res) =>{

    Campground.findById(req.params.id, (err, camp) =>{

        if(err) { req.flash("error", "Campground not found"); }
        res.render("./campgrounds/editCamp.ejs", {camp:camp});
    });
    
});

// UPDATE campground
router.put("/:id", (req,res) => {
    let updatedCamp = { name: req.body.campName, image:req.body.campImg, description:req.body.description};
    
    Campground.findByIdAndUpdate( req.params.id, 
                                  updatedCamp, 
                                 (err,updatedCamp) =>{
        if(err) { console.log(err); res.redirect("/campgrounds"); }
        else{
            //console.log(updatedCamp);
            req.flash("success", "Campground Updated Successfully")
            res.redirect('/campgrounds/'+ req.params.id );
        }
    });
});


// DELETE campground
router.delete("/:id", checkCampgrdOwner, (req,res) =>{

    Campground.findByIdAndDelete( req.params.id, (err,deletedObj) =>{

        if(err) { req.flash("error", "There was a problem deleting the campground. ");
                  res.redirect("/:id"); }
        Comment.deleteMany( { _id: { $in: deletedObj.comments }}, (err) => {

            if(err) { return console.log(err); }
            req.flash("success", "Campground deleted successfully.")
            res.redirect('/campgrounds'); 
        });  
    });
});

// Middleware
function isLoggedIn(req,res,next){

    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", " You need to be logged in to do that!");
    res.redirect('/login');
}

// check if a person owns a campgruond to provide edit & delete access
function checkCampgrdOwner(req,res,next){
    
    if(req.isAuthenticated()){

        Campground.findById( req.params.id)
        .then( (camp) => {
            
            if( camp.author.id.equals(req.user._id) ){
                next();
            }
            else{
                req.flash("error", "Only Campground owners have permission to Delete/Edit.")
                res.send("back");
            }
        })
        .catch( (err) => {
            req.flash("error", "Campground doesn't exist!")
            console.log(err);
            res.redirect("back");
         });
    }
    else{
        req.flash("error", " You need to be logged in to do that!");
        res.send("back");
    }
    
}
module.exports = router; 