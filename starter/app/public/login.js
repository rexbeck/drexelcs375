document.getElementById('submit').addEventListener('click', async () => {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
  
    let response = await fetch('/identity/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "username": username, "password": password })
    });
  
    let messageDiv = document.getElementById('message');
    if (response.ok) {
      window.location.replace("add.html");
    } else {
      let message = document.createElement('p');
      message.textContent = 'Something went wrong. Please double check that the username and password you input is correct.';
      messageDiv.appendChild(message);
    }
  });