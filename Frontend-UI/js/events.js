// js/events.js

// Add this to handle the search button click
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value;
    loadEvents(searchTerm);
}

// Add this to clear the search
function clearFilters() {
    document.getElementById('searchInput').value = '';
    loadEvents();
}

// Update your loadEvents function to accept the parameter
async function loadEvents(searchQuery = '') {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = '<h3 style="text-align: center; grid-column: 1 / -1;">Loading events...</h3>';

    try {
        // Build the URL with the query parameter if it exists
        let endpoint = '/events';
        if (searchQuery) {
            endpoint += `?search=${encodeURIComponent(searchQuery)}`;
        }

        const events = await apiFetch(endpoint);
        
        container.innerHTML = ''; 

        if (events.length === 0) {
            container.innerHTML = '<h3 style="text-align: center; grid-column: 1 / -1;">No upcoming events found.</h3>';
            return;
        }

        // Loop through the data and create a card for each event
        events.forEach(event => {
            // Format the date to be human-readable
            const eventDate = new Date(event.eventDate).toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            // Use a fallback image if none is provided
            const imageUrl = event.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image+Available';

            const card = document.createElement('div');
            card.className = 'event-card';
            
            card.innerHTML = `
                <img src="${imageUrl}" alt="${event.title}" class="event-image">
                <div class="event-content">
                    <span class="event-category">${event.categoryName}</span>
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-details"><strong>Venue:</strong> ${event.venueName}</p>
                    <p class="event-details"><strong>Date:</strong> ${eventDate}</p>
                    <p class="event-details" style="margin-top: 10px; font-size: 0.85rem;">${event.description}</p>
                    
                    <!-- We will wire this button up when we build Module 4 (Seat Map) -->
                    <button class="btn-view-seats" onclick="viewSeats(${event.id})">View Seats</button>
                </div>
            `;
            
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading events:", error);
        container.innerHTML = `<div style="color: red; text-align: center; grid-column: 1 / -1;">Failed to load events: ${error.message}</div>`;
    }
}

// Temporary placeholder function for the next module
function viewSeats(eventId) {
    // Navigate to the seat map and pass the eventId in the URL query string
    window.location.href = `seat-map.html?eventId=${eventId}`;
}
function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = "login.html";
}

// Optional: Hide the dashboard/logout buttons if the user isn't actually logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        document.getElementById('navLinks').innerHTML = `
            <a href="login.html" style="color: white; text-decoration: none; border: 1px solid white; padding: 5px 15px; border-radius: 4px;">Login / Register</a>
        `;
    }
});