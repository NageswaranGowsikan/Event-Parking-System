document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgDiv = document.getElementById('msg');
    msgDiv.style.display = 'none';
    msgDiv.className = 'message';

    const email = document.getElementById('email').value;

    try {
        await apiFetch('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
        msgDiv.textContent = 'If an account exists, a reset link has been sent.';
        msgDiv.classList.add('success');
        msgDiv.style.display = 'block';
    } catch (error) {
        msgDiv.textContent = 'An error occurred. Please try again.';
        msgDiv.classList.add('error');
        msgDiv.style.display = 'block';
    }
});