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

// When user leaves the chat, we gotta remove them from the array of currently online users
function userLeave(id){
    const index = users.findIndex( user => user.id === id);
    if(index !== -1){

        // The splice() method adds/removes items to/from an array, and returns the removed item(s)
        return users.splice(index,1)[0];
    }
}

// Get all users in the room
function getRoomUsers(room){
    return users.filter( user => user.room === room);
}

// this will be used in server file app.js  
module.exports = { userJoin, getCurrentUser, userLeave, getRoomUsers };
