import {
    api,
    ApiError
} from "./api.js";

const queryParameters =
    new URLSearchParams(window.location.search);

const paymentId =
    Number(queryParameters.get("paymentId"));

const elements = {
    alertContainer:
        document.getElementById("alertContainer"),

    loadingState:
        document.getElementById("loadingState"),

    receiptContent:
        document.getElementById("receiptContent"),

    printButton:
        document.getElementById("printButton"),

    receiptNumber:
        document.getElementById("receiptNumber"),

    paymentId:
        document.getElementById("paymentId"),

    bookingId:
        document.getElementById("bookingId"),

    bookingReference:
        document.getElementById("bookingReference"),

    customerName:
        document.getElementById("customerName"),

    customerEmail:
        document.getElementById("customerEmail"),

    paymentMethod:
        document.getElementById("paymentMethod"),

    transactionId:
        document.getElementById("transactionId"),

    paymentDate:
        document.getElementById("paymentDate"),

    paymentStatus:
        document.getElementById("paymentStatus"),

    amount:
        document.getElementById("amount")
};

document.addEventListener(
    "DOMContentLoaded",
    initializeReceiptPage
);

async function initializeReceiptPage() {
    elements.printButton.addEventListener(
        "click",
        printReceipt
    );

    if (
        !Number.isInteger(paymentId) ||
        paymentId <= 0
    ) {
        hideLoading();

        showAlert(
            "A valid payment ID is required. Open this page using receipt.html?paymentId=1.",
            "error"
        );

        return;
    }

    await loadReceipt();
}

async function loadReceipt() {
    showLoading();

    try {
        const receipt = await api.get(
            `/payments/${paymentId}/receipt`
        );

        displayReceipt(receipt);
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoading();
    }
}

function displayReceipt(receipt) {
    elements.receiptNumber.textContent =
        receipt.receiptNumber;

    elements.paymentId.textContent =
        receipt.paymentId;

    elements.bookingId.textContent =
        receipt.bookingId;

    elements.bookingReference.textContent =
        receipt.bookingReference;

    elements.customerName.textContent =
        receipt.customerName;

    elements.customerEmail.textContent =
        receipt.customerEmail;

    elements.paymentMethod.textContent =
        receipt.paymentMethod;

    elements.transactionId.textContent =
        receipt.transactionId;

    elements.paymentDate.textContent =
        formatDate(receipt.paymentDate);

    elements.paymentStatus.textContent =
        receipt.paymentStatus;

    elements.paymentStatus.className =
        `badge badge-${receipt.paymentStatus.toLowerCase()}`;

    elements.amount.textContent =
        formatCurrency(receipt.amount);

    elements.receiptContent
        .classList.remove("hidden");

    elements.printButton
        .classList.remove("hidden");
}

function printReceipt() {
    window.print();
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

function formatDate(dateValue) {
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

    elements.receiptContent
        .classList.add("hidden");

    elements.printButton
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