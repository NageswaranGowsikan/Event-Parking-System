// js/auth/profile.js - Enhanced with Design System feedback

function getCustomerId() {
    let customerId = localStorage.getItem('customer_id');
    if (customerId) return customerId;
    
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('jwt_token');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    } catch (e) {
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const msgDiv = document.getElementById('msg');
    const customerId = getCustomerId();

    if (!customerId) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const profile = await apiFetch(`/customers/${customerId}`); 
        
        if (profile) {
            if (document.getElementById('name')) document.getElementById('name').value = profile.name || '';
            if (document.getElementById('phone')) document.getElementById('phone').value = profile.phone || '';
            if (document.getElementById('email')) document.getElementById('email').value = profile.email || '';
        }
    } catch (error) {
        if (msgDiv) {
            msgDiv.textContent = 'Failed to load profile details: ' + error.message;
            msgDiv.className = 'message error';
        }
    }
});

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgDiv = document.getElementById('msg');
    if (msgDiv) {
        msgDiv.style.display = 'none';
        msgDiv.className = 'message';
    }

    const customerId = getCustomerId();
    const payload = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim()
    };

    try {
        await apiFetch(`/customers/${customerId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        if (msgDiv) {
            msgDiv.textContent = 'Profile updated successfully!';
            msgDiv.className = 'message success';
        }
    } catch (error) {
        if (msgDiv) {
            msgDiv.textContent = error.message || 'Failed to update profile.';
            msgDiv.className = 'message error';
        }
    }
});

document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('customer_id');
    window.location.href = 'login.html';
});