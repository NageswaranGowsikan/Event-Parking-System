import {
    api,
    ApiError
} from "./api.js";

const queryParameters =
    new URLSearchParams(window.location.search);

const customerId =
    Number(queryParameters.get("customerId"));

const elements = {
    alertContainer:
        document.getElementById("alertContainer"),

    loadingState:
        document.getElementById("loadingState"),

    dashboardContent:
        document.getElementById("dashboardContent"),

    upcomingBookingCount:
        document.getElementById("upcomingBookingCount"),

    reservedParkingCount:
        document.getElementById("reservedParkingCount"),

    recentPaymentCount:
        document.getElementById("recentPaymentCount"),

    unreadNotificationCount:
        document.getElementById("unreadNotificationCount"),

    upcomingBookingsBody:
        document.getElementById("upcomingBookingsBody"),

    reservedParkingBody:
        document.getElementById("reservedParkingBody"),

    recentPaymentsBody:
        document.getElementById("recentPaymentsBody"),

    notificationMessage:
        document.getElementById("notificationMessage")
};

document.addEventListener(
    "DOMContentLoaded",
    initializeCustomerDashboard
);

async function initializeCustomerDashboard() {
    if (
        !Number.isInteger(customerId) ||
        customerId <= 0
    ) {
        hideLoading();

        showAlert(
            "A valid customer ID is required. Open this page using customer-dashboard.html?customerId=1.",
            "error"
        );

        return;
    }

    await loadCustomerDashboard();
}

async function loadCustomerDashboard() {
    showLoading();

    try {
        const dashboard = await api.get(
            `/dashboard/customer/${customerId}`
        );

        displayDashboard(dashboard);
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

function displayDashboard(dashboard) {
    const upcomingBookings =
        dashboard.upcomingBookings || [];

    const reservedParking =
        dashboard.reservedParking || [];

    const recentPayments =
        dashboard.recentPayments || [];

    const unreadNotifications =
        dashboard.unreadNotificationCount || 0;

    elements.upcomingBookingCount.textContent =
        upcomingBookings.length;

    elements.reservedParkingCount.textContent =
        reservedParking.length;

    elements.recentPaymentCount.textContent =
        recentPayments.length;

    elements.unreadNotificationCount.textContent =
        unreadNotifications;

    elements.notificationMessage.textContent =
        unreadNotifications > 0
            ? `You have ${unreadNotifications} unread notification(s).`
            : "You have no unread notifications.";

    renderUpcomingBookings(upcomingBookings);
    renderReservedParking(reservedParking);
    renderRecentPayments(recentPayments);

    elements.dashboardContent
        .classList.remove("hidden");
}

function renderUpcomingBookings(bookings) {
    clearTable(elements.upcomingBookingsBody);

    if (bookings.length === 0) {
        renderEmptyRow(
            elements.upcomingBookingsBody,
            4,
            "No upcoming bookings found."
        );

        return;
    }

    bookings.forEach((booking) => {
        const row = document.createElement("tr");

        row.appendChild(
            createTextCell(booking.bookingReference)
        );

        row.appendChild(
            createTextCell(booking.eventName)
        );

        row.appendChild(
            createTextCell(formatDate(booking.eventDate))
        );

        row.appendChild(
            createStatusCell(booking.bookingStatus)
        );

        elements.upcomingBookingsBody.appendChild(row);
    });
}

function renderReservedParking(parkingItems) {
    clearTable(elements.reservedParkingBody);

    if (parkingItems.length === 0) {
        renderEmptyRow(
            elements.reservedParkingBody,
            4,
            "No reserved parking found."
        );

        return;
    }

    parkingItems.forEach((parking) => {
        const row = document.createElement("tr");

        row.appendChild(
            createTextCell(parking.bookingReference)
        );

        row.appendChild(
            createTextCell(parking.eventName)
        );

        row.appendChild(
            createTextCell(parking.parkingSlotNumber)
        );

        row.appendChild(
            createTextCell(
                formatCurrency(parking.parkingFee)
            )
        );

        elements.reservedParkingBody.appendChild(row);
    });
}

function renderRecentPayments(payments) {
    clearTable(elements.recentPaymentsBody);

    if (payments.length === 0) {
        renderEmptyRow(
            elements.recentPaymentsBody,
            5,
            "No recent payments found."
        );

        return;
    }

    payments.forEach((payment) => {
        const row = document.createElement("tr");

        row.appendChild(
            createTextCell(payment.bookingReference)
        );

        row.appendChild(
            createTextCell(
                formatCurrency(payment.amount)
            )
        );

        row.appendChild(
            createTextCell(payment.paymentMethod)
        );

        row.appendChild(
            createStatusCell(payment.paymentStatus)
        );

        row.appendChild(
            createTextCell(
                formatDate(payment.paymentDate)
            )
        );

        elements.recentPaymentsBody.appendChild(row);
    });
}

function createTextCell(value) {
    const cell = document.createElement("td");

    cell.textContent =
        value ?? "-";

    return cell;
}

function createStatusCell(status) {
    const cell = document.createElement("td");
    const badge = document.createElement("span");

    const normalizedStatus =
        String(status || "Unknown").toLowerCase();

    badge.className =
        `badge badge-${normalizedStatus}`;

    badge.textContent =
        status || "Unknown";

    cell.appendChild(badge);

    return cell;
}

function renderEmptyRow(
    tableBody,
    columnCount,
    message
) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = columnCount;
    cell.textContent = message;
    cell.className = "text-center text-muted";

    row.appendChild(cell);
    tableBody.appendChild(row);
}

function clearTable(tableBody) {
    tableBody.innerHTML = "";
}

function formatCurrency(amount) {
    return new Intl.NumberFormat(
        "en-LK",
        {
            style: "currency",
            currency: "LKR",
            minimumFractionDigits: 2
        }
    ).format(amount || 0);
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "-";
    }

    return new Intl.DateTimeFormat(
        "en-LK",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(new Date(dateValue));
}

function showLoading() {
    elements.loadingState
        .classList.remove("hidden");

    elements.dashboardContent
        .classList.add("hidden");
}

function hideLoading() {
    elements.loadingState
        .classList.add("hidden");
}

function showAlert(message, type) {
    elements.alertContainer.innerHTML = "";

    const alert = document.createElement("div");

    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    elements.alertContainer.appendChild(alert);
}

function handleApiError(error) {
    const message =
        error instanceof ApiError
            ? error.message
            : "An unexpected error occurred.";

    showAlert(message, "error");
}