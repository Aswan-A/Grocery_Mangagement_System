document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    
    if (username === 'admin' && password === 'password123') {
        message.style.color = 'green';
        message.textContent = 'Login successful! Redirecting...';
        // Simulate redirection
        setTimeout(() => {
            window.location.href = 'manager.html'; // Redirect to the manager dashboard
        }, 1500);
    } else {
        message.style.color = 'red';
        message.textContent = 'Invalid username or password!';
    }
});
