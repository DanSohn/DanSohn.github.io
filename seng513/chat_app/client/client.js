$(() => {

    let socket = io();

    // COOKIES
    let nickname = get_cookies("username");
    let color = get_cookies("color");
    socket.emit("color check", color);
    socket.emit("nickname check", nickname);

    // On pressing the send button
    $('form').submit( (e) => {
        e.preventDefault(); //prevents page reloading

        // Message is whatever is typed into the chat box
        let message = $('#message_input').val();

        // check if its a /nick, /nickcolor, /something, or just regular chat command,
        if(message.substring(0,1) === "/"){
            // check if nick, nickcolor, or not at all
            if(message.length >= 5 && message.substring(1,5) === "nick"){
                console.log("finding info:" +  message + ", " +  message.length);
                if(message.length >= 10 && message.substring(1,10) === "nickcolor"){
                    console.log("In Client - going to color change");
                    socket.emit("color change", message);
                }else{
                    console.log("In Client = going to name change");
                    socket.emit("name change", message);
                }
            }else{
                // has a / something, thats not nick or nickcolor
                socket.emit("bad command");
            }
        }else{
            // REGULAR MESSAGE
            socket.emit("chat message", message);
        }

        // sets the input box to be empty again
        $('#message_input').val('');
        return false;
    });

    // adds the message to the chat!
    socket.on('chat message', (msg) => {
        console.log('chat message');
        $('#messages').prepend($('<li>').html(msg));
    });

    // sets the username of the client, displays it and adds it to the cookies
    socket.on('set username', (username) => {
        console.log("setting username to: " + username);
        $('#client-name').text(username);

        set_cookies("username", username);
    });

    // sets the color cookies, and only cookies
    socket.on('set color', (color) => {
        console.log("setting color to: " + color);
        set_cookies("color", color);
    });

    // using the online useres list, it will populate the div with all online users.\
    socket.on('show current users', (user_list) => {
        // get rid of all current users, and then place the list in
        $('#online-users').empty();

        $.each(user_list, (index) =>{
           $('#online-users').append($('<li>' + user_list[index] + '</li>'));
        });
    });

    // to get all past messages, I just populate the message box with the chat history array
    socket.on('chat history', (chat_arr) =>{
       $.each(chat_arr, (index) =>{
           $('#messages').prepend($('<li>' + chat_arr[index] + '</li>'));
       })
    });

    // for set and get, i use https://www.w3schools.com/js/js_cookies.asp

    // given parameters string type, and value, it will set the type to value with a given time limit
    function set_cookies(type, val){
        // example: document.cookie = "username=John Doe; expires=Thu, 18 Dec 2013 12:00:00 UTC";
        let date = new Date();
        // expiry time is 10 days
        let expiry = 10;
        date.setDate(date.getDate() + expiry);
        date.toUTCString();
        document.cookie = type + "=" + val + "; expires=" + date + ";";
    }

    // given parameter string type, it will return the value associated with it
    function get_cookies(type){
        let name = type + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
});