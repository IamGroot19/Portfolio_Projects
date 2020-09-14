//////////  ALL COMMENTS RELATED ROUTES   /////////////////////////
let router = require('express').Router( {mergeParams:true});

const Campground = require('../db/campgrounds.js');
const Comment = require('../db/comment.js')
const User = require('../db/user.js')
    // SHOW comments action will be a part of campgrounds SHOW -so no separate route needed.

// NEW (comments)
router.get('/new', isLoggedIn,modCommentRestriction,  (req,res) => {
    
    Campground.findById( req.params.id, (err,camp) => {
        if(err) { req.flash("error", "There was a problem in loading new comment's entry form")}
        else{
            res.render("../views/comments/newComment.ejs", {camp:camp});
        }
    });
});

// CREATE (comment)
router.post( "/", isLoggedIn,modCommentRestriction, (req,res) => {
    
    let curUser = req.user;
    for( let i=0; i<curUser.reviewedCamps.length; i++){ 
        if( req.params.id == curUser.reviewedCamps[i]){
            req.flash("error", "Only one review per user");
            res.redirect('/campgrounds');
        }
    }

    Campground.findById(req.params.id, (err, camp) =>{
        if(err) {
            req.flash("error", "There was a problem in fetching Campground from database");
            res.redirect("/campgrounds");
        }
        else if( curUser._id === camp.author.id){
            req.flash('error', 'Owners cannot post reviews for their own restaurant');
            res.redirect('/campgrounds');
        }
        else{
            //console.log(req.body.commentAuthor, req.body.commentText);
            //console.log(req.user);
            Comment.create( { text:req.body.commentText, rating:req.body.ratingValue } )
                .then( (savedComment) => {

                    // you could have also referenced it from user collections but since you'd have load lot of comments lot of times, it'd be faster to save user data in the comment Schema also. Ik this is not a case for strong DB consistency but then it's assumed that username & their userid is never going to change (unless it is deleted in which case their comments will also be deleted).
                    
                    savedComment.author.id = req.user._id;
                    savedComment.author.username = req.user.username;
                    savedComment.save();
                    //console.log(savedComment);

                    // Due to new comment, average rating will change. Hence set flag=true to recaclculate it again. 
                    camp.cmntLoopFlag = true;
                    camp.comments.push(savedComment); 
                    camp.save()
                        .then( () =>{
                            //console.log('comment saved in camp')
                        });

                    curUser = req.user; 
                    curUser.reviewedCamps.push(camp._id); 
                    curUser.save()
                        .then( (savedUser)=>{
                            //console.log("post saved in user: ", savedUser);
                        })
                        .catch( (err) =>{
                            console.log('Error saving reviewed camp in user: ', err);
                        });
                    
                   // req.flash("success", "Comment Created Successfully")
                    res.redirect('/campgrounds/' + camp._id);
                })
                .catch( (err) => {
                    req.flash("error", "There was a problem in creating your comment");
                });       
        }
    }); 
});



// EDIT comments
router.get('/:commentID/edit',isLoggedIn, modCommentRestriction, isCommentOwnerOrAdmin, (req,res) =>{

    //console.log(req.params.id, " ", req.params.commentID);
    // for authorising only owners to edit comments
    Comment.findById(req.params.commentID, (err,foundComment) =>{
        
        if(err){ 
            req.flash("error", "There was a problem in fetching comments");    
            res.redirect("/campgrounds/" + req.params.id); 
        }
        res.render("comments/editComment.ejs", {campID: req.params.id, comment: foundComment});
    
    });
    
});

// UPDATE comments
router.put('/:commentID',modCommentRestriction, isCommentOwnerOrAdmin, (req,res) =>{

    Comment.findByIdAndUpdate( req.params.commentID, 
        { text:req.body.commentText, rating: req.body.ratingValue },
        (err,foundComment) =>{
            if(err){ 
                req.flash("error", "There was a problem in updating your comment"); 
                res.redirect('/campgrounds/' + req.params.id); }
            else{
              //  req.flash("success", "Comment Updated Successfully");
                
                // for updating the cmntLoopFlag
                Campground.findById(req.params.id, (err, foundCamp)=>{
                    
                    if(err){ console.log('Error while updating cmntLoopFlag: ', err); }
                    foundCamp.cmntLoopFlag = true;
                });

                res.redirect('/campgrounds/'+req.params.id); 
            }
        });
});

// DELETE comments
router.delete('/:commentID/delete', isCommentOwnerOrAdmin,  (req,res) =>{

    
    Comment.findByIdAndDelete(req.params.commentID, (err,deletedComm) =>{
        
        if(err){
            req.flash("error", "There was a problem in deleting your comment");
            res.redirect("/campgrounds/" + req.params.id);
        }
        //console.log('Comment deleted: ', deletedComm.text);
        
        // if an admin deletes a comment, it still  has to reflect in user's records
        if(req.user.isAdmin){
            User.findById(deletedComm.author.id, (err,curUser) =>{
                
                const index = curUser.reviewedCamps.indexOf(req.params.id); //req.params.id is camp._id
                if (index > -1) {
                    curUser.reviewedCamps.splice(index, 1);
                }

                curUser.save()
                    .then( () => {
                        console.log("camp removed from user object's reviewedCampList"); 

                        //Also have to update the cmntLoopFlag since comment is deleted
                        Campground.findById(req.params.id, (err, foundCamp)=>{
                    
                            if(err){ console.log('Error while updating cmntLoopFlag: ', err); }
                            foundCamp.cmntLoopFlag = true;
                        });

                        req.flash("success", "Review Deleted Successfully")
                        res.redirect("/campgrounds/" + req.params.id );
                    })
                    .catch( (err) => { console.log("camp couldn't be removed from user obj: ", err); });
            });
        } 
        else{     
            console.log(req.user);
            curUser = req.user; 
            const index = curUser.reviewedCamps.indexOf(req.params.id); //req.params.id is camp._id
            if (index > -1) {
                curUser.reviewedCamps.splice(index, 1);

            }
            curUser.save()
                .then( () => {
                    console.log("camp removed from user object's reviewedCampList"); 
                })
                .catch( (err) => { console.log("camp couldn't be removed from user obj: ", err); });
            
            Campground.findById(req.params.id, (err, foundCamp)=>{
                
                if(err){ console.log('Error while updating cmntLoopFlag: ', err); }
                foundCamp.cmntLoopFlag = true;
            });
            req.flash("success", "Review Deleted Successfully")
            res.redirect("/campgrounds/" + req.params.id );
        }

    });

});

// check if a person owns a campgruond to provide edit & delete access
function isCommentOwnerOrAdmin(req,res,next){
    //console.log(req.params);
    if(req.isAuthenticated()){

        Comment.findById( req.params.commentID)
        .then( (foundComment) => {
            
            if( foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            }
            else{
                req.flash("error", "Comment can be edited only by the authors & can be deleted only by author/admin");
                res.redirect('/campgrounds' + req.params.id);
            }
        })
        .catch( (err) => {
            req.flash("error", "There was a problem in fetching comments from database")
            res.redirect("/campgrounds"+ req.params.id);
         });
    }
    else{
        req.flash("error", "You need to be logged in to edit/delete comments!")
        res.redirect('/login');
    }
    
}

// Middleware
function isLoggedIn(req,res,next){

    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!")
    res.redirect('/login');
}

function modCommentRestriction(req, res, next){

    if(req.user.isAdmin){
        req.flash('error', 'Mods can\'t edit or create any reviews');
        res.redirect('/campgrounds'+ req.params.id); //req.params.id is campground id
    }
    else{
        next();
    }

}
module.exports = router; 
