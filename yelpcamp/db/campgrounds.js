let mongoose = require('mongoose');



let campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    // Data association
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
    ]
}); 

let Campground = mongoose.model("Campground", campgroundSchema);
/*
Campground.create({
    name: "Tada", 
    image:"https://www.photosforclass.com/download/px_699558", 
    description: "Photo of our Tada visit lastyear"
});

Campground.create({
    name: "OOTY", 
    image:"https://www.photosforclass.com/download/px_699558", 
    description: "Photo of best hillstation camp in India"
});
*/

module.exports = mongoose.model("Campground", campgroundSchema); 