document.getElementById('submit').addEventListener('click', async () => {
    let category = document.getElementById('category').value;
    let response = await fetch(`/search?category=${category}`);
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
      // Create an empty array to store selected items
      let selectedItems = [];
  
      data.rows.forEach(item => {
        let row = document.createElement('tr');
        let nameCell = document.createElement('td');
        let categoryCell = document.createElement('td');
        let imageCell = document.createElement('td');
        let buttonCell = document.createElement('td');
        let addToGroupButton = document.createElement('button');
  
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
  
        addToGroupButton.textContent = 'Add to Group';
        addToGroupButton.addEventListener('click', () => {
          // Add the item to the selectedItems array
          selectedItems.push(item);
        });
  
        buttonCell.appendChild(addToGroupButton);
  
        row.appendChild(nameCell);
        row.appendChild(categoryCell);
        row.appendChild(imageCell);
        row.appendChild(buttonCell);
  
        itemsTableBody.appendChild(row);
      });
  
      // Create a new button to submit the selected items
      let submitGroupButton = document.createElement('button');
      submitGroupButton.textContent = 'Submit Outfit';
      submitGroupButton.addEventListener('click', async () => {
        if (selectedItems.length === 0) {
          alert('No items selected in the group!');
          return;
        }
  
        // Send a POST request to the server with the selected items
        let response = await fetch('/submit-outfit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedItems)
        });
  
        // Handle the response from the server (e.g., display success message)
        let data = await response.json();
        console.log(data); // Replace with appropriate handling of server response
      });
  
      // Add the submit group button to the page (consider placement)
      document.getElementById('outfitButton').appendChild(submitGroupButton);
    }
  });