async function login(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Save the token
        localStorage.setItem('jwtToken', response.token);
        
        // Decode the JWT token to find the user's role
        const payload = JSON.parse(atob(response.token.split('.')[1]));
        const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        alert("Login successful!");

        // Smart Redirect based on Role
        if (role === "Admin") {
            window.location.href = "admin-dashboard.html";
        } else {
            window.location.href = "events.html"; // Or customer-dashboard.html
        }
        
    } catch (error) {
        alert("Login failed: " + error.message);
    }
}