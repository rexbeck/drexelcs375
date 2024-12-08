let username;
let p = document.getElementById("p");

fetch('/identity/isUserLoggedIn')
    .then((response) => response.json())
    .then((data) => {
        if (data.isTokenInStorage) {
            username = data.username;
            return fetch(`/function/feed/${username}`);
        } else {
            window.location.replace("login.html");
            return Promise.reject('User not logged in.');
        }
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        p.textContent = data.data;
    })
    .catch((error) => console.error('Error fetching request data:', error));


// fetch(`/function/feed/${username}`)
//     .then((response) => response.json())
//     .then((data) => {
//         console.log(data);
//         p.textContent = data.data;
//     })
//     .catch((error) => console.error('Error fetching request data:', error));