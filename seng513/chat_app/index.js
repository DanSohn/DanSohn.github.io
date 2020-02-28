const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socket_io = require('socket.io');
const io = socket_io(server);

const usernames_module = require(__dirname + '\\resources\\usernames');
let usernames = usernames_module.usernames;
// convert all usernames to lowercase
for (let i = 0; i < usernames.length; i++) {
    usernames[i] = usernames[i].toLowerCase();
}

const PORT = 3001;


let username = "";
let user_color = "#000000";
let online_users = [];
let chat_history = [];


// this is for static files like my css file, to enable it to work properly
app.use(express.static(__dirname + '/client'));
// route handler that's called when we hit our website home
app.get('/', (req, res) => {
    res.sendFile(__dirname + '\\client\\index.html');
});


//listen on the connection event for incoming sockets
// if i want to send to everyone except for myself, use socket.broadcast.emit('hi')
//Basic connection from socket.io tutorial
io.on('connection', (socket) => {
    console.log('a user connected');

    // populate chat box with previous messages
    socket.emit('chat history', chat_history);


    // check if the color is set from the previous cookies
    socket.on("color check", (color) => {
        if (color !== "") {
            socket.user_color = color;
        } else {
            // sets the color to black
            socket.user_color = user_color;
        }
    });


    //check if nickname is set from the previous cookies
    socket.on("nickname check", (nickname) => {
        console.log("Current online users: " + online_users);
        console.log("Previous nickname: " + nickname);
        // if there exists a nickname from the cookies and someone is not using it, I will set it to given nickname
        // else, I generate a random nickaname
        socket.username =  (name_free(nickname)) ? nickname : get_username();
        /*
        if (nickname !== "" && !online_users.includes(nickname)) {
            socket.username = nickname;
        } else{
            socket.username = get_username();
        }
         */

        socket.emit('set username', socket.username);

        // if the user is currently not in the online list, add them
        if (!online_users.includes(socket.username)) {
            online_users.push(socket.username);
        }
        // sends to all connected sockets the updated online users list
        io.emit('show current users', online_users);
    });


    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        // if not an empty string
        if (msg.trim() !== "") {
            // bold for users, and ensure using nickname and color properly
            // format of a message should be hh:mm username - msg
            //console.log("message color: " + socket.user_color + " message name: " + socket.username);
            let user_msg = create_user_msg(socket.user_color, socket.username, msg);
            let other_msg = create_other_msg(socket.username, msg);
            // push to current users
            socket.emit('chat message', user_msg);
            socket.broadcast.emit('chat message', other_msg);

            //for the future generations, keep tracking of the chat
            chat_history.push(other_msg);
        }

    });

    // /nick nickname handling, handling a change in nickname!
    socket.on('name change', (msg) => {
        // change name in online_users. Push nickname to socket user. Send to socket user message that they're name is
        // changed or not changed depending on if the nickname was available

        let new_name;
        let broadcast_msg;
        // to get to this point, i check that it starts with /nick<space>. Therefore I should check there is another letter afterwards
        if (msg.length >= 7 && msg[5] === " " && msg[6] !== " ") {
            // remove the old name from online_list
            remove_user(socket.username);

            new_name = msg.substring(6).toLowerCase();
            console.log(new_name);

            if (name_valid(new_name)) {
                // continue on
                // checks if the new name is an existing username
                if (online_users.includes(new_name)) {
                    // we want to broadcast a message and not do the rest of the stuff
                    broadcast_msg = "<i> Name change unsuccessful. Please choose a unique nickname!</i>";
                } else {
                    socket.username = new_name;
                    // updates their name in top left corner
                    socket.emit('set username', socket.username);
                    // add user to online users and updates list for everyone
                    online_users.push(socket.username);
                    io.emit('show current users', online_users);

                    broadcast_msg = "<i> You changed your name to " + socket.username + ".</i>";

                }
            } else {
                // invalid name
                broadcast_msg = "<i> Name change unsuccessful. Nickname can only consist of characters, numbers and spaces!</i>";
            }
        } else {
            broadcast_msg = "<i> Name change unsuccessful. Make sure to type /nick exampleName.</i>";
        }

        //shows in message box
        socket.emit('chat message', broadcast_msg);
    });


    // /nickcolor RGB handling, handling a change in nickname color!!
    // src of regex https://stackoverflow.com/questions/32673760/how-can-i-know-if-a-given-string-is-hex-rgb-rgba-or-hsl-color-using-javascript
    socket.on('color change', (msg) => {
        console.log("Changing color of chat");
        let broadcast_msg;

        // at this point, i checked if(message.length >= 11 && message.substring(1,11) === "nickcolor ") which is true
        if(msg.length >= 12 && msg[11] !== " "){
            // grabs from after nickcolor<space>
            let hex = msg.substring(11);

            if(color_valid(hex)){
                // change color of your name in chat
                socket.user_color = "#" + hex;
                socket.emit('set color', socket.user_color);
                broadcast_msg = "<i> Your color is now #" + hex + "</i>";
            }else{
                // invalid color
                broadcast_msg = "<i> Color change unsuccessful. Please use a valid RGB format</i>";
            }
        }else{
            broadcast_msg = "<i> Invalid format. Use /nickcolor RRGGBB</i>";
        }

        //show to user
        socket.emit('chat message', broadcast_msg);
    });

    // occurs when a user puts in a / command thats doesn't start with nick
    socket.on('bad command', () =>{
        let broadcast_msg = "<i> Invalid syntax. The two commands available are /nick and /nickcolor.</i>";
        socket.emit('chat message', broadcast_msg);
    });


    // disconnect is a pre-defined event
    socket.on('disconnect', () => {
        // On disconnect, I send a little message saying im disconnecting
        let msg = "<i>" + socket.username + " has disconnected. :(</i>";
        socket.broadcast.emit('chat message', msg);
        //remove user from online users
        remove_user(socket.username);

        io.emit('show current users', online_users);
        console.log('client disconnect...', socket.id);
    });

    // error is a pre-defined event
    socket.on('error', (err) => {
        console.log('received error from client:', socket.id);
        console.log(err);
    });


});

// looks at the username array and chooses an unused name and returns it
function get_username() {
    let name;
    // do a while loop grabbing names from usernames, while the username is part of the online users
    do {
        // multiple a random number from 0 to 1 with the length of the array and round down to the nearest whole
        let random_num = Math.floor(Math.random() * usernames.length);

        name = usernames[random_num];

    } while (online_users.includes(name));
    return name;
}

// finds the current time in hh:mm format
// https://tecadmin.net/get-current-date-time-javascript/
// https://stackoverflow.com/questions/8935414/getminutes-0-9-how-to-display-two-digit-numbers
// using the second link to prettify my text
function get_time() {
    let today = new Date();
    let hours = ('0' + today.getHours()).slice(-2);
    let minutes = ('0' + today.getMinutes()).slice(-2);
    return hours + ":" + minutes;
}

function create_user_msg(color, name, msg) {
    let time = get_time();
    return "<b><p style=color:" + color + ">" + time + " " + name + ": " + msg + "</p></b>";
}

function create_other_msg(name, msg) {
    let time = get_time();
    return "<p>" + time + " " + name + ": " + msg + "</p>";
}

// function checks the given nickname if it is valid and if there is no one with it
function name_free(nickname){
    console.log("Checking nickname...");
    console.log(nickname);
    return nickname !== "" && !online_users.includes(nickname);

}

// function that gets a name and ensures that its made of only spaces, charactesr and letters
function name_valid(name){
    let regex_test = /^[A-Za-z0-9 ]+$/;
    return regex_test.test(name);
}
// function that gets the rest of the message and ensure its a proper hex code
function color_valid(hex){
    let regex_hex =/^((?:[A-Fa-f0-9]{3}){1,2})$/;
    return regex_hex.test(hex);
}
function remove_user(name){
    // i find the index of the user in the list of online users and remove it!
    const index = online_users.indexOf(name);
    if (index > -1) {
        online_users.splice(index, 1);
    }
}
// our http server listens to port 3000
server.listen(PORT, (err) => {
    if (err) throw err;
    console.log('listening on *:' + PORT);
});