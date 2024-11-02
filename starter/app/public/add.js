document.getElementById('submit').addEventListener('click', async () => {
    let name = document.getElementById('name').value;
    let category = document.getElementById('category').value;
    let image = document.querySelector('input[name="image"]:checked').value;
  
    let response = await fetch('/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, category, image })
    });
  
    let messageDiv = document.getElementById('message');
    if (response.ok) {
      let message = document.createElement('p');
      message.textContent = 'Success';
      messageDiv.appendChild(message);
    } else {
      let message = document.createElement('p');
      message.textContent = 'Bad Request';
      messageDiv.appendChild(message);
    }
  });