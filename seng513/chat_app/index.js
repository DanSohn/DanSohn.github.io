const express = require('express');
const app = express();
const http = require('http').createServer(app);

const socket_io = require('socket.io');
var io = socket_io(http);


const PORT = 3000;
// this is for static files like my css file, to enable it to work properly
app.use(express.static(__dirname + '/'));
// route handler that's called when we hit our website home
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//listen on the connection event for incoming sockets
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// our http server listens to port 3000
http.listen(PORT, () => {
    console.log('listening on *:3000');
});