let currentBookingId = null;
let timerInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentBookingId = urlParams.get('bookingId');

    if (!currentBookingId) {
        document.querySelector('.payment-container').innerHTML = '<h3 style="color: red;">Invalid session.</h3>';
        return;
    }

    try {
        // Fetch the hold status from the backend
        const statusData = await apiFetch(`/bookings/${currentBookingId}/hold-status`);
        
        document.getElementById('bookingRef').innerText = statusData.bookingNumber;

        if (statusData.status !== "Pending" || statusData.remainingSeconds <= 0) {
            handleExpired();
        } else {
            startCountdown(statusData.remainingSeconds);
        }
    } catch (error) {
        alert("Error loading booking details: " + error.message);
    }
});

function startCountdown(totalSeconds) {
    let remaining = Math.floor(totalSeconds);
    const display = document.getElementById('countdownDisplay');

    timerInterval = setInterval(() => {
        remaining--;

        if (remaining <= 0) {
            clearInterval(timerInterval);
            handleExpired();
            return;
        }

        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        display.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
}

function handleExpired() {
    const box = document.getElementById('timerBox');
    box.className = 'timer-box timer-expired';
    box.innerHTML = 'Hold period expired. Your seats have been released.';
    
    document.getElementById('payBtn').disabled = true;
    document.getElementById('payBtn').innerText = 'Booking Expired';
}

async function submitPayment() {
    try {
        // Hit the NEW Module 7 Payment Endpoint
        const response = await apiFetch(`/bookings/${currentBookingId}/payment`, {
            method: 'POST'
        });
        
        clearInterval(timerInterval); // Stop the expiration timer
        
        // Show the success message and receipt number
        alert(`${response.message}\nReceipt Number: ${response.receiptNumber}`);
        
        // Optionally, you can redirect them to a receipt page or their dashboard
        window.location.href = "events.html"; 
    } catch (error) {
        alert("Payment failed: " + error.message);
    }
}

async function cancelBooking() {
    if (!confirm("Are you sure you want to cancel and release your tickets?")) return;
    
    try {
        await apiFetch(`/bookings/${currentBookingId}`, { method: 'DELETE' });
        alert("Booking cancelled.");
        window.location.href = "events.html";
    } catch (error) {
        alert("Failed to cancel: " + error.message);
    }
}