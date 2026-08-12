document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert("Please log in to view your dashboard.");
        window.location.href = "login.html";
        return;
    }

    loadMyBookings();
    loadMyPayments();
});

async function loadMyBookings() {
    const container = document.getElementById('bookingsContainer');
    try {
        const bookings = await apiFetch('/bookings/my-bookings');
        
        if (bookings.length === 0) {
            container.innerHTML = '<p>You have no active or past bookings.</p>';
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Booking Ref</th>
                        <th>Event</th>
                        <th>Seats</th>
                        <th>Parking</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        bookings.forEach(b => {
            const date = new Date(b.eventDate).toLocaleDateString();
            const isCancellable = (b.status === 'Confirmed' || b.status === 'Pending');
            
            html += `
                <tr>
                    <td><strong>${b.bookingNumber}</strong></td>
                    <td>${b.eventName}<br><small>${date}</small></td>
                    <td>${b.seatNumbers.join(', ')}</td>
                    <td>${b.parkingDetails}</td>
                    <td>$${b.totalPrice.toFixed(2)}</td>
                    <td><span class="status-badge status-${b.status}">${b.status}</span></td>
                    <td>
                        ${isCancellable ? `<button class="btn-cancel" onclick="cancelBooking(${b.id})">Cancel</button>` : '-'}
                        ${b.status === 'Pending' ? `<br><button class="btn-receipt" style="margin-top:5px; background:#28a745;" onclick="window.location.href='payment.html?bookingId=${b.id}'">Pay Now</button>` : ''}
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = `<span style="color: red;">Failed to load bookings: ${error.message}</span>`;
    }
}

async function loadMyPayments() {
    const container = document.getElementById('paymentsContainer');
    try {
        const payments = await apiFetch('/payments/customer');
        
        if (payments.length === 0) {
            container.innerHTML = '<p>No payment history found.</p>';
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Receipt No.</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        payments.forEach(p => {
            const date = new Date(p.paymentDate).toLocaleString();
            html += `
                <tr>
                    <td><strong>${p.receiptNumber}</strong></td>
                    <td>${date}</td>
                    <td>$${p.amount.toFixed(2)}</td>
                    <td><button class="btn-receipt" onclick="downloadReceipt(${p.paymentId})">View Receipt</button></td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = `<span style="color: red;">Failed to load payments: ${error.message}</span>`;
    }
}

async function cancelBooking(bookingId) {
    if (!confirm("Are you sure you want to cancel this booking? This will release your seats and parking.")) return;

    try {
        await apiFetch(`/bookings/${bookingId}`, { method: 'DELETE' });
        alert("Booking cancelled successfully.");
        loadMyBookings(); // Refresh the list
    } catch (error) {
        alert("Failed to cancel booking: " + error.message);
    }
}

async function downloadReceipt(paymentId) {
    try {
        const receipt = await apiFetch(`/payments/${paymentId}/receipt`);
        // Simple alert to simulate viewing a receipt. In a real app, you would render a PDF or a printable modal.
        alert(`
            --- RECEIPT ---
            Receipt No: ${receipt.receiptNumber}
            Event: ${receipt.eventName}
            Booking Ref: ${receipt.bookingReference}
            Amount Paid: $${receipt.totalAmountPaid.toFixed(2)}
            Date: ${new Date(receipt.paymentDate).toLocaleString()}
        `);
    } catch (error) {
        alert("Failed to load receipt: " + error.message);
    }
}

function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = "login.html";
}