// import { User } from './models'; // Import "your" User model

// Function to check if the user is logged in from local storage
function isLoggedIn(): boolean {
  const loggedInUser = localStorage.getItem('loggedInUser');
  return !!loggedInUser;
}

// Example function to retrieve user data from the server
export async function getUserData() {
  if (!isLoggedIn()) {
    console.log('User is not logged in');
    return;
  }

  try {
      const response = await fetch('127.0.0.1:300/getUserData', {
      method: 'GET',
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('User Data:', userData);
    } else {
      console.error('Error retrieving user data');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example function to update user score on the server
export async function updateUserScore(newScore: number) {
  if (!isLoggedIn()) {
    console.log('User is not logged in');
    return;
  }

  try {
    const response = await fetch('127.0.0.1:300/updateUserScore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newScore }),
    });

    if (response.ok) {
      console.log('User score updated successfully');
    } else {
      console.error('Error updating user score');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
