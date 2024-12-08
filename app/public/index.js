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
        for(let post of data){
            let username = post.username;
            let caption = post.caption;
            let timestamp = post.timestamp;
            let outfit = post.outfit;
            let comments = post.comments;
            let likeCount = post.likeCount;

            const newPost = document.createElement('div');
            newPost.classList.add('post-display');
            container.appendChild(newPost);

            const outfitDisplay = document.createElement('div');
            outfitDisplay.classList.add('outfit-display');
            newPost.appendChild(outfitDisplay);
            
            for (let i = 1; i <= 5; i++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.textContent = i;
                outfitDisplay.appendChild(cell);
            }

            const postDataDisplay = document.createElement('div');
            postDataDisplay.classList.add('post-data-display');
            newPost.appendChild(postDataDisplay);

            const likeCountDisplay = document.createElement('div');
            likeCountDisplay.textContent = likeCount;
            likeCountDisplay.style.padding = '5px';
            const likeButton = document.createElement('button');
            likeButton.textContent = 'Like';
            likeButton.padding = '5px';
            const likeWrapper = document.createElement('div');
            likeWrapper.style.display = 'flex';
            likeWrapper.style.gap = '10px';
            likeWrapper.appendChild(likeButton);
            likeWrapper.appendChild(likeCountDisplay);
            const postedDateDisplay = document.createElement('div');
            postedDateDisplay.textContent = timestamp;
            postedDateDisplay.style.padding = '5px';

            postDataDisplay.appendChild(likeWrapper);
            postDataDisplay.appendChild(postedDateDisplay);

            const usernameDisplay = document.createElement('div');
            usernameDisplay.textContent = username;
            usernameDisplay.classList.add('username');
            newPost.appendChild(usernameDisplay);

            const captionDisplay = document.createElement('div');
            captionDisplay.textContent = caption;
            captionDisplay.style.padding = '5px';
            newPost.appendChild(captionDisplay);

            const commentsDisplay = document.createElement('div');
            commentsDisplay.textContent = 'Comments:';
            commentsDisplay.style.padding = '5px';
            for(let comment of comments){
                const commentCell = document.createElement('div');
                commentCell.style.padding = '5px';
                commentCell.style.border = '1px solid gray';

                const userDateWrapper = document.createElement('div');
                userDateWrapper.classList.add('post-data-display');
                const commenter = document.createElement('div');
                commenter.textContent = comment.username;
                commenter.classList.add('username');
                userDateWrapper.appendChild(commenter)
                const commentedOn = document.createElement('div');
                commentedOn.textContent = comment.timestamp;
                commentedOn.style.padding = '5px';
                userDateWrapper.appendChild(commentedOn);

                commentCell.appendChild(userDateWrapper);

                const commentText = document.createElement('div');
                commentText.textContent = comment.comment;
                commentText.style.padding = '5px';

                commentCell.appendChild(commentText);

                commentsDisplay.appendChild(commentCell);
            }
            newPost.appendChild(commentsDisplay);
        }

    })
    .catch((error) => console.error('Error fetching request data:', error));


// fetch(`/function/feed/${username}`)
//     .then((response) => response.json())
//     .then((data) => {
//         console.log(data);
//         p.textContent = data.data;
//     })
//     .catch((error) => console.error('Error fetching request data:', error));