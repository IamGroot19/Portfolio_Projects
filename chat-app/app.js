const express = require('express');
const path = require('path')
const http = require('http'); 
const socketio = require('socket.io');

// express under the hood uses createServer(). We directly use createServer from node coz we need to combine t with socket.io later on
const app = express();
const server = http.createServer(app); 
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));


//Run when client connects
io.on('connection', (socket0 => {
    console.log(' New connection ');
}));

app.listen( process.env.PORT || 3000, () => {
    console.log("Server started running...");
}); 