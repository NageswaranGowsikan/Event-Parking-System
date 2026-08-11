document.addEventListener('DOMContentLoaded', () => {
    loadVenues();
    loadCategories();
});

// --- VENUES ---
async function loadVenues() {
    const tbody = document.getElementById('venueTable');
    try {
        const venues = await apiFetch('/venues');
        tbody.innerHTML = venues.length ? '' : '<tr><td colspan="4">No venues found.</td></tr>';
        venues.forEach(v => {
            tbody.innerHTML += `<tr>
                <td>${v.name}</td>
                <td>${v.location}</td>
                <td>${v.capacity}</td>
                <td><button class="btn-danger" onclick="deleteVenue(${v.id})">Delete</button></td>
            </tr>`;
        });
    } catch (e) { tbody.innerHTML = `<tr><td colspan="4" style="color:red;">Error loading venues.</td></tr>`; }
}

async function addVenue() {
    const name = document.getElementById('vName').value;
    const location = document.getElementById('vLocation').value;
    const capacity = parseInt(document.getElementById('vCapacity').value);

    if (!name || !location || isNaN(capacity)) return alert("Fill all venue fields!");
    
    try {
        await apiFetch('/venues', { 
            method: 'POST', 
            // This perfectly matches your CreateVenueDto
            body: JSON.stringify({ name: name, location: location, capacity: capacity }) 
        });
        document.getElementById('vName').value = '';
        document.getElementById('vLocation').value = '';
        document.getElementById('vCapacity').value = '';
        loadVenues();
    } catch (error) { alert(error.message); }
}

async function deleteVenue(id) {
    if (!confirm("Delete this venue?")) return;
    try { await apiFetch(`/venues/${id}`, { method: 'DELETE' }); loadVenues(); } 
    catch (error) { alert(error.message); }
}

// --- CATEGORIES ---
async function loadCategories() {
    const tbody = document.getElementById('categoryTable');
    try {
        const categories = await apiFetch('/categories');
        tbody.innerHTML = categories.length ? '' : '<tr><td colspan="3">No categories found.</td></tr>';
        categories.forEach(c => {
            tbody.innerHTML += `<tr>
                <td>${c.name}</td>
                <td>${c.description || ''}</td>
                <td><button class="btn-danger" onclick="deleteCategory(${c.id})">Delete</button></td>
            </tr>`;
        });
    } catch (e) { tbody.innerHTML = `<tr><td colspan="3" style="color:red;">Error loading categories.</td></tr>`; }
}

async function addCategory() {
    const name = document.getElementById('cName').value;
    const description = document.getElementById('cDescription').value;
    
    if (!name) return alert("Category name required!");
    
    try {
        await apiFetch('/categories', { 
            method: 'POST', 
            // This perfectly matches your CreateCategoryDto
            body: JSON.stringify({ name: name, description: description }) 
        });
        document.getElementById('cName').value = '';
        document.getElementById('cDescription').value = '';
        loadCategories();
    } catch (error) { alert(error.message); }
}

async function deleteCategory(id) {
    if (!confirm("Delete this category?")) return;
    try { await apiFetch(`/categories/${id}`, { method: 'DELETE' }); loadCategories(); } 
    catch (error) { alert(error.message); }
}