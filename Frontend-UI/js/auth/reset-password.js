document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgDiv = document.getElementById('msg');
    msgDiv.style.display = 'none';
    msgDiv.className = 'message';

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const newPassword = document.getElementById('newPassword').value;

    if (!token) {
        msgDiv.textContent = 'Invalid or missing token.';
        msgDiv.classList.add('error');
        msgDiv.style.display = 'block';
        return;
    }

    try {
        await apiFetch('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, newPassword })
        });
        msgDiv.textContent = 'Password reset successful! Redirecting to login...';
        msgDiv.classList.add('success');
        msgDiv.style.display = 'block';
        setTimeout(() => window.location.href = 'login.html', 2500);
    } catch (error) {
        msgDiv.textContent = error.message;
        msgDiv.classList.add('error');
        msgDiv.style.display = 'block';
    }
});