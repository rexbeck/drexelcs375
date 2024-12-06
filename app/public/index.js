let username;

fetch('/identity/isUserLoggedIn')
    .then((response) => response.json())
    .then((data) => {
        if (data.isTokenInStorage) {
            username = data.username;
        } else {
            window.location.replace("login.html");
        }
    })
    .catch((error) => console.error('Error fetching request data:', error));

fetch(`/function/feed?${username}`)
    .then((response) => response.json())
    .then((data) => {
        document.body.innerHTML += `
        ${data}
        `;
    })
    .catch((error) => console.error('Error fetching request data:', error));