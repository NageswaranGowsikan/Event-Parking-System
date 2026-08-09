import {
    api,
    ApiError
} from "./api.js";

const queryParameters =
    new URLSearchParams(window.location.search);

const bookingId =
    Number(queryParameters.get("bookingId"));

const elements = {
    alertContainer:
        document.getElementById("alertContainer"),

    loadingState:
        document.getElementById("loadingState"),

    paymentContent:
        document.getElementById("paymentContent"),

    bookingId:
        document.getElementById("bookingId"),

    bookingReference:
        document.getElementById("bookingReference"),

    bookingStatus:
        document.getElementById("bookingStatus"),

    paymentStatus:
        document.getElementById("paymentStatus"),

    amountDue:
        document.getElementById("amountDue"),

    paymentMethod:
        document.getElementById("paymentMethod"),

    paymentMethodError:
        document.getElementById("paymentMethodError"),

    payButton:
        document.getElementById("payButton"),

    receiptButton:
        document.getElementById("receiptButton")
};

document.addEventListener(
    "DOMContentLoaded",
    initializePaymentPage
);

async function initializePaymentPage() {
    elements.payButton.addEventListener(
        "click",
        handlePayment
    );

    elements.paymentMethod.addEventListener(
        "change",
        clearPaymentMethodError
    );

    if (
        !Number.isInteger(bookingId) ||
        bookingId <= 0
    ) {
        hideLoading();

        showAlert(
            "A valid booking ID is required. Open this page using payment.html?bookingId=1.",
            "error"
        );

        return;
    }

    await loadPaymentInformation();
}

async function loadPaymentInformation() {
    showLoading();

    try {
        const payment = await api.get(
            `/bookings/${bookingId}/payment`
        );

        displayPaymentInformation(payment);
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

function displayPaymentInformation(payment) {
    elements.bookingId.textContent =
        payment.bookingId;

    elements.bookingReference.textContent =
        payment.bookingReference;

    elements.paymentStatus.textContent =
        payment.paymentStatus;

    elements.amountDue.textContent =
        formatCurrency(payment.amountDue);

    setStatusBadge(
        elements.bookingStatus,
        payment.bookingStatus
    );

    const paymentCompleted =
        payment.paymentStatus
            .toLowerCase() === "completed";

    const bookingPending =
        payment.bookingStatus
            .toLowerCase() === "pending";

    if (paymentCompleted) {
        disablePaymentForm();

        showAlert(
            "This booking has already been paid.",
            "success"
        );

        return;
    }

    if (!bookingPending) {
        disablePaymentForm();

        showAlert(
            `A booking with status '${payment.bookingStatus}' cannot be paid.`,
            "warning"
        );
    }
}

async function handlePayment() {
    clearAlert();

    const paymentMethod =
        elements.paymentMethod.value;

    if (!paymentMethod) {
        elements.paymentMethodError
            .classList.remove("hidden");

        elements.paymentMethod.focus();

        return;
    }

    const confirmed = window.confirm(
        `Confirm ${paymentMethod} payment for ${elements.amountDue.textContent}?`
    );

    if (!confirmed) {
        return;
    }

    setPaymentButtonLoading(true);

    try {
        const result = await api.post(
            `/bookings/${bookingId}/payment`,
            {
                paymentMethod
            }
        );

        elements.paymentStatus.textContent =
            result.paymentStatus;

        setStatusBadge(
            elements.bookingStatus,
            "Confirmed"
        );

        disablePaymentForm();

        elements.receiptButton.href =
            `receipt.html?paymentId=${result.id}`;

        elements.receiptButton
            .classList.remove("hidden");

        showAlert(
            `Payment completed successfully. Transaction ID: ${result.transactionId}`,
            "success"
        );
    } catch (error) {
        handleApiError(error);
    } finally {
        setPaymentButtonLoading(false);
    }
}

function disablePaymentForm() {
    elements.paymentMethod.disabled = true;
    elements.payButton.disabled = true;
}

function setPaymentButtonLoading(isLoading) {
    elements.payButton.disabled = isLoading;

    elements.payButton.textContent = isLoading
        ? "Processing Payment..."
        : "Complete Payment";
}

function setStatusBadge(element, status) {
    const normalizedStatus =
        status.toLowerCase();

    element.textContent = status;

    element.className =
        `badge badge-${normalizedStatus}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat(
        "en-LK",
        {
            style: "currency",
            currency: "LKR",
            minimumFractionDigits: 2
        }
    ).format(amount);
}

function showLoading() {
    elements.loadingState
        .classList.remove("hidden");

    elements.paymentContent
        .classList.add("hidden");
}

function hideLoading() {
    elements.loadingState
        .classList.add("hidden");

    elements.paymentContent
        .classList.remove("hidden");
}

function clearPaymentMethodError() {
    elements.paymentMethodError
        .classList.add("hidden");
}

function showAlert(message, type) {
    elements.alertContainer.innerHTML = "";

    const alert = document.createElement("div");

    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    elements.alertContainer.appendChild(alert);
}

function clearAlert() {
    elements.alertContainer.innerHTML = "";
}

function handleApiError(error) {
    const message =
        error instanceof ApiError
            ? error.message
            : "An unexpected error occurred.";

    showAlert(message, "error");
}