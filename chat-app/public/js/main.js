/* 
   -  This is the script that will be sent to client side and gets opened in their browser. 
   -  This file is added to chat.html
   -  You have a socket connection between main.js and app.js, the main.js listens for any message from server using `socket.on()`.
   - You dont user addEventListener() here (instead use socket.on() ) because 

*/



// we want to access the messages typed in the chatbox (by accessing DOM elements), transfer it server, which inturn wil broadcast it to all other users.
const chatForm = document.getElementById("chat-form"); 

const socket = io(); // we have access to io() coz of the script tag added 

/* 'message' is a type of event that all clients listens for. Any message from the server or any other client is displayed
is first  sent to the server from the client side. This server then sends that message to everyone using 
io.emit('message', typedMsgFromSomeClient ); */
socket.on('message', (msg) => {   
    
    // console.log('from someother clinet boradcasted by server', msg); //for debuggin purpose
    outputMsgToDOM(msg);
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
    
});

// take the msg received from server and place it inside chat room by DOM manipulation
function outputMsgToDOM(message){

    /* checkout how the message elements are structured inside chat.html file. There is an outer div, inside which there is a class for recording meta details and another class for recording the actual text file. */
    let messageDiv = document.createElement("div"); 
    messageDiv.classList.add("message");
    messageDiv.innerHTML = `<p class="meta"> Ram <span>9:15pm</span></p>
    <p class="text"> ${message} </p>`; 

    document.querySelector('.chat-messages').appendChild(messageDiv);

}