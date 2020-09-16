# INTRODUCTION

## <ins>WHAT IS IT</ins>? A Web-Based Chat App For LIVE Conversations (via Sockets)
## LIVE LINK:  <...heroku link> 
## WHAT IS IT MADE OF?
- **Front end**: HTML, CSS, Bootstrap, JS.
- **Backend**: NodeJS, ExpressJS, Socket.io
## USE CASE: 
For confidential communication where the information shouldn't persist anywhere once chat between both the paties is over. 

---

# BRIEF OVERVIEW OF APP STRUCTURE

NOTE: Socket.io is a library for WebSockets protocol. Websockets protocol is an upgraded version of HTTPS for live connections & doesn't have the overhead of HTTP headers. To know more about WebSockets protocol, you can refer following links:
- https://youtu.be/8ARodQ4Wlf4
- https://youtu.be/9FqjRN4VYUU

## A PEEK INTO UTILITY FILES
- `messages.js` contains utility functions related to handling messages.
    - It contains functions that formats a user's message, their username and time of sending message into a string and returns this formatted string

-`users.js` contains all utility functions related to handling User data.
    - Adding user data to the file when they join a chat room.
    - Functions for fetching user data.
    - Deleting user data in the file once the user leaves a particular chat room. 

## WORKING PRINCIPLES


- The app's underlying working is based on **Emitting events** & **Listening for events**. 
- `io` is a socket.io object linked to a server while `socket` represents one of the 2 endpoints of a websocket connection. So, all `io` terminologies here refer to some sort of noun/verb related to server while all `socket` related terminologies here refer to some sort of noun/verb related to any socket(client or server side of the socket). 
- NOTE: A socket can be an endpoint on both client side as well as server side. 


- 2 types of Event Listeners are used: `io.on()` , `socket.on()`
    - `io.on( someEvent, callback )`: Server listens to an event `someEvent` and executes the callback when such an event is triggered.
    - `socket.on( someEvent, callback )` : A Socket listens to an event `someEvent` and executes the callback when such an event is triggered. 


- 3 types of Event Emitter are used: 
    - `socket.emit()` 
    - `io.emit()`
    - `socket.broadcast.emit()` 


- Type of events: 
    - `chatMessage`
    - `joinRoom`
    - `connection` 
    - `message`
    -  `diconnect`

## WHAT HAPPENS WHEN A USER JOINS A ROOM
- 
## WHAT HAPPENS WHEN A USER SEND A MESSAGE INSIDE A ROOM
-
## WHAT HAPPENS WHEN A USER LEAVES A ROOM
-

---
# MISCELLANEOUS

## FUTURE FEATURES 
- Feature for users to add chat-rooms (rooms added by users get removed if no one stays online). 
- Password based private rooms. 
- Add direct messaging(only live-to-live) 

## DEPENDENCIES
    "express": "^4.17.1",
    "moment": "^2.27.0",
    "moment-timezone": "^0.5.31",
    "socket.io": "^2.3.0"