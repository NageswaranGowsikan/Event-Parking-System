document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
});

document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    loadCustomers(query);
});

window.logout = function() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('customer_id');
    window.location.href = 'login.html';
};

async function loadCustomers(searchQuery = '') {
    const msgDiv = document.getElementById('msg');
    const tbody = document.getElementById('customerTableBody');
    msgDiv.style.display = 'none';
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>';

    try {
        const endpoint = searchQuery 
            ? `/customers?search=${encodeURIComponent(searchQuery)}` 
            : '/customers';
            
        const customers = await apiFetch(endpoint);
        
        tbody.innerHTML = '';
        
        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No customers found.</td></tr>';
            return;
        }

        customers.forEach(cust => {
            const statusClass = cust.status.toLowerCase();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cust.id}</td>
                <td>${cust.name}</td>
                <td>${cust.email}</td>
                <td>${cust.phone}</td>
                <td><span class="badge ${statusClass}">${cust.status}</span></td>
                <td>
                    ${cust.status === 'Active' 
                        ? `<button class="btn-danger" onclick="toggleStatus(${cust.id}, 'deactivate')">Deactivate</button>` 
                        : `<button class="btn-success" onclick="toggleStatus(${cust.id}, 'reactivate')">Reactivate</button>`
                    }
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = '';
        msgDiv.textContent = error.message || 'Failed to load customers.';
        msgDiv.style.backgroundColor = '#fdf7f7';
        msgDiv.style.color = '#d9534f';
        msgDiv.style.border = '1px solid #d9534f';
        msgDiv.style.display = 'block';
    }
}

// Make this function global so the onclick handlers in the HTML table can find it
window.toggleStatus = async function(id, action) {
    if (!confirm(`Are you sure you want to ${action} this customer?`)) return;

    try {
        if (action === 'deactivate') {
            await apiFetch(`/customers/${id}`, { method: 'DELETE' });
        } else {
            await apiFetch(`/customers/${id}/reactivate`, { method: 'POST' });
        }
        
        // Reload the table to show the updated status
        loadCustomers(document.getElementById('searchInput').value); 
    } catch (error) {
        alert(error.message || `Failed to ${action} customer. They may have active bookings.`);
    }
};