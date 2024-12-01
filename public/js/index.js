const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toggleBtn = document.getElementById('toggle-btn');
const togglePrompt = document.getElementById('toggle-prompt');

let isRegisterMode = false;

// Toggle between login and register forms
toggleBtn.addEventListener('click', () => {
    isRegisterMode = !isRegisterMode;

    if (isRegisterMode) {
        // Show Register Form
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        togglePrompt.textContent = 'Already have an account?';
        toggleBtn.textContent = 'Login';
    } else {
        // Show Login Form
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        togglePrompt.textContent = 'New to Workout Planner?';
        toggleBtn.textContent = 'Register';
    }
});

// Handle Login Form Submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    console.log('Logging in:', { email, password });
    // Send login data to server
    fetch('https://app.lift-ledger.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
        .then(response => {
            if (response.ok) {
                alert('Login successful!');
                window.location.href = '/basic.html'; // Redirect to dashboard
            } else {
                alert('Invalid login credentials.');
            }
        })
        .catch(err => console.error('Login error:', err));
});

// Handle Registration Form Submission
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    console.log('Registering:', { name, email, password });
    // Send registration data to server
    fetch('https://app.lift-ledger.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    })
        .then(response => {
            if (response.ok) {
                alert('Registration successful! Please login.');
                toggleBtn.click(); // Switch back to Login mode
            } else {
                alert('Registration failed.');
            }
        })
        .catch(err => console.error('Registration error:', err));
});
