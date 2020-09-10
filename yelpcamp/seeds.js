let mongoose = require('mongoose')
let Campground = require('./db/campgrounds')
let Comment = require('./db/comment')

let seeds = [
    { 
        name: "tada", 
        image: "https://images.pexels.com/photos/2662816/pexels-photo-2662816.jpeg?auto=compress&cs=tinysrgb&h=350", 
        description:"blah blah blah"
    },
    { 
        name: "ooty", 
        image: "https://pixabay.com/get/57e8d1454b56ae14f1dc84609620367d1c3ed9e04e5074407c287bd79345c4_340.jpg", description: "etc etc etc"
    },
    { 
        name: "chennai", 
        image: "https://pixabay.com/get/53e4d1424b56a814f1dc84609620367d1c3ed9e04e5074407c287bd79345c4_340.jpg", description:"yada yada yadah"
    }
]

// this is callback hell - you can do a better job with promises. 
async function seedDB(){

    try{
        await Campground.remove({});
        await Comment.remove({});

        for(const seed of seeds){
        
            let campground = await Campground.create(seed);
            let comment = await Comment.create({
            text: "This place is great, but I wish there was internet",
            author: "Homer"
        });

        campground.comments.push(comment); // We are doing data association here
        campground.save(); 
        }
    }
    catch(err){
        console.log(err);
    }
    
}

module.exports = seedDB;