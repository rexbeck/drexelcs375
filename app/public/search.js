
document.getElementById('submit').addEventListener('click', async () => {
  let category = document.getElementById('category').value;
  let response = await fetch(`/function/search?category=${category}`);
  let data = await response.json();
  let messageDiv = document.getElementById('message');
  let itemsTableBody = document.getElementById('items');

  messageDiv.textContent = '';
  itemsTableBody.innerHTML = '';

  if (data.rows.length === 0) {
    let message = document.createElement('p');
    message.textContent = 'No items found';
    messageDiv.appendChild(message);

  } else {
    data.rows.forEach(item => {
      let row = document.createElement('tr');
      let nameCell = document.createElement('td');
      let categoryCell = document.createElement('td');
      let imageCell = document.createElement('td');

      nameCell.textContent = item.name;
      categoryCell.textContent = item.category;

      if (item.imageUrl) {
        const image = document.createElement('img');
        image.src = item.imageUrl;
        image.style.width = '250px';
        image.style.height = '250px';
        imageCell.appendChild(image);
      } else {
        imageCell.textContent = 'No Image';
      }

      row.appendChild(nameCell);
      row.appendChild(categoryCell);
      row.appendChild(imageCell);
      
      itemsTableBody.appendChild(row);
    });
  }
});