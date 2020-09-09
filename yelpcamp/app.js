let express = require('express');
let app = express();

app.set("view engine", "ejs"); 

/// Setting up basic routes
app.get("/", (req,res) => {
    res.send("Landing Page");
});

PORT = process.env.PORT || 6969; 
app.listen(PORT, process.env.IP, () => {
    console.log("Yelpcamp server started on Port ", PORT, "...");
});