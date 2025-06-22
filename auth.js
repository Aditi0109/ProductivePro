// Google Authentication System
// Handles user login, registration, and session management

let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeGoogleAuth();
    checkExistingAuth();
    setupAuthEventListeners();
});

async function initializeGoogleAuth() {
    try {
        // Fetch configuration from server
        const configResponse = await fetch('/api/config');
        const config = await configResponse.json();
        
        if (!config.authConfigured) {
            showGoogleLoginPrompt();
            return;
        }
        
        // Initialize Google Identity Services with dynamic client ID
        google.accounts.id.initialize({
            client_id: config.googleClientId,
            callback: handleGoogleResponse,
            auto_select: true
        });
    } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
        showGoogleLoginPrompt();
    }
}

async function checkExistingAuth() {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            showUserInterface(user);
        } else {
            showLoginInterface();
        }
    } catch (error) {
        console.log('No existing authentication found');
        showLoginInterface();
    }
}

function setupAuthEventListeners() {
    // Desktop login button
    const loginBtn = document.getElementById('google-login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', showGoogleLoginPrompt);
    }
    
    // Mobile login button
    const mobileLoginBtn = document.getElementById('mobile-google-login-btn');
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', showGoogleLoginPrompt);
    }
    
    // Desktop logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Mobile logout button
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', handleLogout);
    }
}

function showGoogleLoginPrompt() {
    google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to popup if prompt is not displayed
            google.accounts.id.renderButton(
                document.getElementById('google-login-btn'),
                { theme: 'outline', size: 'large', width: 250 }
            );
        }
    });
}

async function handleGoogleResponse(response) {
    try {
        // Send the ID token to our backend for verification
        const authResponse = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                credential: response.credential
            })
        });
        
        if (authResponse.ok) {
            const user = await authResponse.json();
            currentUser = user;
            showUserInterface(user);
            showNotification('Welcome to ProductivePro!', 'success');
        } else {
            const error = await authResponse.json();
            showNotification('Login failed: ' + error.message, 'error');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        showNotification('Authentication failed. Please try again.', 'error');
    }
}

function showLoginInterface() {
    // Show login buttons
    const loginBtn = document.getElementById('google-login-btn');
    const mobileLoginBtn = document.getElementById('mobile-google-login-btn');
    
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (mobileLoginBtn) mobileLoginBtn.classList.remove('hidden');
    
    // Hide user info
    const userInfo = document.getElementById('user-info');
    const mobileUserInfo = document.getElementById('mobile-user-info');
    
    if (userInfo) userInfo.classList.add('hidden');
    if (mobileUserInfo) mobileUserInfo.classList.add('hidden');
}

function showUserInterface(user) {
    // Hide login buttons
    const loginBtn = document.getElementById('google-login-btn');
    const mobileLoginBtn = document.getElementById('mobile-google-login-btn');
    
    if (loginBtn) loginBtn.classList.add('hidden');
    if (mobileLoginBtn) mobileLoginBtn.classList.add('hidden');
    
    // Show user info
    const userInfo = document.getElementById('user-info');
    const mobileUserInfo = document.getElementById('mobile-user-info');
    
    if (userInfo) {
        userInfo.classList.remove('hidden');
        document.getElementById('user-name').textContent = user.firstName || user.email;
        document.getElementById('user-avatar').src = user.profileImageUrl || '/default-avatar.png';
    }
    
    if (mobileUserInfo) {
        mobileUserInfo.classList.remove('hidden');
        document.getElementById('mobile-user-name').textContent = user.firstName || user.email;
        document.getElementById('mobile-user-avatar').src = user.profileImageUrl || '/default-avatar.png';
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            currentUser = null;
            showLoginInterface();
            showNotification('Logged out successfully', 'info');
            
            // Sign out from Google
            google.accounts.id.disableAutoSelect();
        } else {
            showNotification('Logout failed', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
    }
}

// Export current user for other scripts to use
window.getCurrentUser = function() {
    return currentUser;
};

// Helper function for notifications (will use existing notification system)
function showNotification(message, type) {
    if (window.showNotification) {
        window.showNotification(message, type);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}