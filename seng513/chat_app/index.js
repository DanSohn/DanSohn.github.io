const express = require('express');
const app = express();
const server = require('http').createServer(app);

const socket_io = require('socket.io');
const io = socket_io(server);


const PORT = 3000;
// this is for static files like my css file, to enable it to work properly
app.use(express.static(__dirname + '/'));
// route handler that's called when we hit our website home
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//listen on the connection event for incoming sockets
// if i want to send to everyone except for myself, use socket.broadcast.emit('hi')
/*
Basic connection from socket.io tutorial
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
});

 */
io.on('connection', (socket) => {
    console.log('a user connected');
/*
    socket.on('register', handleRegister);

    socket.on('join', handleJoin);

    socket.on('leave', handleLeave);

    socket.on('message', handleMessage);
    
    socket.on('chatrooms', handleGetChatrooms);

    socket.on('availableUsers', handleGetAvailableUsers);
*/
    socket.on('disconnect', () => {
        console.log('client disconnect...', socket.id);
        // handleDisconnect();
    });

    socket.on('error', (err) =>{
        console.log('received error from client:', socket.id);
        console.log(err);
    });
});


// our http server listens to port 3000
server.listen(PORT, (err) => {
    if (err) throw err;
    console.log('listening on *:3000');
});