let username;
const container = document.getElementById("container");

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
        //for(let post of data){
        let post = data[0];
            let username = post.username;
            let caption = post.caption;
            let timestamp = post.timestamp;
            let outfit = post.outfit;
            let comments = post.comments;
            let likeCount = post.likeCount;
            
            for (let i = 1; i <= 5; i++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.textContent = i;
                container.appendChild(cell);
            }

            const likeAndDateBar = document.createElement('div');
            likeAndDateBar.style.display = 'flex';
            const likeHalf = document.createElement('div');
            const dateHalf = document.createElement('div');
            container.insertAdjacentElement('afterend', likeAndDateBar);
            likeHalf.textContent = `Likes: ${likeCount}`;
            likeAndDateBar.appendChild(likeHalf);
            dateHalf.textContent = timestamp;
            dateHalf.style.textAlign = right;
            likeAndDateBar.appendChild(dateHalf);
        //}

        test.textContent = data[0];
    })
    .catch((error) => console.error('Error fetching request data:', error));


// fetch(`/function/feed/${username}`)
//     .then((response) => response.json())
//     .then((data) => {
//         console.log(data);
//         p.textContent = data.data;
//     })
//     .catch((error) => console.error('Error fetching request data:', error));