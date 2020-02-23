const express = require('express');
const app = express();

const http = require('http').createServer(app);

const PORT = 3000;
// route handler that's called when we hit our website home
app.get('/', (req, res) => {
    res.send(__dirname + '/index.html');
});

// our http server listens to port 3000
http.listen(PORT, () => {
    console.log('listening on *:3000');
});