///////////////////  ALL CAMPGROUNDS RELATED ROUTES IN THIS FILE //////////////////////

let router = require('express').Router();
const express = require('express');
let Campground = require('../db/campgrounds');
let Comment = require('../db/comment');
let User = require('../db/user.js');

const NodeGeocoder = require('node-geocoder');

// Right before middlewares, put this geocoder thingy...
let options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

let Geocoder = NodeGeocoder(options);

// INDEX route
router.get("/", (req,res) => {

    Campground.find( {}, (err, allCamps) => {
        if(err) { console.log(err); }
        else{
            res.render("campgrounds/index.ejs", {camps:allCamps, currUser:req.user});
        }
    });   
});


// NEW route
router.get("/new", isLoggedIn, modCampRestriction, (req,res) => {
    
    res.render("campgrounds/newcamp.ejs");
}); 

// CREATE Route
router.post('/', isLoggedIn, modCampRestriction, (req,res) => {
    
    
    let name = req.body.campName; 
    let image = req.body.campImg; 
    let desc = req.body.description;
    let price = req.body.campPrice; 
    let author = { id : req.user._id, username: req.user.username };
    let cmntLoopFlag = true;
    Geocoder.geocode( req.body.location, (err,data) => {

        if(err || !data.length){
            console.log('error: ', err);
            console.log('data: ', data);
          /*  if(!data.length) { req.flash('error', 'Invalid address - zero datalength');}
            else{  req.flash('error', 'Invalid address' + err.message); }  */
            return res.redirect('/campgrounds/new');
        }
        let lat = data[0].latitude;
        let lon = data[0].longitude;
        let location= data[0].formattedAddress;

        let campgrd = { name: name, image: image, description:desc, author:author, price:price,
            lat:lat, lon:lon, location:location, cmntLoopFlag:cmntLoopFlag };

        Campground.create(campgrd)
        .then( (newlyCreatedCamp) => {
            //console.log(campgrd);
        })
        .catch( (err) => {
            return console.log(err);
        });
        req.flash("success", "Campground Created Successfully!!!")
        res.redirect("/campgrounds");
    }); // end of geocoder() 

}); //end of routehandler


// SHOW route
router.get("/:id", isLoggedIn, (req,res)=>{

    Campground.findById(req.params.id)
        .populate("comments")
        .exec( (err, camp) => {
            
            if(err){ req.flash("error", "There was a problem in fetching the Campground from database"); }
            else{
                //console.log('camp object insider: ' ,camp);
                res.render( "campgrounds/show.ejs", {camp:camp});     
            }
        }); 
});

// EDIT campground
router.get('/:id/edit',modCampRestriction, checkCampgrdOwner, (req,res) =>{

    Campground.findById(req.params.id, (err, camp) =>{

        if(err) { req.flash("error", "Campground not found"); }
        res.render("./campgrounds/editCamp.ejs", {camp:camp});
    });
    
});

// UPDATE campground
router.put("/:id", modCampRestriction, checkCampgrdOwner, (req,res) => {
    
    Geocoder.geocode( req.body.location, (err,data) => {
        if(err || !data.length){
            req.flash('error', 'Invalid address');
            return res.redirect('/campgrounds/new');
        }
        let lat = data[0].latitude;
        let lon = data[0].longitude;
        let location= data[0].formattedAddress;
        let cmntLoopFlag = true;
        let avgRating = 0; // due to update, difficult to track just the rating parameter - so calculate fro m scratch for every update. 
        let updatedCamp = { name: req.body.campName, image:req.body.campImg, description:req.body.description,  price:req.body.campPrice, lat:lat, lon: lon, location:location, cmntLoopFlag:cmntLoopFlag };
    
        Campground.findByIdAndUpdate( req.params.id, updatedCamp, (err,updatedCamp) =>{
            
            if(err) { console.log(err); res.redirect("/campgrounds"); }
            else{
                //console.log(updatedCamp);
                req.flash("success", "Campground Updated Successfully")
                res.redirect('/campgrounds/'+ req.params.id );
            }
        });
    }); // end of geocoder()
}); //end of route handler


// DELETE campground
router.delete("/:id", isLoggedIn, checkCampgrdOwner, (req,res) =>{

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
            
            if( camp.author.id.equals(req.user._id)  || req.user.isAdmin){
                next();
            }
            else{
                req.flash("error", "Only Campground owners have permission to Delete/Edit.")
                res.send("/campgrounds" + camp.id);
            }
        })
        .catch( (err) => {
            req.flash("error", "Campground doesn't exist!")
            console.log(err);
            res.redirect("/campgrounds");
         });
    }
    else{
        req.flash("error", " You need to be logged in to do that!");
        res.redirect("/campgrounds/"+ camp.id );
    }
    
    
}

function modCampRestriction(req, res, next){
    if(req.user.isAdmin){
        req.flash('error', 'Mods are not allowed to do that');
        res.redirect('/campgrounds/'); 
    }
    else{
        next();
    }

}
module.exports = router; 