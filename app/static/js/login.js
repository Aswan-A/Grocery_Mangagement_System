document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    const supermarket = document.getElementById('supermarket').value;
    // Prepare data to send to the Flask backend
    const data = {
        username: username,
        password: password,
        supermarket:supermarket
    };
    
    // Use the Fetch API to send the login data to the Flask backend
    fetch('/login', {
        method: 'POST',  // HTTP method
        headers: {
            'Content-Type': 'application/json'  // Data format (JSON)
        },
        body: JSON.stringify(data)  // Send the data as JSON
    })
    .then(response => response.json())  // Convert response to JSON
    .then(responseData => {
        if (responseData.success) {
            message.style.color = 'green';
            message.textContent = responseData.message;
            // Redirect to the appropriate page based on the role
            setTimeout(() => {
                if (responseData.role === 'manager') {
                    window.location.href = '/manager';  // Redirect to manager dashboard
                } else if (responseData.role === 'staff') {
                    console.log("here");
                    window.location.href = '/staff';  // Redirect to staff dashboard
                }
            }, 1500);
        } else {
            message.style.color = 'red';
            message.textContent = responseData.message;
        }
    })
    .catch(error => {
        // Handle any errors that occur during the fetch request
        console.error('Error:', error);
        message.style.color = 'red';
        message.textContent = 'An error occurred while processing your request.';
    });
});
