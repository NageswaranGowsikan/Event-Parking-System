const BASE_URL = 'https://localhost:7283/api'; // Ensure this matches your Swagger port

async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('jwt_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        // 1. Get the raw text first
        const rawText = await response.text();
        
        // 2. Parse it to JSON only if it is not empty
        const data = rawText ? JSON.parse(rawText) : {};

        // 3. Handle HTTP errors
        if (!response.ok) {
            throw new Error(data.message || `API request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error.message);
        throw error;
    }
}