let eventId = null;
let bookingId = null;
let selectedSlotId = null;
let selectedSlotFee = 0;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Grab IDs from the URL
    const urlParams = new URLSearchParams(window.location.search);
    eventId = urlParams.get('eventId');
    bookingId = urlParams.get('bookingId'); // MUST be passed from the seat map page!

    const errorMsg = document.getElementById('errorMsg');
    const layout = document.getElementById('parkingLayout');

    if (!eventId || !bookingId) {
        errorMsg.style.display = 'block';
        errorMsg.innerText = "Invalid booking session. Missing Event ID or Booking ID.";
        return;
    }

    loadParkingSlots();
});

async function loadParkingSlots() {
    const layout = document.getElementById('parkingLayout');
    layout.innerHTML = '<p>Loading parking layout...</p>';

    try {
        const slots = await apiFetch(`/events/${eventId}/parking-slots`);
        
        if (slots.length === 0) {
            layout.innerHTML = '<p>No parking is available for this event.</p>';
            return;
        }

        layout.innerHTML = '';
        
        // Render visual layout
        slots.forEach(slot => {
            const isOccupied = slot.status !== 'Available';
            
            const slotDiv = document.createElement('div');
            // BRD: Prevent occupied slots from being selected
            slotDiv.className = `slot ${isOccupied ? 'occupied' : ''}`;
            slotDiv.id = `slot-${slot.id}`;
            
            slotDiv.innerHTML = `
                <div class="slot-name">${slot.zone}-${slot.slotNumber}</div>
                <div class="slot-fee">${isOccupied ? 'Reserved' : '$' + slot.fee.toFixed(2)}</div>
            `;

            if (!isOccupied) {
                slotDiv.onclick = () => selectSlot(slot.id, slot.zone, slot.slotNumber, slot.fee);
            }

            layout.appendChild(slotDiv);
        });

    } catch (error) {
        layout.innerHTML = `<p style="color:red;">Failed to load parking: ${error.message}</p>`;
    }
}

// BRD: Select at most one available parking slot
function selectSlot(id, zone, number, fee) {
    // Deselect previous
    if (selectedSlotId) {
        document.getElementById(`slot-${selectedSlotId}`).classList.remove('selected');
    }

    // If clicking the same slot, just deselect it
    if (selectedSlotId === id) {
        selectedSlotId = null;
        selectedSlotFee = 0;
        document.getElementById('selectedSpotText').innerText = 'None';
        document.getElementById('selectedFeeText').innerText = '$0.00';
        document.getElementById('confirmBtn').disabled = true;
        return;
    }

    // Select new
    selectedSlotId = id;
    selectedSlotFee = fee;
    document.getElementById(`slot-${id}`).classList.add('selected');
    
    // Update UI Summary
    document.getElementById('selectedSpotText').innerText = `${zone}-${number}`;
    document.getElementById('selectedFeeText').innerText = `$${fee.toFixed(2)}`;
    document.getElementById('confirmBtn').disabled = false;
}

// Submits the selected parking to the C# Backend
async function addParking() {
    if (!selectedSlotId || !bookingId) return;

    const btn = document.getElementById('confirmBtn');
    btn.innerText = "Reserving...";
    btn.disabled = true;

    try {
        await apiFetch(`/bookings/${bookingId}/parking`, {
            method: 'POST',
            body: JSON.stringify({ parkingSlotId: selectedSlotId })
        });
        
        // Success! Move to payment module.
        window.location.href = `payment.html?bookingId=${bookingId}`;
    } catch (error) {
        alert("Failed to reserve parking: " + error.message);
        btn.innerText = "Add Parking & Finish";
        btn.disabled = false;
        loadParkingSlots(); // Refresh in case someone just took it!
    }
}

// BRD: Allow booking to complete without parking
function skipParking() {
    window.location.href = `payment.html?bookingId=${bookingId}`;
}