document.addEventListener('DOMContentLoaded', async () => {
    const msgDiv = document.getElementById('msg');
    const customerId = localStorage.getItem('customer_id');

    if (!customerId) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Fetching the profile using the exact endpoint from your BRD: /api/customers/{id}
        const profile = await apiFetch(`/customers/${customerId}`); 
        
        document.getElementById('name').value = profile.name;
        document.getElementById('phone').value = profile.phone;
        document.getElementById('email').value = profile.email;
    } catch (error) {
        msgDiv.textContent = 'Failed to load profile. Please log in again.';
        msgDiv.className = 'message error';
        msgDiv.style.display = 'block';
    }
});

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgDiv = document.getElementById('msg');
    msgDiv.style.display = 'none';
    msgDiv.className = 'message';

    const customerId = localStorage.getItem('customer_id');
    const payload = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value
    };

    try {
        // Updating the profile using the endpoint: PUT /api/customers/{id}
        await apiFetch(`/customers/${customerId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        msgDiv.textContent = 'Profile updated successfully!';
        msgDiv.classList.add('success');
        msgDiv.style.display = 'block';
    } catch (error) {
        msgDiv.textContent = error.message;
        msgDiv.classList.add('error');
        msgDiv.style.display = 'block';
    }
});

document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('customer_id');
    window.location.href = 'login.html';
});