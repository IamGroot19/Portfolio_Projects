# INTRODUCTION

### <ins>WHAT IS IT</ins>? A Web-Based Chat App For LIVE Conversations (via Sockets)
### <ins>LIVE LINK</ins>:  <...heroku link> 
### <ins>WHAT IS IT MADE OF?</ins>
- **Front end**: HTML, CSS, Bootstrap, JS.
- **Backend**: NodeJS, ExpressJS, Socket.io
### <ins>USE CASE</ins>: 
For confidential communication where the information shouldn't persist anywhere once chat between both the paties is over. 

---

# BRIEF OVERVIEW OF APP STRUCTURE

NOTE: Socket.io is a library for WebSockets protocol. Websockets protocol is an upgraded version of HTTPS for live connections & doesn't have the overhead of HTTP headers. To know more about WebSockets protocol, you can refer following links:
- https://youtu.be/8ARodQ4Wlf4
- https://youtu.be/9FqjRN4VYUU

### A PEEK INTO UTILITY FILES
- `messages.js` contains utility functions related to handling messages.
    - It contains functions that formats a user's message, their username and time of sending message into a string and returns this formatted string
-`users.js` contains all utility functions related to handling User data.
    - Adding user data to the file when they join a chat room.
    - Functions for fetching user data.
    - Deleting user data in the file once the user leaves a particular chat room. 

### WORKING PRINCIPLES
- The app's underlying working is based on **Emitting events** & **Listening for events**. 
- `io` is a socket.io object linked to a server while `socket` represents one of the 2 endpoints of a websocket connection. So, all `io` terminologies here refer to some sort of noun/verb related to server while all `socket` related terminologies here refer to some sort of noun/verb related to any socket(client or server side of the socket). 
- NOTE: A socket can be an endpoint on both client side as well as server side. 

- 2 types of Event Listeners are used: `io.on()` , `socket.on()`
    - `io.on( someEvent, callback )`: Server listens to an event `someEvent` and executes the callback when such an event is triggered.
    - `socket.on( someEvent, callback )`: A Socket listens to an event `someEvent` and executes the callback when such an event is triggered. 

- 3 types of Event Emitter are used: 
    - `socket.emit( someEvent, relevantData )`: Only emits to the other socket with whom the current socket is shared and passes the object `relevantData` to that socket.
    - `io.emit( someEvent, relevantData )`: Emitted by an instances of socket.io object (i.e. server) to all client sockets connected to it. 
    - `socket.broadcast.emit()` : A 

- Type of events: 
    - `chatMessage`: Event emitted by a client when they send a message, listened by corresponding server socket.
    - `joinRoom` : Event emitted by a client socket when a user joins a room. 
    - `connection`: Event listened by server socket till a user leaves a room.
    - `message`:  Event listened by a client for a new message from some other client.
    - `diconnect`: Event emitted by a client when it wants to disconnect. 

### WHAT HAPPENS WHEN A USER JOINS A ROOM
- Once the user ABC hits the 'submit' button on landing page to join a chat room 'XYZ', the client side javascript file emits a `joinRoom` event to the server's socket.

- The server then establishes a connection and emits a `message` to all other sockets belonging to the room 'XYZ'. Meanwhile the server stores the details of the user ABC in `user.js`  and then sends a welcome message to ABC (via socket.emit()).
![Flow chart](readme_pics/clientJoin.PNG?raw=true)

### WHAT HAPPENS WHEN A USER SEND A MESSAGE INSIDE A ROOM
- When a client ABC sends a message in the room, ABC's socket emits a `chatMessage` event which is listened to by server's corresponding socket and emitted to all client side sockets (including ABC's `io.emit()` ) in the room as a `message` event. <br>
![Flow chart](readme_pics/clientMessage.PNG?raw=true)


### WHAT HAPPENS WHEN A USER LEAVES A ROOM
- When a client ABC leaves the room, ABC's socket emits a `disconnect` event which is listened to by server's corresponding socket and emitted to all client side sockets (including ABC's via `io.emit()`) in the room as a `message` event. 

![Flow chart](readme_pics/clientLeft.PNG?raw=true)


### WHAT HAPPENS IN CLIENT SIDE
- The client side javascript file `main.js` has event listeners for the submit button at landing message, send message inside chat room, for `message` event etc. DOM Manipulation callbacks are used to reflect any changes from server side onto the client screen. 

---
# MISCELLANEOUS

### FUTURE FEATURES 
- Feature for users to add chat-rooms (rooms added by users get removed if no one stays online). 
- Password based private rooms. 
- Add direct messaging(only live-to-live) 

### DEPENDENCIES
    "express": "^4.17.1",
    "moment": "^2.27.0",
    "moment-timezone": "^0.5.31",
    "socket.io": "^2.3.0"