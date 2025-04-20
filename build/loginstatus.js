async function checkLoggedInStatus() {
try {
    const response = await fetch('/loginstatus'); // Replace with your API endpoint

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const loginStatus = await response.json();

    if (loginStatus) {
        document.getElementById('status').textContent = 'Logged in';
    } else {
        document.getElementById('status').textContent = 'Logged out';
    }

} catch (error) {
    console.error('Error fetching logged-in status:', error);
    document.getElementById('status').textContent = 'Error checking status'; // Or some other indication of failure.
}
}

checkLoggedInStatus(); // Call the function when the page loads