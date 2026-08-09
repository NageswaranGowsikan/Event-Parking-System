document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const msgDiv = document.getElementById('msg');
    msgDiv.style.display = 'none';
    msgDiv.className = 'message';

    const payload = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value
    };

    try {
        // FIXED ENDPOINT HERE: Changed from '/customers/register' to '/auth/register'
        await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        msgDiv.textContent = 'Registration successful! Please check your email to verify your account.';
        msgDiv.classList.add('success');
        msgDiv.style.display = 'block';
        document.getElementById('registerForm').reset();
    } catch (error) {
        msgDiv.textContent = error.message;
        msgDiv.classList.add('error');
        msgDiv.style.display = 'block';
    }
});