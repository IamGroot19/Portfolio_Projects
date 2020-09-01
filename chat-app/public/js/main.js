/* 
   -  This is the script that will be sent to client side and gets opened in their browser. 
   -  This file is added to chat.html
   -  You have a socket connection between main.js and app.js, the main.js listens for any message from server using `socket.on()`.
   - You dont user addEventListener() here (instead use socket.on() ) because 

*/



// we want to access the messages typed in the chatbox (by accessing DOM elements), transfer it server, which inturn wil broadcast it to all other users.
const chatForm = document.getElementById("chat-form"); 
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name'); // from chat.html
const userList  = document.getElementById('users')     // from chat.html


// Get username & chat room name from query string. {ignoreQueryPrefix: true} will ignore symbols like qn mark

const parsedQueryString = Qs.parse(window.location.search, { ignoreQueryPrefix: true }); 
const username = parsedQueryString["?username"];
const room = parsedQueryString["room"];

const socket = io(); // we have access to io() coz of the script tag added 

// Emit an event 'joinRoom' & send an object containing username, room name which can be caught with an event listener on the server side.
socket.emit('joinRoom', {username, room});

/* 'message' is a type of event that all clients listens for. Any message from the server or any other client is displayed
is first sent to the server from the client side. This server then sends that message to everyone using 
io.emit('message', typedMsgFromSomeClient ); . Note that message here is an object containing user who sent that message, time of sending & the actual text typed in the message (check utils/messages.js) for more info */
socket.on('message', (msg) => {   
    
    // console.log('from someother client boradcasted by server', msg); //for debuggin purpose
    outputMsgToDOM(msg);

    // once message is displayed, scroll down to display the latest message
    chatMessages.scrollTop = chatMessages.scrollHeight; 
});

// WARNING: The input must be exactly (verbatim) {room, users} because you are passing it as a set and if key-value pairs change then you will get undefined along the chain. 
socket.on('roomUsers', ( {room, users}) => {

    outputRoomName(room);
    outputUserSidebar(users);
});

// create an event listener in the client side which listens for an event called 'submit' (when you hit submit button after typing the message). 'e' is the event parameter here. 
chatForm.addEventListener('submit', (e) => {  

    // default behavious is to submit the event to a file - which we dont want.
    e.preventDefault();

    // extract the typed message. Here `msg` is the id of input element (inside forms)
    const typedMsg = e.target.elements.msg.value ; 

    //console.log("Inside main.js (client side): ", typedMsg); // for debuggin purpose
    
    // Emit the typed message to server
    socket.emit('chatMessage', typedMsg);

    // Clear the input in the typing box once the message is sent and focus back to empty input textbox

    /* I am getting an Uncaught typeError :  focus is not a function  alhough console.log() prints it out to be as a function
    console.log(typeof e.target.elements.msg.value );
    console.log(typeof e.target.elements.msg.focus ); */

    e.target.elements.msg.value = ''; 
    //e.target.elements.focus();
    
});

// take the msg object received from server and place it inside chat room by DOM manipulation
function outputMsgToDOM(message){

    /* checkout how the message elements are structured inside chat.html file. There is an outer div, inside which there is a class for recording meta details and another class for recording the actual text file. */

    let messageDiv = document.createElement("div"); 
    messageDiv.classList.add("message");
    messageDiv.innerHTML = `<p class="meta"> ${message["username"]} <span> ${message["time"]}</span></p>
    <p class="text"> ${message["text"]} </p>`; 

    document.querySelector('.chat-messages').appendChild(messageDiv);

}

// Update room name to DOM (side bar)
function outputRoomName(room){
    roomName.innerText = room; 
}

// Update list of updated users to sidebar (DOM)
function outputUserSidebar(updatedUserList){

    userList.innerHTML = ` ${ updatedUserList.map( user => `<li> ${user.username} </li>`).join('')} `;
}