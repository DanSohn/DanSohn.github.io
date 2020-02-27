const express = require('express');
const app = express();
const server = require('http').createServer(app);

const socket_io = require('socket.io');
const io = socket_io(server);

const usernames_module = require(__dirname + '\\resources\\usernames');
let usernames = usernames_module.usernames;


// console.log(usernames);
const PORT = 3001;
// console.log(__dirname + '\\index.html');

let username="";

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

    // pick a random name from usernames
    username = get_username();
    console.log("Choosing username... : " + username);

    // sets username when a user connects
    socket.emit('set username', username);

    // check if the color is set from the previous cookies
    socket.on("color check", (color)=>{
        if(color !== ""){
            socket.user_color = color;
        }
    });

    //check if nickname is set from the previous cookies
    socket.on("nickname check", (nickname)=>{
        if(nickname!== ""){
            socket.username = nickname;
        }else{
            socket.username = username;
        }

        // if the user is currently not in the online list, add them
        if(!online_users.includes(socket.username)){
            online_users.push(username);
        }

        // make sure i do this every time i connect and disconnect, and also, every time there is a name change
        // this is happening every time a user initially connects (and checks for their cookies)
        socket.emit('show current users', online_users);
    });


    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        // if not an empty string
        if(msg.trim() !== ""){
            // bold for users, and ensure using nickname and color properly
            // format of a message should be hh:mm username - msg
            let user_msg = create_user_msg(socket.user_color, socket.username, msg);
            let other_msg = create_other_msg(socket.user_color, socket.username, msg);
            // push to current users
            socket.emit('chat message', user_msg);
            socket.broadcast.emit('chat message', other_msg);

            //for the future generations, keep tracking of the chat
            chat_history.push(other_msg);
        }

    });

    // disconnect is a pre-defined event
    socket.on('disconnect', () => {
        console.log('client disconnect...', socket.id);
    });

    // error is a pre-defined event
    socket.on('error', (err) =>{
        console.log('received error from client:', socket.id);
        console.log(err);
    });


});

// looks at the username array and chooses an unused name and returns it
function get_username(){
    let name;
    // do a while loop grabbing names from usernames, while the username is part of the online users
    do{
        // multiple a random number from 0 to 1 with the length of the array and round down to the nearest whole
        let random_num = Math.floor(Math.random() * usernames.length);
        console.log(random_num);

        name = usernames[random_num];

    }while(online_users.includes(name));
    return name;
}

// finds the current time in hh:mm format
// https://tecadmin.net/get-current-date-time-javascript/
function get_time(){
    let today = new Date();
    let time;
    return time = today.getHours() + ":" + today.getMinutes();
}

function create_user_msg(color, name, msg){
    let time = get_time();
    let message;
    return message = time + "<b><p style=color:" + color + ">" + name + ":</p>" + msg + "</b>";
}

function create_other_msg(color, name, msg){
    let time = get_time();
    let message;
    return message = time + "<p style=color:" + color + ">" + name + ":</p>" + msg;
}

// our http server listens to port 3000
server.listen(PORT, (err) => {
    if (err) throw err;
    console.log('listening on *:' + PORT);
});