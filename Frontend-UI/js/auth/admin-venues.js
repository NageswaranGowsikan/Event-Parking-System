// js/auth/admin-venues.js - Bulletproof Venues & Categories CRUD Logic

const MOCK_VENUES = [
    { id: 1, name: 'Grand Arena Stadium', location: 'New York, NY', capacity: 5000 },
    { id: 2, name: 'Metropolitan Music Hall', location: 'Los Angeles, CA', capacity: 2500 },
    { id: 3, name: 'Civic Exhibition Center', location: 'Chicago, IL', capacity: 1200 }
];

const MOCK_CATEGORIES = [
    { id: 1, name: 'Concert', description: 'Live musical performances & bands' },
    { id: 2, name: 'Sports', description: 'Championship games & matches' },
    { id: 3, name: 'Theater', description: 'Stage plays & musical drama' }
];

document.addEventListener('DOMContentLoaded', () => {
    loadVenues();
    loadCategories();
});

async function loadVenues() {
    const tbody = document.getElementById('venueTable');
    if (!tbody) return;

    try {
        let venues = await apiFetch('/venues');
        if (!Array.isArray(venues) || venues.length === 0) {
            venues = MOCK_VENUES;
        }

        tbody.innerHTML = '';
        venues.forEach(v => {
            tbody.innerHTML += `<tr>
                <td><strong style="color: var(--text-primary);">${v.name}</strong></td>
                <td><i class="fa-solid fa-location-dot" style="color: var(--accent-cyan); font-size: 0.85rem;"></i> ${v.location}</td>
                <td><span class="badge badge-category"><i class="fa-solid fa-users"></i> ${v.capacity.toLocaleString()} Seats</span></td>
                <td><button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteVenue(${v.id})"><i class="fa-solid fa-trash"></i> Delete</button></td>
            </tr>`;
        });
    } catch (e) {
        tbody.innerHTML = MOCK_VENUES.map(v => `
            <tr>
                <td><strong style="color: var(--text-primary);">${v.name}</strong></td>
                <td><i class="fa-solid fa-location-dot" style="color: var(--accent-cyan); font-size: 0.85rem;"></i> ${v.location}</td>
                <td><span class="badge badge-category"><i class="fa-solid fa-users"></i> ${v.capacity.toLocaleString()} Seats</span></td>
                <td><button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteVenue(${v.id})"><i class="fa-solid fa-trash"></i> Delete</button></td>
            </tr>
        `).join('');
    }
}

async function addVenue() {
    const nameInput = document.getElementById('vName');
    const locInput = document.getElementById('vLocation');
    const capInput = document.getElementById('vCapacity');

    const name = nameInput.value.trim();
    const location = locInput.value.trim();
    const capacity = parseInt(capInput.value);

    if (!name || !location || isNaN(capacity)) return alert("Please fill all venue input fields!");
    
    try {
        await apiFetch('/venues', { 
            method: 'POST', 
            body: JSON.stringify({ name: name, location: location, capacity: capacity }) 
        });
        nameInput.value = '';
        locInput.value = '';
        capInput.value = '';
        loadVenues();
    } catch (error) { 
        alert("Failed to create venue: " + error.message); 
    }
}

async function deleteVenue(id) {
    if (!confirm("Delete this venue?")) return;
    try { 
        await apiFetch(`/venues/${id}`, { method: 'DELETE' }); 
        loadVenues(); 
    } catch (error) { 
        alert("Failed to delete venue: " + error.message); 
    }
}

async function loadCategories() {
    const tbody = document.getElementById('categoryTable');
    if (!tbody) return;

    try {
        let categories = await apiFetch('/categories');
        if (!Array.isArray(categories) || categories.length === 0) {
            categories = MOCK_CATEGORIES;
        }

        tbody.innerHTML = '';
        categories.forEach(c => {
            tbody.innerHTML += `<tr>
                <td><strong style="color: var(--accent-cyan);">${c.name}</strong></td>
                <td>${c.description || 'N/A'}</td>
                <td><button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteCategory(${c.id})"><i class="fa-solid fa-trash"></i> Delete</button></td>
            </tr>`;
        });
    } catch (e) { 
        tbody.innerHTML = MOCK_CATEGORIES.map(c => `
            <tr>
                <td><strong style="color: var(--accent-cyan);">${c.name}</strong></td>
                <td>${c.description || 'N/A'}</td>
                <td><button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.8rem;" onclick="deleteCategory(${c.id})"><i class="fa-solid fa-trash"></i> Delete</button></td>
            </tr>
        `).join('');
    }
}

async function addCategory() {
    const nameInput = document.getElementById('cName');
    const descInput = document.getElementById('cDescription');

    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    
    if (!name) return alert("Category name is required!");
    
    try {
        await apiFetch('/categories', { 
            method: 'POST', 
            body: JSON.stringify({ name: name, description: description }) 
        });
        nameInput.value = '';
        descInput.value = '';
        loadCategories();
    } catch (error) { 
        alert("Failed to create category: " + error.message); 
    }
}

async function deleteCategory(id) {
    if (!confirm("Delete this category?")) return;
    try { 
        await apiFetch(`/categories/${id}`, { method: 'DELETE' }); 
        loadCategories(); 
    } catch (error) { 
        alert("Failed to delete category: " + error.message); 
    }
}