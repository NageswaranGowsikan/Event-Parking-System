document.addEventListener('DOMContentLoaded', () => {
    // Basic protection to ensure only logged-in users try to load this
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert("Unauthorized. Please log in.");
        window.location.href = "login.html";
        return;
    }

    loadDashboardMetrics();
});

async function loadDashboardMetrics() {
    try {
        const metrics = await apiFetch('/dashboard/metrics');

        // Hide loading message and show the grid
        document.getElementById('loadingMessage').style.display = 'none';
        document.getElementById('metricsGrid').style.display = 'grid';

        // Populate the data
        document.getElementById('metricRevenue').innerText = metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('metricEvents').innerText = metrics.totalEvents.toLocaleString();
        document.getElementById('metricBookings').innerText = metrics.totalBookings.toLocaleString();
        document.getElementById('metricSeats').innerText = metrics.availableSeats.toLocaleString();
        document.getElementById('metricParking').innerText = metrics.occupiedParkingSlots.toLocaleString();
        document.getElementById('metricCustomers').innerText = metrics.totalCustomers.toLocaleString();

    } catch (error) {
        document.getElementById('loadingMessage').innerHTML = `<span style="color: red;">Failed to load metrics. Ensure you have Admin privileges. (${error.message})</span>`;
    }
}

function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = "login.html";
}