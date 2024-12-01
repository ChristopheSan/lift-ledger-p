const logoutBtns = document.querySelectorAll('.logout-btn');

logoutBtns.forEach(button => {
    button.addEventListener('click', () => {
        console.log('Logout button clicked!');

        // Example: Perform logout logic
        fetch('https://app.lift-ledger.com/auth/logout', {
            method: 'POST',
            cookies: 'token'
        })
            .then(response => {
                if (response.ok) {
                    alert('Logged out successfully!');
                    window.location.href = '/'; // Redirect to login page
                } else {
                    alert('Logout failed!');
                }
            })
            .catch(err => console.error('Logout error:', err));
    });
})