document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const msgDiv = document.getElementById('msg');
    const loginLink = document.getElementById('loginLink');

    if (!token) {
        msgDiv.textContent = 'Invalid link. No token found.';
        msgDiv.classList.add('error');
        return;
    }

    try {
        await apiFetch(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
            method: 'GET'
        });
        msgDiv.textContent = 'Email verified successfully!';
        msgDiv.className = 'message success';
        loginLink.style.display = 'block';
    } catch (error) {
        msgDiv.textContent = error.message;
        msgDiv.className = 'message error';
    }
});