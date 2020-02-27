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

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        socket.emit('chat message', msg);
        socket.broadcast.emit('chat message', msg);
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

// our http server listens to port 3000
server.listen(PORT, (err) => {
    if (err) throw err;
    console.log('listening on *:' + PORT);
});