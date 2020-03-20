

// convert rows that have genres such as action;adventure into two rows; 1 with action, 1 with adventure
// data is an ARRAY of objects
function clean_genre(data) {
    // console.log(typeof data[0]);
    // console.log("cleaning... ", data);
    // iterate through every row in the data
    for (let i = 0, len = data.length; i < len; i++) {
        // if the genre field has more than one genre
        // console.log(i, data[i].Genres);
        if (data[i].genres.includes(";")) {
            let genres = get_genres(data[i].genres);

            // for every genre in the attribute field, i will create a new entry in the data
            let tmp_obj = data[i];
            for (let j = 0; j < genres.length; j++) {
                // temporary object holding in the data row fields
                // replace the genres field with the provided individual genre
                tmp_obj.genres = genres[j];
                data.push(tmp_obj);
            }
            // remove the original row of data
            data.splice(i, 1);
            i--;
        }
    }
    // console.log(data);
    let genres_set = new Set();

    for(let i = 0, len = data.length; i < len; i++) {
        if (!genres_set.has(data[i].genres)){
            genres_set.add(data[i].genres);
        }
        if (data[i].genres.includes(";")) {
            console.log("oh no! data not properly cleansed");
        }
    }


    // console.log("number of genres ", genres_set)
    return data;
}



function group_genres(data){

    let game_genre = new Set(["Action", "Adventure", "Action & Adventure", "Arcade", "Board", "Card", "Casino", "Casual",
        "Educational", "Music", "Pretend Play","Puzzle", "Racing", "Role Playing", "Simulation","Strategy","Trivia","Word"]);
    let education_genre = new Set(["Education", "Brain Games"]);
    let productivity_genre = new Set(["Productivity", "Creativity"]);
    // console.log("grouping genres furthermore");

    let genres_set = new Set();


    for(let i = 0, len = data.length; i < len; i++){
        let genre = data[i].genres;

        if(game_genre.has(genre)) {
            data[i].genres = "Games"
        }else if(education_genre.has(genre)){
            data[i].genres = "Education";
        }else if(productivity_genre.has(genre)){
            data[i].genres = "Productivity";
        }else if(genre === "Unknwon"){
            data[i].genres = "Other";
        }

        if (!genres_set.has(data[i].genres)){
            genres_set.add(data[i].genres);
        }

    }

    // console.log("number of genres ", genres_set)

    return data;
}
// given a genre string containing semi-colons, it will count the number of genres
function get_genres(str) {
    return str.split(";");
}
