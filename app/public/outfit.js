let selectedItems = [];

function getSelectedItems() {
    return selectedItems;
}

function pushSelectedItems(item) {
    selectedItems.push(item);
}

function clearSelectedItems() {
    selectedItems = [];
}
document.getElementById('submit').addEventListener('click', async () => {
    let username;
    let userResponse = await fetch('/identity/isUserLoggedIn');
    let userData = await userResponse.json();
    username = userData.username;
    
  
  
    let category = document.getElementById('category').value;
    let response = await fetch(`/function/search?category=${category}`);
    let data = await response.json();
    let messageDiv = document.getElementById('message');
    let itemsTableBody = document.getElementById('items');
    let outfitTable = document.getElementById('outfitTable');
  
    messageDiv.textContent = '';
    itemsTableBody.innerHTML = '';
  
    if (data.rows.length === 0) {
      let message = document.createElement('p');
      message.textContent = 'No items found';
      messageDiv.appendChild(message);
  
    } else {
      // let selectedItems = [];
  
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
          // selectedItems.push(item);
          pushSelectedItems(item);
          let li = document.createElement("li");
          li.textContent = item.name;
          outfitTable.appendChild(li);
        });
  
        buttonCell.appendChild(addToGroupButton);
  
        row.appendChild(nameCell);
        row.appendChild(categoryCell);
        row.appendChild(imageCell);
        row.appendChild(buttonCell);
  
        itemsTableBody.appendChild(row);
      });
  
      // Create a new button to submit the selected items
      // let submitGroupButton = document.createElement('button');
      let submitGroupButton = document.getElementById("outfitSubmitButton");
      submitGroupButton.textContent = 'Submit Outfit';
      submitGroupButton.addEventListener('click', async () => {

        let subItems = getSelectedItems();
        if (subItems.length === 0) {
          alert('No items selected in the group!');
          return;
        }

        let outfitName = document.getElementById("name").value;
        subItems.unshift(outfitName);
        subItems.unshift(username);

    
  
        // Send a POST request to the server with the selected items
        let response = await fetch('/function/submit-outfit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subItems)
        });

        if (response.ok) {
          let message = document.createElement('p');
          message.textContent = 'Success';
          messageDiv.appendChild(message);
        } else {
          let message = document.createElement('p');
          message.textContent = 'Bad Request';
          messageDiv.appendChild(message);
        }
  
        let data = await response.json();
        while (outfitTable.firstChild) {
          outfitTable.removeChild(outfitTable.firstChild);
        }
        clearSelectedItems()
      });
  
      // Add the submit group button to the page (consider placement)
      document.getElementById('outfitButton').appendChild(submitGroupButton);
    }
  });