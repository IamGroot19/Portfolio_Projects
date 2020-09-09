let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.use( bodyParser.urlencoded( { extended: true } ) );
app.set("view engine", "ejs"); 

/// Setting up basic routes
app.get("/", (req,res) => {
    res.render("landing");
});

let camps = [
    { name: "Tada" , image:" https://www.photosforclass.com/download/px_699558" },
    { name: "Ooty", image:"https://www.photosforclass.com/download/px_1840421"},
    { name: "Moonar", image: "https://www.photosforclass.com/download/px_712067"}
];

app.get("/campgrounds", (req,res) => {

    res.render("campgrounds.ejs", {camps:camps}); 
});


app.post('/campgrounds', (req,res) => {


    
    let name = req.body.campName; 
    let image = req.body.campImg; 
    let campgrd = { name: name, image: image };
    console.log(campgrd);
    camps.push(campgrd);
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