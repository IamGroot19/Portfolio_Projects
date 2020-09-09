let express = require('express');
let app = express();

app.set("view engine", "ejs"); 

/// Setting up basic routes
app.get("/", (req,res) => {
    res.render("landing");
});

app.get("/campgrounds", (req,res) => {
    
    let camps = [
        { name: "Tada" , image:" https://www.photosforclass.com/download/px_699558" },
        { name: "Ooty", image:"https://www.photosforclass.com/download/px_1840421"},
        { name: "Moonar", image: "https://www.photosforclass.com/download/px_712067"}
    ]

    res.render("campgrounds.ejs", {camps:camps}); 
});


app.get('/campgrounds', (req,res) => {


}); 
/////////////  END OF ROUTING //////////

PORT = process.env.PORT || 6969; 
app.listen(PORT, process.env.IP, () => {
    console.log("Yelpcamp server started on Port ", PORT, "...");
});