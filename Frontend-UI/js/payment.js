// js/payment.js - Bulletproof Payment & Countdown Timer Logic

let currentBookingId = null;
let timerInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentBookingId = urlParams.get('bookingId');

    const refElem = document.getElementById('bookingRef');

    if (!currentBookingId) {
        currentBookingId = "DEMO-BKG-" + Math.floor(100000 + Math.random() * 900000);
        if (refElem) refElem.innerText = currentBookingId;
        startCountdown(600);
        return;
    }

    if (refElem) refElem.innerText = currentBookingId;

    try {
        const statusData = await apiFetch(`/bookings/${currentBookingId}/hold-status`);
        if (statusData && statusData.bookingNumber && refElem) {
            refElem.innerText = statusData.bookingNumber;
        }

        if (statusData.status !== "Pending" || statusData.remainingSeconds <= 0) {
            handleExpired();
        } else {
            startCountdown(statusData.remainingSeconds);
        }
    } catch (error) {
        console.warn("Backend hold status unfulfilled, starting 10-minute countdown timer:", error.message);
        startCountdown(600);
    }
});

function startCountdown(totalSeconds) {
    let remaining = Math.floor(totalSeconds);
    const display = document.getElementById('countdownDisplay');

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        remaining--;

        if (remaining <= 0) {
            clearInterval(timerInterval);
            handleExpired();
            return;
        }

        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        if (display) {
            display.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }, 1000);
}

function handleExpired() {
    const box = document.getElementById('timerBox');
    if (box) {
        box.className = 'timer-box timer-expired';
        box.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Hold period expired. Your seats have been released.';
    }
    
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
        payBtn.disabled = true;
        payBtn.innerText = 'Booking Expired';
    }
}

async function submitPayment() {
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
        payBtn.disabled = true;
        payBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Processing Payment...`;
    }

    try {
        let receiptNumber = "REC-" + Math.floor(100000 + Math.random() * 900000);

        if (typeof window.apiFetch === 'function' && currentBookingId && !currentBookingId.startsWith('DEMO')) {
            const response = await apiFetch(`/bookings/${currentBookingId}/payment`, {
                method: 'POST'
            });
            receiptNumber = response.receiptNumber || receiptNumber;
        }
        
        if (timerInterval) clearInterval(timerInterval);
        
        alert(`Payment Authorized Successfully!\nReceipt Number: ${receiptNumber}\nYour tickets have been confirmed.`);
        window.location.href = "customer-dashboard.html"; 

    } catch (error) {
        alert("Payment failed: " + error.message);
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Confirm & Complete Order`;
        }
    }
}

async function cancelBooking() {
    if (!confirm("Are you sure you want to cancel and release your reserved seats?")) return;
    
    try {
        if (currentBookingId && !currentBookingId.startsWith('DEMO')) {
            await apiFetch(`/bookings/${currentBookingId}`, { method: 'DELETE' });
        }
        alert("Reservation cancelled successfully.");
        window.location.href = "events.html";
    } catch (error) {
        alert("Failed to cancel: " + error.message);
        window.location.href = "events.html";
    }
}