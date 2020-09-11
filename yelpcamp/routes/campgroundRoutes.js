///////////////////  ALL CAMPGROUNDS RELATED ROUTES IN THIS FILE //////////////////////
let router = require('express').Router();
const { request } = require('express');
let Campground = require('../db/campgrounds');

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
            console.log(campgrd);
        })
        .catch( (err) => {
            return console.log(err);
        });
    res.redirect("/campgrounds");
}); 

// NEW route
router.get("/new", isLoggedIn, (req,res) => {

    res.render("campgrounds/newcamp.ejs");
}); 


// SHOW route
router.get("/:id", (req,res)=>{

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

// EDIT campground
router.get('/:id/edit', (req,res) =>{

    Campground.findById( req.params.id)
        .then( (camp) => {
            
            res.render("./campgrounds/editCamp.ejs", {camp:camp});
        })
        .catch( (err) => {
            console.log(err);
            res.redirect("/campgrounds");
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
            res.redirect('/campgrounds/'+ req.params.id );
        }
    });
});


// DELETE campground
router.delete("/:id/delete", (req,res) =>{

    Campground.findByIdAndDelete( req.params.id, (err,deletedObj) =>{

        if(err) { console.log(err); res.redirect("/:id"); }
        else{
            console.log(deletedObj);
            res.redirect('/campgrounds'); 
        }
    });

});

// Middleware
function isLoggedIn(req,res,next){

    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

module.exports = router; 