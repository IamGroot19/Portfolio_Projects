const express = require('express');
const path = require('path');
const http = require('http'); 
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

/* express under the hood uses createServer(). We directly use createServer from node coz we need to combine t with socket.io later on  */
const app = express();
const server = http.createServer(app); 
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botname = 'ChatApp Bot'; 

/* Run when client connects; io.on() listens for some kinda event (in this case, listens for a new connection from a client). But then simply listening for new connections is not much helpful. What we want is some sort of bidrectional communication. */
io.on('connection', (socket) => {

    // 'joinRoom' must be the first event listener since first thing that happens is that a peson joins a chatroom
    socket.on('joinRoom', ({username,room}) => {

        /* first job when the user enters the chat room is to create a profile for them & store them in the users.js file
            userJoin() returns an object containing the variables (& also stores user state inside a file)  */
        const user  = userJoin(socket.id, username, room);

        socket.join(user.room); 
        
        /* socket.emit(), socket.broadcast.emit() come inside the joinroom since each client at a given time can be inside one room only. */

        //  Welcome the user when they join - we catch this in the client side using main.js
        socket.emit('message', formatMessage(botname, 'Welcome to chat app'));  


        /* broadcast when a user connects. Since there are different rooms, you need to broadcast about user's entry to their corresponding room. This is done by using `socket.to(user.room).emit() instead of a simple            `socket.brodcast.emit()`
        Diff b/w socket.emit(), io.emit(), broadcast.emit() is that:
            (i)   broadcast.emit() notifies to everyone except for the person who joined 
            (ii)  socket.emit() only emits to the single client who joined. 
            (iii) io.emit() emits to everybody */
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botname,  `${user.username} has joined the chat`)); 

        // Send Users & room info after a new user has joined that room. To do that emit an event called 'roomUsers' that sends an object containing the room name and the list of users in the room as data. In the client side, there will be an eventistener waiting for the 'roomUsers' event to occur who then updates the sidebar via DOM Maniupaltion.
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });


    }); 
    

    // Listen for a chat message (from the client side socket.emit('submit', typedmsg);
    socket.on('chatMessage', (typedMsg) => {
        
        // for debugging purpose
        /* console.log('message from client displayed on server: ', typedMsg); */ 

        // since a user's message must be posted to their room members only, you need to get the user object to find out their room. 
        const user = getCurrentUser(socket.id);

        // emit the message to everybody in THAT chat room to which user is connected to
        io.to(user.room).emit('message', formatMessage(user.username, typedMsg) );  
    });

    /* Run when client DISCONNECTS [inform server alone thru socket.on() ]. Server lets everyone know that the user has left */
    socket.on('disconnect', () => {     
        const user = userLeave(socket.id);
        
        if(user){
            io.to(user.room).emit('message', formatMessage(user.username, `${user.username} has left the chat`) ); 
        } 

        // You also need to update the sidebar with new set of users once a user leaves the room
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});

//  

server.listen( process.env.PORT || 3000, () => {
    console.log("Server started running...");
}); 