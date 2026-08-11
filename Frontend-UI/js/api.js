// js/api.js - Bulletproof Centralized API Client & JWT Session Helper

const BASE_URL = window.API_BASE_URL || localStorage.getItem('api_base_url') || 'https://localhost:7283/api';

async function apiFetch(endpoint, options = {}) {
    // Check both token key variations for 100% backward compatibility
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('jwt_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Normalize endpoint slash
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${BASE_URL}${formattedEndpoint}`;

    try {
        const response = await fetch(fullUrl, {
            ...options,
            headers
        });

        // 1. Get raw text
        const rawText = await response.text();
        
        // 2. Parse JSON safely if content exists
        let data = {};
        if (rawText) {
            try {
                data = JSON.parse(rawText);
            } catch (parseErr) {
                data = { message: rawText };
            }
        }

        // 3. Handle HTTP status errors
        if (!response.ok) {
            const errorMsg = data.message || data.title || `API request failed with status ${response.status}`;
            throw new Error(errorMsg);
        }

        return data;
    } catch (error) {
        console.error(`API Error [${formattedEndpoint}]:`, error.message);
        throw error;
    }
}

// Global Helper to safely parse user claims from stored JWT Token
function getUserFromToken() {
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('jwt_token');
    if (!token) return null;

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(atob(parts[1]));
        const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role || payload["role"];
        const userId = payload.sub || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.nameid;
        const email = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];

        return { role, userId, email, raw: payload };
    } catch (e) {
        console.warn("Failed to decode JWT token:", e);
        return null;
    }
}

// Global Logout Helper
function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('customer_id');
    window.location.href = "login.html";
}