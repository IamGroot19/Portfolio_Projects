let mongoose = require('mongoose');


// cmntLoopFlag is a flag set to true or fals so as to indicate in show.ejs whether t=any rating has changed after the last time the average Rating was updated. Optimises compuation. 
let campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    lat: Number,
    lon: Number,
    avgRating: Number,
    cmntLoopFlag: Boolean,
    createdAt: { type: Date, default : Date.now },
    // Data association
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"  //name of singular version of collection's name
        },
        username: String
    },
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment" //name of singular version of collection's name
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