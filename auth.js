// User database (simulated with localStorage)
function initializeUserDB() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@government.gov',
                password: 'admin123', // Note: In real app, never store plain text passwords
                role: 'admin'
            },
            {
                id: 2,
                username: 'user1',
                email: 'user1@government.gov',
                password: 'user123',
                role: 'user'
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

// Initialize the user database when auth.js loads
initializeUserDB();

// Authentication function
function authenticateUser(usernameOrEmail, password) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => 
        u.username === usernameOrEmail || u.email === usernameOrEmail
    );
    
    if (!user) {
        return { success: false, message: 'User not found' };
    }
    
    // In a real app, we would compare hashed passwords
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password' };
    }
    
    return { 
        success: true, 
        message: 'Login successful',
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    };
}

// Registration function
function registerUser(username, email, password) {
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Check if user exists
    const userExists = users.some(u => 
        u.username === username || u.email === email
    );
    
    if (userExists) {
        return { success: false, message: 'User already exists' };
    }
    
    // Create new user
    const newUser = {
        id: users.length + 1,
        username,
        email,
        password, // In real app, hash this password
        role: 'user'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return { 
        success: true, 
        message: 'Registration successful',
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        }
    };
}

// Check if user is logged in
function checkAuth() {
    const user = 
        JSON.parse(sessionStorage.getItem('currentUser')) || 
        JSON.parse(localStorage.getItem('currentUser'));
    
    return user || null;
}

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
}