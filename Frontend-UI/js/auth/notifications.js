document.addEventListener('DOMContentLoaded', () => {
    loadNotifications();
});

// Decodes the JWT to find the logged-in user's ID securely
function getCustomerIdFromToken() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]; 
    } catch (e) {
        return null;
    }
}

async function loadNotifications() {
    const list = document.getElementById('notificationsList');
    const customerId = getCustomerIdFromToken();

    if (!customerId) {
        window.location.href = "login.html";
        return;
    }

    try {
        const notifications = await apiFetch(`/notifications/customer/${customerId}`);
        
        if (notifications.length === 0) {
            list.innerHTML = '<p>You have no notifications at this time.</p>';
            return;
        }

        list.innerHTML = '';
        
        notifications.forEach(notif => {
            const dateStr = new Date(notif.createdAt).toLocaleString();
            const card = document.createElement('div');
            
            card.className = `notification-card ${notif.isRead ? '' : 'unread'}`;
            card.innerHTML = `
                <div>
                    <div class="notif-message">${notif.message}</div>
                    <div class="meta-data">${dateStr}</div>
                </div>
                <div>
                    ${notif.isRead 
                        ? `<span class="status-read">Read</span>` 
                        : `<button class="btn-read" onclick="markAsRead(${notif.id})">Mark as Read ✓</button>`
                    }
                </div>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        list.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

async function markAsRead(notificationId) {
    try {
        await apiFetch(`/notifications/${notificationId}/read`, { method: 'PUT' });
        loadNotifications(); // Reload list to update UI colors and buttons
    } catch (error) {
        alert("Failed to mark as read: " + error.message);
    }
}

function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = "login.html";
}