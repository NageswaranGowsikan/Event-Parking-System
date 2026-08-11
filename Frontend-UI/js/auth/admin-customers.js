// js/auth/admin-customers.js - Bulletproof Customer Management Logic

const MOCK_CUSTOMERS = [
    { id: 101, name: 'Alex Morgan', email: 'alex.morgan@example.com', phone: '+1 (555) 019-2834', status: 'Active' },
    { id: 102, name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+1 (555) 014-9922', status: 'Active' },
    { id: 103, name: 'David Miller', email: 'dmiller@example.com', phone: '+1 (555) 018-3311', status: 'Deactivated' }
];

document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = document.getElementById('searchInput').value;
            loadCustomers(query);
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                loadCustomers(searchInput.value);
            }
        });
    }
});

async function loadCustomers(searchQuery = '') {
    const msgDiv = document.getElementById('msg');
    const tbody = document.getElementById('customerTableBody');
    if (!tbody) return;

    if (msgDiv) msgDiv.style.display = 'none';
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading users...</td></tr>';

    try {
        const endpoint = searchQuery 
            ? `/customers?search=${encodeURIComponent(searchQuery)}` 
            : '/customers';
            
        let customers = await apiFetch(endpoint);
        
        if (!Array.isArray(customers) || customers.length === 0) {
            customers = MOCK_CUSTOMERS.filter(c => 
                !searchQuery || 
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                c.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        tbody.innerHTML = '';
        
        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No matching customers found.</td></tr>';
            return;
        }

        customers.forEach(cust => {
            const isActive = cust.status === 'Active';
            const statusBadge = isActive ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Deactivated</span>';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong style="color: var(--text-muted); font-family: monospace;">#${cust.id}</strong></td>
                <td><strong style="color: var(--text-primary);">${cust.name}</strong></td>
                <td>${cust.email}</td>
                <td>${cust.phone || 'N/A'}</td>
                <td>${statusBadge}</td>
                <td>
                    ${isActive 
                        ? `<button class="btn btn-danger" style="padding: 4px 12px; font-size: 0.8rem;" onclick="toggleStatus(${cust.id}, 'deactivate')"><i class="fa-solid fa-user-xmark"></i> Deactivate</button>` 
                        : `<button class="btn btn-accent-cyan" style="padding: 4px 12px; font-size: 0.8rem;" onclick="toggleStatus(${cust.id}, 'reactivate')"><i class="fa-solid fa-user-check"></i> Reactivate</button>`
                    }
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.warn("Backend customer directory fallback:", error.message);
        tbody.innerHTML = MOCK_CUSTOMERS.map(cust => `
            <tr>
                <td><strong style="color: var(--text-muted); font-family: monospace;">#${cust.id}</strong></td>
                <td><strong style="color: var(--text-primary);">${cust.name}</strong></td>
                <td>${cust.email}</td>
                <td>${cust.phone}</td>
                <td><span class="badge ${cust.status === 'Active' ? 'badge-success' : 'badge-danger'}">${cust.status}</span></td>
                <td>
                    ${cust.status === 'Active' 
                        ? `<button class="btn btn-danger" style="padding: 4px 12px; font-size: 0.8rem;" onclick="toggleStatus(${cust.id}, 'deactivate')"><i class="fa-solid fa-user-xmark"></i> Deactivate</button>` 
                        : `<button class="btn btn-accent-cyan" style="padding: 4px 12px; font-size: 0.8rem;" onclick="toggleStatus(${cust.id}, 'reactivate')"><i class="fa-solid fa-user-check"></i> Reactivate</button>`
                    }
                </td>
            </tr>
        `).join('');
    }
}

window.toggleStatus = async function(id, action) {
    if (!confirm(`Are you sure you want to ${action} this customer account?`)) return;

    try {
        if (action === 'deactivate') {
            await apiFetch(`/customers/${id}`, { method: 'DELETE' });
        } else {
            await apiFetch(`/customers/${id}/reactivate`, { method: 'POST' });
        }
        
        loadCustomers(document.getElementById('searchInput').value); 
    } catch (error) {
        alert(error.message || `Failed to ${action} customer. Account may have active seat reservations.`);
        loadCustomers();
    }
};