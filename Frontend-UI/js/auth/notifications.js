// js/auth/notifications.js - Enhanced with Design System integration

document.addEventListener('DOMContentLoaded', () => {
    loadNotifications();
});

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
        
        if (!notifications || notifications.length === 0) {
            list.innerHTML = `
                <div class="glass-panel" style="padding: 60px 20px; text-align: center; color: var(--text-secondary);">
                    <i class="fa-regular fa-bell-slash" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <h3 style="font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">No Notifications Yet</h3>
                    <p>When you book tickets or parking passes, updates will appear here.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = '';
        
        notifications.forEach(notif => {
            const dateStr = new Date(notif.createdAt).toLocaleString();
            const card = document.createElement('div');
            
            card.className = `notification-card ${notif.isRead ? '' : 'unread'}`;
            card.innerHTML = `
                <div style="display: flex; gap: 16px; align-items: flex-start;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: ${notif.isRead ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.2)'}; color: ${notif.isRead ? 'var(--text-muted)' : 'var(--accent-cyan)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fa-solid fa-bell"></i>
                    </div>
                    <div>
                        <div class="notif-message">${notif.message}</div>
                        <div class="meta-data"><i class="fa-regular fa-clock"></i> ${dateStr}</div>
                    </div>
                </div>
                <div>
                    ${notif.isRead 
                        ? `<span class="badge badge-success"><i class="fa-solid fa-check-double"></i> Read</span>` 
                        : `<button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.82rem;" onclick="markAsRead(${notif.id})"><i class="fa-solid fa-check"></i> Mark as Read</button>`
                    }
                </div>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        list.innerHTML = `
            <div class="glass-panel" style="padding: 40px; color: var(--accent-rose); text-align: center;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.2rem; margin-bottom: 12px;"></i>
                <p>Failed to load notifications: ${error.message}</p>
            </div>
        `;
    }
}

async function markAsRead(notificationId) {
    try {
        await apiFetch(`/notifications/${notificationId}/read`, { method: 'PUT' });
        loadNotifications();
    } catch (error) {
        alert("Failed to mark notification as read: " + error.message);
    }
}

function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = "login.html";
}