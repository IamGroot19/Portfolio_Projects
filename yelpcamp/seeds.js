let mongoose = require('mongoose')
let Campground = require('./db/campgrounds')
let Comment = require('./db/comment')

let seeds = [
    { 
        name: "tada", 
        image: "https://images.pexels.com/photos/2662816/pexels-photo-2662816.jpeg?auto=compress&cs=tinysrgb&h=350", 
        description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nostrum eveniet dolores id dolorum ipsam voluptatum corrupti temporibus earum totam aliquid tempore labore qui laborum, quaerat modi soluta molestias velit! Molestias corporis perferendis ipsam eveniet magni excepturi earum soluta? Odit nesciunt aut velit rerum similique doloribus incidunt laboriosam. Placeat, perspiciatis incidunt."
        },
    { 
        name: "ooty", 
        image: "https://images.pexels.com/photos/776117/pexels-photo-776117.jpeg?auto=compress&cs=tinysrgb&h=350",
         description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nostrum eveniet dolores id dolorum ipsam voluptatum corrupti temporibus earum totam aliquid tempore labore qui laborum, quaerat modi soluta molestias velit! Molestias corporis perferendis ipsam eveniet magni excepturi earum soluta? Odit nesciunt aut velit rerum similique doloribus incidunt laboriosam. Placeat, perspiciatis incidunt."
    },
    { 
        name: "chennai", 
        image: "https://images.pexels.com/photos/45241/tent-camp-night-star-45241.jpeg?auto=compress&cs=tinysrgb&h=350",
         description:"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nostrum eveniet dolores id dolorum ipsam voluptatum corrupti temporibus earum totam aliquid tempore labore qui laborum, quaerat modi soluta molestias velit! Molestias corporis perferendis ipsam eveniet magni excepturi earum soluta? Odit nesciunt aut velit rerum similique doloribus incidunt laboriosam. Placeat, perspiciatis incidunt."
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