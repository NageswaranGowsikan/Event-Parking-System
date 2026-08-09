document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const msgDiv = document.getElementById('msg');
    msgDiv.style.display = 'none';
    msgDiv.className = 'message';

    const payload = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        // Store token and customer ID (assuming backend returns customerId on login)
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('customer_id', data.customerId); 
        
        // Redirect to profile or dashboard
        window.location.href = 'profile.html'; 
    } catch (error) {
        msgDiv.textContent = error.message;
        msgDiv.classList.add('error');
        msgDiv.style.display = 'block';
    }
});