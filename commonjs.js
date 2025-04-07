document.addEventListener('DOMContentLoaded', function() {

    // Render Navigation
    if (document.getElementById('navigation-placeholder')) {
        document.getElementById('navigation-placeholder').innerHTML = Mustache.render(navTemplate, {});
    }

    // Render Footer
    if (document.getElementById('footer-placeholder')) {
        document.getElementById('footer-placeholder').innerHTML = Mustache.render(footerTemplate, {});
    }

    
});

function sharedPageInit() {
    // Insert nav and footer if not already rendered
    const navPlaceholder = document.getElementById('navigation-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (navPlaceholder && !navPlaceholder.innerHTML.trim()) {
        navPlaceholder.innerHTML = navTemplate;
    }

    if (footerPlaceholder && !footerPlaceholder.innerHTML.trim()) {
        footerPlaceholder.innerHTML = footerTemplate;
    }

    // Update login button text
    const loginNavLink = document.getElementById('login-nav-link');
    const userId = localStorage.getItem('userId');

    if (!loginNavLink) return;

    if (userId) {
        fetch(`http://3.84.112.227:3000/api/users/${userId}`)
            .then(res => res.json())
            .then(user => {
                if (user && user.username) {
                    loginNavLink.textContent = `Logged in as ${user.username}`;
                    loginNavLink.href = '/signin.html';
                }
            })
            .catch(err => {
                console.error("Couldn't fetch user info for nav link:", err);
            });
    } else {
        loginNavLink.textContent = "Click to Sign In";
    }
}
