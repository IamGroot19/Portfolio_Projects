let mongoose = require('mongoose');
let passportLocalMongoose = require('passport-local-mongoose');


let UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: { type:String, default: "https://www.redditstatic.com/avatars/avatar_default_02_A5A4A4.png"},
    firstName: String,
    lastName: String,
    email: String,
    bio: String,
    isAdmin: { type: Boolean, default: false} 
});

UserSchema.pre("save",function(next) {
    if (this.avatar.length == 0){
      this.avatar = "https://www.redditstatic.com/avatars/avatar_default_02_A5A4A4.png";
    }
    next();
  });

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);