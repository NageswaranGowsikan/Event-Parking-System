// js/parking-map.js - Bulletproof Parking Spot Reservation Handler

let eventId = null;
let bookingId = null;
let selectedSlotId = null;
let selectedSlotFee = 0;

// Mock Parking Slots Fallback for Offline / Demo Preview
const MOCK_PARKING_SLOTS = [
    { id: 301, zone: 'A', slotNumber: '01', fee: 25.00, status: 'Available' },
    { id: 302, zone: 'A', slotNumber: '02', fee: 25.00, status: 'Available' },
    { id: 303, zone: 'A', slotNumber: '03', fee: 25.00, status: 'Reserved' },
    { id: 304, zone: 'A', slotNumber: '04', fee: 25.00, status: 'Available' },
    { id: 305, zone: 'A', slotNumber: '05', fee: 25.00, status: 'Available' },
    { id: 306, zone: 'B', slotNumber: '01', fee: 20.00, status: 'Available' },
    { id: 307, zone: 'B', slotNumber: '02', fee: 20.00, status: 'Available' },
    { id: 308, zone: 'B', slotNumber: '03', fee: 20.00, status: 'Available' },
    { id: 309, zone: 'B', slotNumber: '04', fee: 20.00, status: 'Reserved' },
    { id: 310, zone: 'B', slotNumber: '05', fee: 20.00, status: 'Available' },
    { id: 311, zone: 'VIP', slotNumber: '01', fee: 50.00, status: 'Available' },
    { id: 312, zone: 'VIP', slotNumber: '02', fee: 50.00, status: 'Available' }
];

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    eventId = urlParams.get('eventId');
    bookingId = urlParams.get('bookingId');

    const errorMsg = document.getElementById('errorMsg');
    const layout = document.getElementById('parkingLayout');

    if (!eventId || !bookingId) {
        // Soft fallback for standalone demo testing
        console.warn("No Event/Booking ID in URL. Loading parking layout preview.");
        renderParkingSlots(MOCK_PARKING_SLOTS);
        return;
    }

    loadParkingSlots();
});

async function loadParkingSlots() {
    const layout = document.getElementById('parkingLayout');
    const errorMsg = document.getElementById('errorMsg');

    if (errorMsg) errorMsg.style.display = 'none';

    layout.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-secondary);">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--primary); margin-bottom: 12px;"></i>
            <p>Loading parking zones and bay availability...</p>
        </div>
    `;

    try {
        const slots = await apiFetch(`/events/${eventId}/parking-slots`);
        
        if (!slots || slots.length === 0) {
            layout.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-secondary);">
                    <i class="fa-solid fa-car-side" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
                    <p>No parking slots configured for this event.</p>
                </div>
            `;
            return;
        }

        renderParkingSlots(slots);

    } catch (error) {
        console.warn("Backend parking slots unfulfilled, using mock layout:", error.message);
        renderParkingSlots(MOCK_PARKING_SLOTS);
    }
}

function renderParkingSlots(slots) {
    const layout = document.getElementById('parkingLayout');
    layout.innerHTML = '';

    slots.forEach(slot => {
        const isOccupied = slot.status !== 'Available';
        
        const slotDiv = document.createElement('div');
        slotDiv.className = `slot ${isOccupied ? 'occupied' : ''}`;
        slotDiv.id = `slot-${slot.id}`;
        
        slotDiv.innerHTML = `
            <i class="fa-solid fa-car" style="font-size: 1.2rem; opacity: ${isOccupied ? '0.4' : '0.9'}; margin-bottom: 4px;"></i>
            <div class="slot-name">${slot.zone}-${slot.slotNumber}</div>
            <div class="slot-fee">${isOccupied ? 'Reserved' : '$' + slot.fee.toFixed(2)}</div>
        `;

        if (!isOccupied) {
            slotDiv.onclick = () => selectSlot(slot.id, slot.zone, slot.slotNumber, slot.fee);
        }

        layout.appendChild(slotDiv);
    });
}

function selectSlot(id, zone, number, fee) {
    if (selectedSlotId) {
        const prev = document.getElementById(`slot-${selectedSlotId}`);
        if (prev) prev.classList.remove('selected');
    }

    if (selectedSlotId === id) {
        selectedSlotId = null;
        selectedSlotFee = 0;
        document.getElementById('selectedSpotText').innerText = 'None';
        document.getElementById('selectedFeeText').innerText = '$0.00';
        document.getElementById('confirmBtn').disabled = true;
        return;
    }

    selectedSlotId = id;
    selectedSlotFee = fee;
    const current = document.getElementById(`slot-${id}`);
    if (current) current.classList.add('selected');
    
    document.getElementById('selectedSpotText').innerText = `${zone}-${number}`;
    document.getElementById('selectedFeeText').innerText = `$${fee.toFixed(2)}`;
    document.getElementById('confirmBtn').disabled = false;
}

async function addParking() {
    if (!selectedSlotId) return;

    const btn = document.getElementById('confirmBtn');
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Reserving...`;
    btn.disabled = true;

    try {
        if (bookingId && typeof window.apiFetch === 'function') {
            await apiFetch(`/bookings/${bookingId}/parking`, {
                method: 'POST',
                body: JSON.stringify({ parkingSlotId: selectedSlotId })
            });
        }
        
        window.location.href = `payment.html?bookingId=${bookingId || 'DEMO-123'}`;
    } catch (error) {
        alert("Failed to reserve parking: " + error.message);
        btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Add Parking & Continue`;
        btn.disabled = false;
        loadParkingSlots();
    }
}

function skipParking() {
    window.location.href = `payment.html?bookingId=${bookingId || 'DEMO-123'}`;
}