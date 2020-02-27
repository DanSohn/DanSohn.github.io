$(() => {
    let socket = io();

    // On pressing the send button
    $('form').submit( (e) => {
        e.preventDefault(); //prevents page reloading

        // Message is whatever is typed into the chat box
        let message = $('#message_input').val();

        // check if its a /nick, /nickcolor, /something, or just regular chat command,
        if(message.substring(0,1) === "/"){
            // check if nick, nickcolor, or not at all
            if(message.length >= 6 && message.substring(1,6) === "nick "){
                if(message.length >= 11 && message.substring(1,11) === "nickcolor "){
                    socket.emit("color change", message);
                }else{
                    // its /nick something
                    socket.emit("name change", message);
                }
            }else{
                // has a / something, thats not nick or nickcolor
                socket.emit("incorrect command", message);
            }
        }else{
            // REGULAR MESSAGE
            socket.emit("chat message", message);
        }

        // sets the input box to be empty again
        $('#message_input').val('');
        return false;
    });

    socket.on('chat message', (msg) => {
        console.log('chat message');
        $('#messages').prepend($('<li>').html(msg));
    });

    socket.on('set username', (username) => {
        console.log("setting username to: " + username);
        $('#client-name').text(username);
    });

    socket.on('show current users', (user_list) => {
        // get rid of all current users, and then place the list in
        $('#online-users').empty();

        $.each(user_list, (index) =>{
           $('#online-users').append($('<li>' + user_list[index] + '</li>'));
        });
    });
});