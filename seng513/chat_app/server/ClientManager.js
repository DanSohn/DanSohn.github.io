function handleRegister(user_name, callback){
    // checks if the username is in use: if not, return a callback with error statement : in use. Doesn't return a result
    if(!clientManager.isUserAvailable(user_name)){
        return callback("Username is already in use. Choose another username");
    }

    const user = clientManager.getUserByName(user_name);
    clientManager.registerClient(client, user);

    // callback (error, result) is the template
    return callback(null, user);
}