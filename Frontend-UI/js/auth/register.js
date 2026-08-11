// js/auth/register.js - Bulletproof Account Registration

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const msgDiv = document.getElementById('msg');
        const submitBtn = document.getElementById('submitBtn');
        
        if (msgDiv) {
            msgDiv.style.display = 'none';
            msgDiv.className = 'message';
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Creating Account...`;
        }

        const payload = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: document.getElementById('password').value
        };

        try {
            await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            if (msgDiv) {
                msgDiv.textContent = 'Registration successful! Please check your email to verify your account.';
                msgDiv.className = 'message success';
            }
            form.reset();
        } catch (error) {
            if (msgDiv) {
                msgDiv.textContent = error.message || 'Registration failed. Please try again.';
                msgDiv.className = 'message error';
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> Create Account`;
            }
        }
    });
});