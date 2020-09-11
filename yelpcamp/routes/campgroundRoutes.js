///////////////////  ALL CAMPGROUNDS RELATED ROUTES IN THIS FILE //////////////////////
let router = require('express').Router();
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
router.post('/', (req,res) => {
    
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
router.get("/new", (req,res) => {

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

module.exports = router; 