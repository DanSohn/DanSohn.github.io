$(() => {
    let socket = io();
    $('form').submit( (e) => {
        e.preventDefault(); //prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('chat message', (msg) => {
        $('#messages').append($('<li>').text(msg));
    });
});