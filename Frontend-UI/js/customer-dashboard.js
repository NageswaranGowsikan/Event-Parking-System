// js/customer-dashboard.js - Bulletproof Customer Dashboard Handler

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    loadMyBookings();
    loadMyPayments();
});

async function loadMyBookings() {
    const container = document.getElementById('bookingsContainer');
    if (!container) return;

    try {
        const bookings = await apiFetch('/bookings/my-bookings');
        
        if (!bookings || bookings.length === 0) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
                    <i class="fa-regular fa-calendar-xmark" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
                    <p>You have no active or past event bookings yet.</p>
                    <a href="events.html" class="btn btn-primary" style="margin-top: 12px;">Browse Events</a>
                </div>
            `;
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Booking Ref</th>
                        <th>Event</th>
                        <th>Seats</th>
                        <th>Parking Spot</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        bookings.forEach(b => {
            const date = new Date(b.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            const isCancellable = (b.status === 'Confirmed' || b.status === 'Pending');
            const seatsList = Array.isArray(b.seatNumbers) ? b.seatNumbers.join(', ') : (b.seatNumbers || 'Standard');
            
            let statusBadge = `<span class="badge badge-success">${b.status}</span>`;
            if (b.status === 'Pending') statusBadge = `<span class="badge badge-vip">Hold Pending</span>`;
            if (b.status === 'Cancelled') statusBadge = `<span class="badge badge-danger">Cancelled</span>`;

            html += `
                <tr>
                    <td><strong style="font-family: monospace; color: var(--accent-cyan);">${b.bookingNumber}</strong></td>
                    <td><strong style="color: var(--text-primary);">${b.eventName}</strong><br><small style="color: var(--text-secondary);">${date}</small></td>
                    <td>${seatsList}</td>
                    <td>${b.parkingDetails || 'None'}</td>
                    <td><strong style="color: var(--accent-emerald);">$${(b.totalPrice || 0).toFixed(2)}</strong></td>
                    <td>${statusBadge}</td>
                    <td>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${isCancellable ? `<button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.78rem;" onclick="cancelBooking(${b.id})">Cancel</button>` : '-'}
                            ${b.status === 'Pending' ? `<button class="btn btn-accent-cyan" style="padding: 4px 10px; font-size: 0.78rem;" onclick="window.location.href='payment.html?bookingId=${b.id}'">Pay Now</button>` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = `
            <div style="padding: 30px; text-align: center; color: var(--accent-rose);">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 8px;"></i>
                <p>Failed to load bookings: ${error.message}</p>
            </div>
        `;
    }
}

async function loadMyPayments() {
    const container = document.getElementById('paymentsContainer');
    if (!container) return;

    try {
        const payments = await apiFetch('/payments/customer');
        
        if (!payments || payments.length === 0) {
            container.innerHTML = `
                <div style="padding: 30px; text-align: center; color: var(--text-secondary);">
                    <p>No payment receipts found.</p>
                </div>
            `;
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Receipt No.</th>
                        <th>Payment Date</th>
                        <th>Amount Paid</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        payments.forEach(p => {
            const date = new Date(p.paymentDate).toLocaleString();
            html += `
                <tr>
                    <td><strong style="font-family: monospace; color: var(--accent-cyan);">${p.receiptNumber}</strong></td>
                    <td>${date}</td>
                    <td><strong style="color: var(--accent-emerald);">$${(p.amount || 0).toFixed(2)}</strong></td>
                    <td><button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.78rem;" onclick="downloadReceipt(${p.paymentId})"><i class="fa-solid fa-receipt"></i> View Receipt</button></td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--accent-rose);">
                <p>Failed to load payment history: ${error.message}</p>
            </div>
        `;
    }
}

async function cancelBooking(bookingId) {
    if (!confirm("Are you sure you want to cancel this booking? This will release your seats and parking.")) return;

    try {
        await apiFetch(`/bookings/${bookingId}`, { method: 'DELETE' });
        alert("Booking cancelled successfully.");
        loadMyBookings();
    } catch (error) {
        alert("Failed to cancel booking: " + error.message);
    }
}

async function downloadReceipt(paymentId) {
    try {
        const receipt = await apiFetch(`/payments/${paymentId}/receipt`);
        alert(`
--- DIGITAL RECEIPT ---
Receipt #: ${receipt.receiptNumber}
Event: ${receipt.eventName}
Booking Reference: ${receipt.bookingReference}
Total Amount Paid: $${(receipt.totalAmountPaid || 0).toFixed(2)}
Payment Date: ${new Date(receipt.paymentDate).toLocaleString()}
Status: COMPLETED & VERIFIED
        `);
    } catch (error) {
        alert("Failed to load receipt: " + error.message);
    }
}