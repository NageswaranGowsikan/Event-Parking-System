// js/auth/verify-email.js - Enhanced with Design System feedback

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const msgDiv = document.getElementById('msg');
    const loginLink = document.getElementById('loginLink');

    if (!token) {
        if (msgDiv) {
            msgDiv.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Invalid verification link. No security token found.`;
            msgDiv.className = 'message error';
        }
        return;
    }

    try {
        await apiFetch(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
            method: 'GET'
        });
        if (msgDiv) {
            msgDiv.innerHTML = `<i class="fa-solid fa-circle-check"></i> Email verified successfully! You can now sign in to your account.`;
            msgDiv.className = 'message success';
        }
        if (loginLink) {
            loginLink.style.display = 'block';
        }
    } catch (error) {
        if (msgDiv) {
            msgDiv.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Verification failed: ${error.message}`;
            msgDiv.className = 'message error';
        }
        if (loginLink) {
            loginLink.style.display = 'block';
        }
    }
});