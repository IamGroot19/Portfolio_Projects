//////////  ALL COMMENTS RELATED ROUTES   /////////////////////////
let router = require('express').Router( {mergeParams:true});
const { findByIdAndDelete } = require('../db/campgrounds.js');
const Campground = require('../db/campgrounds.js');
const Comment = require('../db/comment.js')

    // SHOW comments action will be a part of campgrounds SHOW -so no separate route needed.

// NEW (comments)
router.get('/new', isLoggedIn,  (req,res) => {
    
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
                    //console.log(savedComment);
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



// EDIT comments
router.get('/:commentID/edit', isCommentOwner, (req,res) =>{

    //console.log(req.params.id, " ", req.params.commentID);
    // for authorising only owners to edit comments
    Comment.findById(req.params.commentID, (err,foundComment) =>{
        
        if(err){ res.redirect("back"); }
        res.render("comments/editComment.ejs", {campID: req.params.id, comment: foundComment});
    
    })
    
});

// UPDATE comments
router.put('/:commentID', isCommentOwner, (req,res) =>{

    Comment.findByIdAndUpdate( req.params.commentID, 
        { text:req.body.commentText },
        (err,foundComment) =>{
            if(err) { console.log(err); res.redirect('/campgrounds/' + req.params.id); }
            else{
                res.redirect('/campgrounds/'+req.params.id); 
            }
        });
});

// DELETE comments
router.delete('/:commentID/delete', isCommentOwner, (req,res) =>{

    Comment.findByIdAndDelete(req.params.commentID, (err,deletedComm) =>{
        //console.log('Comment deleted: ', deletedComm.text);
        res.redirect("/campgrounds/" + req.params.id );
    });

});

// check if a person owns a campgruond to provide edit & delete access
function isCommentOwner(req,res,next){
    
    if(req.isAuthenticated()){

        Comment.findById( req.params.commentID)
        .then( (foundComment) => {
            
            if( foundComment.author.id.equals(req.user._id) ){
                next();
            }
            else{
                res.send("back");
            }
        })
        .catch( (err) => {
            console.log(err);
            res.redirect("back");
         });
    }
    else{
        console.log("need to be logged in");
        res.send("back");
    }
    
}

// Middleware
function isLoggedIn(req,res,next){

    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}


module.exports = router; 
