let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/yelpCamp_db",  
                { 
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }, 
                (err, client) => {
                    if (err) return console.log(err)
                    console.log("Successfully connected to DB...");
                });

// SCHEMA SETUP 

let campgroundSchema = new mongoose.Schema({
    name: String,
    image: String
}); 

let Campground = mongoose.model("Campground", campgroundSchema);


let app = express();
app.use( bodyParser.urlencoded( { extended: true } ) );
app.set("view engine", "ejs"); 

/// Setting up basic routes
app.get("/", (req,res) => {
    res.render("landing");
});

app.get("/campgrounds", (req,res) => {

    Campground.find( {}, (err, allCamps) => {
        if(err) { console.log(err); }
        else{
            res.render("campgrounds.ejs", {camps:allCamps});
        }
    }); 

     
});


app.post('/campgrounds', (req,res) => {

    let name = req.body.campName; 
    let image = req.body.campImg; 
    let campgrd = { name: name, image: image };
    Campground.create(campgrd)
        .then( (newlyCreatedCamp) => {
            console.log(campgrd);
        })
        .catch( (err) => {
            return console.log(err);
        });
    res.redirect("/campgrounds");
}); 

app.get("/campgrounds/new", (req,res) => {

    res.render("newcamp.ejs");
}); 

/////////////  END OF ROUTING //////////

PORT = process.env.PORT || 6969; 
app.listen(PORT, process.env.IP, () => {
    console.log("Yelpcamp server started on Port ", PORT, "...");
});