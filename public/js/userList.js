function goBack() {
  // Implement your navigation logic to go back (e.g., window.history.back())
  window.history.back();
}


let userToDelete = null;
// Open and close Delete User Modal
function openDeleteUserModal(user) {
  userToDelete = user;
  document.getElementById('deleteUserMessage').textContent = `Vai tiešām vēlaties dzēst lietotāja ${user.name} ${user.surname} pieeju?`;
  document.getElementById('deleteUserModal').style.display = 'block';
}

async function fetchUsers() {
  try {
    const response = await fetch('/listUsers');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const users = await response.json();
    const userList = document.getElementById('user-list');
    userList.innerHTML = ''; // Clear previous content
    users.forEach(user => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const surnameCell = document.createElement('td');
      const actionCell = document.createElement('td');
      nameCell.textContent = user.name;
      surnameCell.textContent = user.surname;
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Dzēst';
      deleteButton.className = 'delete';
      deleteButton.onclick = () => openDeleteUserModal(user);
      actionCell.appendChild(deleteButton);
      row.appendChild(nameCell);
      row.appendChild(surnameCell);
      row.appendChild(actionCell);
      userList.appendChild(row);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

async function addUser(event) {
  event.preventDefault();
  var name = document.getElementById('addName').value;
  var surname = document.getElementById('addSurname').value;
  name = name[0].toUpperCase() + name.slice(1);
  surname = surname[0].toUpperCase() + surname.slice(1);
  try {
    const response = await fetch('/addUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, surname })
    });
    if (!response.ok) {
      throw new Error('Neizdevās pievienot lietotāju');
    }
    document.getElementById('addUserModal').style.display = 'none';
    document.getElementById('addUserForm').reset();
    fetchUsers();
  } catch (error) {
    console.error('Error:', error);
  }
}

async function deleteUser() {
  if (!userToDelete) return;
  try {
    const response = await fetch('/deleteUser', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userToDelete)
    });
    if (!response.ok) {
      throw new Error('Neizdevās dzēst lietotāju');
    }
    document.getElementById('deleteUserModal').style.display = 'none';
    fetchUsers();
  } catch (error) {
    console.error('Error:', error);
  }
}



// Fetch users when the page loads
window.onload = function () {
  fetchUsers();
  // Open and close Add User Modal
  document.getElementById('openAddUserModal').onclick = function () {
    document.getElementById('addUserModal').style.display = 'block';
  }
  document.getElementById('closeAddUserModal').onclick = function () {
    document.getElementById('addUserModal').style.display = 'none';
  }
  document.getElementById('closeDeleteUserModal').onclick = function () {
    document.getElementById('deleteUserModal').style.display = 'none';
  }
  document.getElementById('cancelDeleteUser').onclick = function () {
    document.getElementById('deleteUserModal').style.display = 'none';
  }
  document.getElementById('addUserForm').addEventListener('submit', addUser);
  document.getElementById('confirmDeleteUser').addEventListener('click', deleteUser);

}