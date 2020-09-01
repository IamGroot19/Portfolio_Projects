// everything related to users will go here. () database would have been better but it increases complexity)

const users = []

// join user to chat
function userJoin(id, username, room){

    const user = { id, username, room}; 
    users.push(user);
    return user;
}

// Get the current user
function getCurrentUser(id){
    return users.find( user => user.id === id); 
}

// this will be used in server file app.js  
module.exports = { userJoin, getCurrentUser };
