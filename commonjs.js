document.addEventListener('DOMContentLoaded', function() {
    const navPlaceholder = document.getElementById('navigation-placeholder');
    if (navPlaceholder) {
        navPlaceholder.innerHTML = Mustache.render(navTemplate, {});
    }

    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = Mustache.render(footerTemplate, {});
    }

    setupNavToggle(); // 👈 Add this here
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

function setupNavToggle() {
    const navList = document.querySelector('.navigation ul');
    const toggleLink = document.getElementById('hide-nav-link');

    if (!navList || !toggleLink) return;

    toggleLink.addEventListener('click', (e) => {
        e.preventDefault(); // Stop "#" from jumping the page

        const navItems = Array.from(navList.children).filter(
            li => !li.contains(toggleLink)
        );

        const isHidden = toggleLink.textContent === 'Show Navigation';

        if (isHidden) {
            navItems.forEach(li => li.style.display = 'list-item');
            toggleLink.textContent = 'Hide Navigation';
        } else {
            navItems.forEach(li => li.style.display = 'none');
            toggleLink.textContent = 'Show Navigation';
        }
    });
}