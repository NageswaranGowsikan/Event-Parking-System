// js/seat-map.js - Dynamic 500-Seat Capacity Seat Reservation System

let selectedSeats = []; // Array of seat objects { id, label, price }
let currentEventId = null;
let allFetchedSeats = [];

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentEventId = urlParams.get('eventId');

    const grid = getGridContainer();
    if (grid) {
        // Event delegation on grid container
        grid.addEventListener('click', handleSeatClick);
    }

    if (!currentEventId) {
        // Fallback for demo testing: Generate 500 mock seats (20 Rows x 25 Cols)
        console.warn("No eventId in URL. Rendering 500-seat demo layout.");
        allFetchedSeats = generate500MockSeats();
        renderSeats(allFetchedSeats);
        return;
    }

    loadSeats(currentEventId);
    startTimerCount();
});

// Returns the grid container element (handles multiple ID aliases)
function getGridContainer() {
    return document.getElementById('seatGrid') || document.getElementById('seat-grid-container');
}

// Generates 500 mock seats (20 Rows x 25 Seats) for demo testing
function generate500MockSeats() {
    const rows = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];
    const seatsPerRow = 25;
    const mock = [];
    let idCounter = 1;

    rows.forEach((r, rIdx) => {
        let price = 50.00;
        let isVip = false;
        if (rIdx < 3) { price = 150.00; isVip = true; } // First 3 rows VIP
        else if (rIdx < 8) { price = 100.00; }        // Next 5 rows Executive

        for (let s = 1; s <= seatsPerRow; s++) {
            // Randomly mark ~15% of seats as Booked
            const isBooked = (idCounter % 7 === 0 || idCounter % 13 === 0);
            mock.push({
                id: idCounter,
                row: r,
                seatNumber: s,
                price: price,
                status: isBooked ? 'Booked' : 'Available',
                isVip: isVip
            });
            idCounter++;
        }
    });
    return mock;
}

// Fetch seats from backend API (Supports up to 500+ dynamic seats)
async function loadSeats(eventId) {
    const grid = getGridContainer();
    if (!grid) return;

    grid.innerHTML = `
        <div style="padding: 60px; text-align: center; color: var(--text-secondary); width: 100%;">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 14px;"></i>
            <h3 style="font-weight: 700; color: var(--text-primary);">Loading 500-seat Arena Layout...</h3>
        </div>
    `;

    try {
        const seats = await apiFetch(`/events/${eventId}/seats`);
        allFetchedSeats = seats;

        if (!seats || seats.length === 0) {
            grid.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--text-secondary); width: 100%;">
                    <i class="fa-solid fa-chair" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
                    <h3 style="font-weight: 700; color: var(--text-primary);">No seats generated for this event yet.</h3>
                    <p style="font-size: 0.9rem;">Admin must configure seat layout in admin panel.</p>
                </div>
            `;
            return;
        }

        renderSeats(seats);

    } catch (error) {
        console.error("Error loading seats from backend:", error);
        grid.innerHTML = `
            <div style="color: var(--accent-rose); text-align: center; padding: 40px; width: 100%;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
                <h3 style="font-weight: 700;">Backend seats offline</h3>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px;">${error.message}</p>
                <button onclick="renderSeats(generate500MockSeats())" class="btn btn-secondary">
                    <i class="fa-solid fa-eye"></i> Load 500-Seat Demo Map
                </button>
            </div>
        `;
    }
}

// Render dynamic seat grid (Supports 500+ seats, grouped by rows)
function renderSeats(seats) {
    const grid = getGridContainer();
    if (!grid) return;

    grid.innerHTML = '';

    // Group seats dynamically by Row (A, B, C, D...)
    const rowsMap = {};
    seats.forEach(seat => {
        const rowName = seat.row || 'A';
        if (!rowsMap[rowName]) rowsMap[rowName] = [];
        rowsMap[rowName].push(seat);
    });

    Object.keys(rowsMap).sort().forEach(rowName => {
        const rowSeats = rowsMap[rowName];
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';

        const leftLabel = document.createElement('div');
        leftLabel.className = 'row-label';
        leftLabel.innerText = rowName;
        rowDiv.appendChild(leftLabel);

        const seatsGroup = document.createElement('div');
        seatsGroup.className = 'row-seats-group';

        const totalSeatsInRow = rowSeats.length;
        const middleIndex = Math.floor(totalSeatsInRow / 2);

        rowSeats.forEach((seat, index) => {
            // Add center aisle gap
            if (index === middleIndex && totalSeatsInRow > 6) {
                const gap = document.createElement('div');
                gap.className = 'aisle-gap';
                seatsGroup.appendChild(gap);
            }

            const btn = document.createElement('button');
            const seatLabel = `${seat.row}${seat.seatNumber}`;
            const isOccupied = seat.status === 'Booked' || seat.status === 'Occupied';
            const isVip = seat.isVip || (seat.seatTier && seat.seatTier.toLowerCase().includes('vip')) || seat.price >= 120;
            
            const isSelected = selectedSeats.some(s => s.id === seat.id);
            let statusStr = isOccupied ? 'occupied' : (isSelected ? 'selected' : 'available');

            btn.type = 'button';
            btn.innerText = seat.seatNumber;

            // HTML5 Data Attributes
            btn.setAttribute('data-seat-id', seat.id);
            btn.setAttribute('data-price', seat.price);
            btn.setAttribute('data-status', statusStr);
            btn.setAttribute('data-label', seatLabel);

            // Styling Classes
            let stateClass = isOccupied ? 'Booked' : (isSelected ? 'Selected' : 'Available');

            btn.className = `seat ${stateClass} ${isVip && stateClass === 'Available' ? 'vip' : ''}`;
            btn.title = `${seatLabel} (${isVip ? 'VIP' : 'Standard'}) - $${seat.price.toFixed(2)}`;

            if (isOccupied) {
                btn.disabled = true;
            }

            seatsGroup.appendChild(btn);
        });

        rowDiv.appendChild(seatsGroup);

        const rightLabel = document.createElement('div');
        rightLabel.className = 'row-label';
        rightLabel.innerText = rowName;
        rowDiv.appendChild(rightLabel);

        grid.appendChild(rowDiv);
    });

    updateCartUI();
}

// Event Delegation Click Handler
function handleSeatClick(event) {
    const btn = event.target.closest('.seat');
    if (!btn) return;

    const status = btn.getAttribute('data-status');
    if (status === 'occupied') return;

    const seatId = parseInt(btn.getAttribute('data-seat-id'));
    const price = parseFloat(btn.getAttribute('data-price'));
    const label = btn.getAttribute('data-label');

    if (status === 'available') {
        btn.setAttribute('data-status', 'selected');
        btn.classList.remove('Available', 'vip');
        btn.classList.add('Selected');
        selectedSeats.push({ id: seatId, label: label, price: price });
    } else if (status === 'selected') {
        btn.setAttribute('data-status', 'available');
        btn.classList.remove('Selected');
        btn.classList.add('Available');
        
        // Re-check VIP status
        if (price >= 120) btn.classList.add('vip');

        selectedSeats = selectedSeats.filter(s => s.id !== seatId);
    }

    updateCartUI();
}

// Auto Select N Seats
function autoSelectSeats(count) {
    clearAllSelections();

    const availableBtns = Array.from(document.querySelectorAll('.seat[data-status="available"]'));
    if (availableBtns.length === 0) return alert("No available seats left!");

    const toSelect = availableBtns.slice(0, count);
    toSelect.forEach(btn => {
        const seatId = parseInt(btn.getAttribute('data-seat-id'));
        const price = parseFloat(btn.getAttribute('data-price'));
        const label = btn.getAttribute('data-label');

        btn.setAttribute('data-status', 'selected');
        btn.classList.remove('Available', 'vip');
        btn.classList.add('Selected');
        selectedSeats.push({ id: seatId, label: label, price: price });
    });

    document.querySelectorAll('.qty-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    updateCartUI();
}

function clearAllSelections() {
    selectedSeats = [];
    document.querySelectorAll('.seat[data-status="selected"]').forEach(btn => {
        const price = parseFloat(btn.getAttribute('data-price'));
        btn.setAttribute('data-status', 'available');
        btn.classList.remove('Selected');
        btn.classList.add('Available');
        if (price >= 120) btn.classList.add('vip');
    });
    document.querySelectorAll('.qty-btn').forEach(b => b.classList.remove('active'));
    updateCartUI();
}

function removeSingleSeat(seatId) {
    selectedSeats = selectedSeats.filter(s => s.id !== seatId);
    const btn = document.querySelector(`.seat[data-seat-id="${seatId}"]`);
    if (btn) {
        const price = parseFloat(btn.getAttribute('data-price'));
        btn.setAttribute('data-status', 'available');
        btn.classList.remove('Selected');
        btn.classList.add('Available');
        if (price >= 120) btn.classList.add('vip');
    }
    updateCartUI();
}

// Updates Cart & Pricing UI
function updateCartUI() {
    const labelsSpan = document.getElementById('selectedSeatLabels') || document.getElementById('selected-seat-labels');
    const priceSpan = document.getElementById('totalPrice') || document.getElementById('total-price');
    const checkoutBtn = document.getElementById('checkoutBtn') || document.getElementById('btn-confirm-booking');
    const countSpan = document.getElementById('selectedSeatCount') || document.getElementById('selected-seat-count');

    const totalCount = selectedSeats.length;
    const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

    if (countSpan) {
        countSpan.innerText = `${totalCount} Ticket${totalCount !== 1 ? 's' : ''}`;
    }

    if (priceSpan) {
        priceSpan.innerText = totalPrice.toFixed(2);
    }

    if (labelsSpan) {
        if (totalCount === 0) {
            labelsSpan.innerHTML = `<span class="empty-selection-text" style="color: var(--text-muted); font-size: 0.88rem; font-style: italic;">None</span>`;
        } else {
            labelsSpan.innerHTML = selectedSeats.map(s => `
                <span class="seat-tag-item">
                    <i class="fa-solid fa-chair" style="font-size: 0.75rem;"></i> ${s.label} ($${s.price.toFixed(2)})
                    <i class="fa-solid fa-xmark seat-tag-remove" onclick="removeSingleSeat(${s.id})" title="Remove seat"></i>
                </span>
            `).join('');
        }
    }

    if (checkoutBtn) {
        if (totalCount === 0) {
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = `<i class="fa-solid fa-arrow-right"></i> Reserve Seats & Continue`;
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = `<i class="fa-solid fa-ticket"></i> Reserve ${totalCount} Seat${totalCount !== 1 ? 's' : ''} ($${totalPrice.toFixed(2)})`;
        }
    }
}

// 10-Minute Reservation Countdown
function startTimerCount() {
    let secondsLeft = 600;
    const timerDisplay = document.getElementById('holdTimerDisplay');
    if (!timerDisplay) return;

    setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
            timerDisplay.innerText = "00:00 Expired";
            return;
        }
        const m = Math.floor(secondsLeft / 60);
        const s = secondsLeft % 60;
        timerDisplay.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    }, 1000);
}

// Submits booking to C# Backend POST /bookings
async function submitBooking() {
    if (selectedSeats.length === 0) return;

    const checkoutBtn = document.getElementById('checkoutBtn') || document.getElementById('btn-confirm-booking');
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Locking Seats...`;
    }

    const seatIds = selectedSeats.map(s => s.id);
    const targetEventId = currentEventId || 1;

    try {
        if (typeof window.apiFetch === 'function' && currentEventId) {
            const response = await apiFetch(`/bookings`, {
                method: 'POST',
                body: JSON.stringify({
                    eventId: parseInt(targetEventId),
                    seatIds: seatIds
                })
            });

            const newBookingId = response.id || response.bookingId;
            if (newBookingId) {
                window.location.href = `parking-map.html?eventId=${targetEventId}&bookingId=${newBookingId}`;
                return;
            }
        }

        // Demo / Offline Mode Fallback
        setTimeout(() => {
            alert(`Booking Created! Reserved ${selectedSeats.length} seat(s): ${selectedSeats.map(s=>s.label).join(', ')}`);
            window.location.href = `parking-map.html?eventId=${targetEventId}&bookingId=DEMO-${Date.now()}`;
        }, 800);

    } catch (error) {
        alert("Failed to create booking: " + error.message);
        updateCartUI();
    }
}