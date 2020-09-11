//////////  ALL COMMENTS RELATED ROUTES   /////////////////////////
let router = require('express').Router( {mergeParams:true});
const Campground = require('../db/campgrounds.js');
const Comment = require('../db/comment.js')

    // SHOW comments action will be a part of campgrounds SHOW -so no separate route needed.

// NEW (comments)
router.get('/new', isLoggedIn,  (req,res) => {
    console.log(req.params.id);
    Campground.findById( req.params.id, (err,camp) => {
        if(err) { console.log(err); }
        else{
            
            res.render("../views/comments/newComment.ejs", {camp:camp});
        }
    });
});

// CREATE (comment)
router.post( "/", isLoggedIn, (req,res) => {
    
    Campground.findById(req.params.id, (err, camp) =>{
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        }
        else{
            //console.log(req.body.commentAuthor, req.body.commentText);
            
            Comment.create( { text:req.body.commentText } )
                .then( (savedComment) => {

                    // you could have also referenced it from user collections but since you'd have load lot of comments lot of times, it'd be faster to save user data in the comment Schema also. Ik this is not a case for strong DB consistency but then it's assumed that username & their userid is never going to change (unless it is deleted in which case their comments will also be deleted).
                    savedComment.author.id = req.user._id;
                    savedComment.author.username = req.user.username;
                    savedComment.save();
                    console.log(savedComment);
                    camp.comments.push(savedComment); 
                    camp.save();
                    res.redirect('/campgrounds/' + camp._id);
                })
                .catch( (err) => {
                    console.log(err);
                });
                
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
