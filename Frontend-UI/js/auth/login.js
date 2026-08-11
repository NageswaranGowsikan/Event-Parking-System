// js/auth/login.js - Bulletproof Sign In Logic

async function login(event) {
    if (event && event.preventDefault) event.preventDefault();
    
    const msgDiv = document.getElementById('msg');
    const submitBtn = document.getElementById('submitBtn');
    
    if (msgDiv) {
        msgDiv.style.display = 'none';
        msgDiv.className = 'message';
    }

    const emailInput = document.getElementById('loginEmail') || document.getElementById('email');
    const passwordInput = document.getElementById('loginPassword') || document.getElementById('password');

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        if (msgDiv) {
            msgDiv.textContent = "Please fill in both email and password.";
            msgDiv.className = "message error";
        }
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...`;
    }

    try {
        const response = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        // Store token in both key names for 100% compatibility across legacy & new pages
        if (response.token) {
            localStorage.setItem('jwtToken', response.token);
            localStorage.setItem('jwt_token', response.token);
        }

        const user = getUserFromToken();
        if (user && user.userId) {
            localStorage.setItem('customer_id', user.userId);
        }

        if (msgDiv) {
            msgDiv.textContent = "Sign in successful! Redirecting...";
            msgDiv.className = "message success";
        }

        setTimeout(() => {
            if (user && user.role === "Admin") {
                window.location.href = "admin-dashboard.html";
            } else {
                window.location.href = "events.html";
            }
        }, 600);
        
    } catch (error) {
        if (msgDiv) {
            msgDiv.textContent = error.message || "Invalid credentials. Please verify your email & password.";
            msgDiv.className = "message error";
        } else {
            alert("Login failed: " + error.message);
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Sign In to Account`;
        }
    }
}