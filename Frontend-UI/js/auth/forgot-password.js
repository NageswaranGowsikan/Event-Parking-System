// js/auth/forgot-password.js - Enhanced with Design System feedback

document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgDiv = document.getElementById('msg');
    const submitBtn = document.getElementById('submitBtn');

    if (msgDiv) {
        msgDiv.style.display = 'none';
        msgDiv.className = 'message';
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Sending Link...`;
    }

    const email = document.getElementById('email').value.trim();

    try {
        await apiFetch('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
        if (msgDiv) {
            msgDiv.textContent = 'If an account exists for this email, a password reset link has been sent.';
            msgDiv.className = 'message success';
        }
    } catch (error) {
        if (msgDiv) {
            msgDiv.textContent = 'An error occurred while processing your request. Please try again.';
            msgDiv.className = 'message error';
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Send Reset Link`;
        }
    }
});