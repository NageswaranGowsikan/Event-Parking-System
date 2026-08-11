// js/auth/reset-password.js - Enhanced with Design System feedback

document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgDiv = document.getElementById('msg');
    const submitBtn = document.getElementById('submitBtn');

    if (msgDiv) {
        msgDiv.style.display = 'none';
        msgDiv.className = 'message';
    }

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const newPassword = document.getElementById('newPassword').value;

    if (!token) {
        if (msgDiv) {
            msgDiv.textContent = 'Invalid or missing reset token in URL parameters.';
            msgDiv.className = 'message error';
        }
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Updating...`;
    }

    try {
        await apiFetch('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, newPassword })
        });
        
        if (msgDiv) {
            msgDiv.textContent = 'Password reset successful! Redirecting to login page...';
            msgDiv.className = 'message success';
        }

        setTimeout(() => window.location.href = 'login.html', 2200);
    } catch (error) {
        if (msgDiv) {
            msgDiv.textContent = error.message || 'Password reset failed. Token may have expired.';
            msgDiv.className = 'message error';
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Update Password`;
        }
    }
});