// js/events.js - Enhanced with Design System integration

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value;
    loadEvents(searchTerm);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    loadEvents();
}

async function loadEvents(searchQuery = '') {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = `
        <div class="loading-state-wrapper">
            <i class="fa-solid fa-circle-notch spinner-icon"></i>
            <h3 style="font-weight: 600; margin-bottom: 6px;">Loading events...</h3>
            <p style="font-size: 0.9rem;">Fetching upcoming schedules</p>
        </div>
    `;

    try {
        let endpoint = '/events';
        if (searchQuery) {
            endpoint += `?search=${encodeURIComponent(searchQuery)}`;
        }

        const events = await apiFetch(endpoint);
        
        container.innerHTML = ''; 

        if (!events || events.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);" class="glass-panel">
                    <i class="fa-solid fa-calendar-xmark" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 8px;">No Upcoming Events Found</h3>
                    <p>Try clearing your search filters or check back later for new event listings.</p>
                    <button onclick="clearCategoryAndSearch()" class="btn btn-secondary" style="margin-top: 16px;">
                        <i class="fa-solid fa-rotate-left"></i> Reset Filters
                    </button>
                </div>
            `;
            return;
        }

        events.forEach(event => {
            const eventDate = new Date(event.eventDate).toLocaleDateString(undefined, {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            // Modern placeholder SVG background if image missing
            const imageUrl = event.imageUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80';

            const card = document.createElement('div');
            card.className = 'event-card animate-fade-in';
            
            card.innerHTML = `
                <div class="event-image-wrapper">
                    <span class="badge badge-category event-card-category-badge">
                        <i class="fa-solid fa-tag"></i> ${event.categoryName || 'Event'}
                    </span>
                    <img src="${imageUrl}" alt="${event.title}" class="event-image" onerror="this.src='https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80'">
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-details">
                        <i class="fa-solid fa-location-dot"></i> ${event.venueName || 'Main Arena'}
                    </p>
                    <p class="event-details">
                        <i class="fa-regular fa-calendar-check"></i> ${eventDate}
                    </p>
                    <p class="event-description">${event.description || 'Experience an unforgettable performance live at this premier venue.'}</p>
                    <button class="btn-view-seats" onclick="viewSeats(${event.id})">
                        <i class="fa-solid fa-chair"></i> Select Seats & Parking
                    </button>
                </div>
            `;
            
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading events:", error);
        container.innerHTML = `
            <div style="color: var(--accent-rose); text-align: center; grid-column: 1 / -1; padding: 40px;" class="glass-panel">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
                <h3 style="font-weight: 700;">Failed to Load Events</h3>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">${error.message}</p>
            </div>
        `;
    }
}

function viewSeats(eventId) {
    window.location.href = `seat-map.html?eventId=${eventId}`;
}

function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = "login.html";
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    const navLinks = document.getElementById('navLinks');
    if (!token && navLinks) {
        navLinks.innerHTML = `
            <a href="login.html" class="btn btn-primary" style="padding: 8px 18px;">
                <i class="fa-solid fa-right-to-bracket"></i> Login / Register
            </a>
        `;
    }
    loadEvents();
});