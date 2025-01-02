document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    
    if (username === 'admin' && password === 'pass') {
        message.style.color = 'green';
        message.textContent = 'Login successful! Redirecting...';
        // Simulate redirection
        setTimeout(() => {
            window.location.href = 'manager.html'; // Replace with your dashboard URL
        }, 1500);
    } 
    
    else if (username === 'staff' && password === 'pass') {
        message.style.color = 'green';
        message.textContent = 'Login successful! Redirecting...';
        // Simulate redirection
        setTimeout(() => {
            window.location.href = 'staff.html'; // Replace with your dashboard URL
        }, 1500);
    }
    
    
    else {
        message.style.color = 'red';
        message.textContent = 'Invalid username or password!';
    }
});
