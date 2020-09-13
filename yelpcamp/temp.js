// Forgot Password 
router.get('/forgot', (req,res) =>{
    res.render("forgotPwd.ejs")
});




router.post('/forgot', (req,res, next) => {


    // Check notes.txt section 8.8 for more info about done() and async.waterfall().
    async.waterfall( [

        // function 1
        function (done){
            crypto.randomBytes(20, (err, buf) =>{
                let token = buf.toString('hex');
                done(err, token);
            });
        },

        // function 2
        function(token, done){

            User.findOne( {email: req.body.emailUser }, (err,buf) =>{
                
                if(!user){
                    req.flash('error', 'No account with that email exists'); 
                    return res.redirect('/forgot');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 360000; //1 hour expiry for token

                user.save( (err) =>{
                    done(err,token, user);
                })
            });
        },

        // function 3
        async function(token, user, done){
            
            // Sender's email  details
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                // to protect the password, we export the password to the environment on which app is running & import it from there. So, inside the actual environment (using a terminal) go type the following code: `export GMAILPW=yourActualPassword`. 
                auth:{
                    user: 'bharathram.wissenaire@gmail.com',
                    pass: process.env.GMAILPW
                }
            });

            // receiver's email details
            let emailDetails = {
                
                from: 'bharathram.wissenaire@gmail.com>', // sender address
                to: req.body.emailUser , // list of receivers
                subject: "PASSWORD RESET", // Subject line
                
                text: 'Hello there, you are receiving this email because you (or someone else) have requested for a password reset of your account. You can click or copy-paste the following link in your browser: ' + 'http://' + req.headers.host + '/reset/' + token + '\n\nIf it wasn\'t you kindly ignore this email. Your password wont be changed. '

            };

            // send the email based on above details
            smtpTransport.sendMail( emailDetails, (err) => {
                if(err){
                    req.flash('error', 'something went wrong while sending email (check POST \'/forgot\' indexRoutes'); 
                    return res.redirect('/forgot');
                }
                console.log('mail sent');
                req.flash('success', 'An email has been sent to the registered email with further instructions');
                done(err, 'done');
            });
        }], //end of async waterfall functions array
        
        //mainCalback of async waterfall
        function (err){
            if(err){ return next(err); }
            res.redirect('/forgot');
        }

    );  // end of async waterfall (which looks like async.waterfall( [ {..}, {..}, ...], mainCallback)

}); // end of the POST '/forgot'  route handler
