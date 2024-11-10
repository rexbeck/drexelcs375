document.getElementById('submit').addEventListener('click', async () => {
    let name = document.getElementById('name').value;
    let category = document.getElementById('category').value;
    let imageFile = document.querySelector('input[name="image"]').files[0];


    if (!imageFile) {
      // Handle no image selected
      return;
    }

    let formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('image', imageFile);

    let response = await fetch('/add', {
      method: 'POST',
      body: formData
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