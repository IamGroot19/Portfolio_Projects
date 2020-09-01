const express = require('express');
const path = require('path')
const http = require('http'); 
const socketio = require('socket.io');
const formatMessage = require('./utils/messages')

/* express under the hood uses createServer(). We directly use createServer from node coz we need to combine t with socket.io later on  */
const app = express();
const server = http.createServer(app); 
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botname = 'ChatApp Bot'; 

/* Run when client connects; io.on() listens for some kinda event (in this case, listens for a new connection from a client). But then simply listening for new connections is not much helpful. What we want is some sort of bidrectional communication. */
io.on('connection', (socket) => {
    
    // we catch this in the client side using main.js
    socket.emit('message', formatMessage(botname, 'Welcome to chat app'));  

    /* broadcast when a user connects. Diff b/w socket.emit(), io.emit(), broadcast.emit() is that:
        (i)   broadcast.emit() notifies to everyone except for the person who joined 
        (ii)  socket.emit() only emits to the single client who joined. 
        (iii) io.emit() emits to everybody */
    socket.broadcast.emit('message', formatMessage('USER',  'A user has joined the chat')); 

    /* Run when client DISCONNECTS [inform server alone thru socket.on() ]. Server lets everyone know that the user has left */
    socket.on('disconnect', () => {     
        io.emit('message', formatMessage('USER', 'A user has left the chat') ); 
    });

    // Listen for a chat message (from the client side socket.emit('submit', typedmsg);
    socket.on('chatMessage', (typedMsg) => {
        
        // for debugging purpose
        /* console.log('message from client displayed on server: ', typedMsg); */ 

        // emit the message to everybody in the chat room
        io.emit('message', formatMessage('USER', typedMsg) );  
    });
    
});

//  

server.listen( process.env.PORT || 3000, () => {
    console.log("Server started running...");
}); 