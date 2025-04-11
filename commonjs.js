// MyRecipEase.com by Michael Forman
// Prepared for Maryville University Masters of Programming Capstone Project, Dr. Joseph Gradecki
// Copyright 2024-2025 Michael Forman - All rights reserved.

//common scripts for a variety of things, but mainly the navigation

document.addEventListener('DOMContentLoaded', function() { // when the navigation/footer placeholder is called by the html
    const navPlaceholder = document.getElementById('navigation-placeholder'); // by this statement
    if (navPlaceholder) {
        navPlaceholder.innerHTML = Mustache.render(navTemplate, {}); // pull the template from templates.js and stuff itwith the nav stuff
    }

    const footerPlaceholder = document.getElementById('footer-placeholder'); // render the footer when called
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = Mustache.render(footerTemplate, {}); // call the template and fill it
    }

    setupNavToggle(); // calls the setupNavToggle() function where it hides/shows the navigation buttons to save space on the enter page
});

function sharedPageInit() { 
    // Insert nav and footer if not already rendered
    const navPlaceholder = document.getElementById('navigation-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (navPlaceholder && !navPlaceholder.innerHTML.trim()) {
        navPlaceholder.innerHTML = navTemplate; // call and place html in the nav template
    }

    if (footerPlaceholder && !footerPlaceholder.innerHTML.trim()) {
        footerPlaceholder.innerHTML = footerTemplate; // call and place the html in the footerTemplate
    }

    // Update login button text
    const loginNavLink = document.getElementById('login-nav-link'); // update text on button that either says "SignIn/Sign Up" or "Logged in as ..."
    const userId = localStorage.getItem('userId'); // check for user ID (if present user is logged in)

    if (!loginNavLink) return; // hopefully this never happens.

    if (userId) { // if userid exists then...
        fetch(`http://3.84.112.227:3000/api/users/${userId}`) //... grab the username from the users collection
            .then(res => res.json()) // get the json
            .then(user => { // if both are there and in order
                if (user && user.username) {
                    loginNavLink.textContent = `Logged in as ${user.username}`; // fill in the logged in text
                    loginNavLink.href = '/signin.html'; // if user clicks it it goes to sign in page to logout?
                } 
            })
            .catch(err => {
                console.error("Couldn't fetch user info for nav link:", err); //bad database today?
            });
    } else {
        loginNavLink.textContent = "Click to Sign In";
    }
}

function setupNavToggle() { // nifty toggle to show or hide navigation (kinda proud of this concept/function)
    const navList = document.querySelector('.navigation ul'); // load the navList const with section id
    const toggleLink = document.getElementById('hide-nav-link'); // load the toggleLink with div id

    if (!navList || !toggleLink) return; // if neither exist, well crap, no menu for you!

    toggleLink.addEventListener('click', (e) => { //wait for the click
        e.preventDefault(); // stop cancelled operations

        const navItems = Array.from(navList.children).filter( // if list toggled to show, show menu items
            li => !li.contains(toggleLink) // if no nav items then..
        );

        const isHidden = toggleLink.textContent === 'Show Navigation'; //  if the textContext is NOT show nav then ...

        if (isHidden) { // who the menu
            navItems.forEach(li => li.style.display = 'list-item'); // if not
            toggleLink.textContent = 'Hide Navigation';
        } else { // do not show the menu, just the "Show Navigation" button
            navItems.forEach(li => li.style.display = 'none');
            toggleLink.textContent = 'Show Navigation';
        }
    });
}