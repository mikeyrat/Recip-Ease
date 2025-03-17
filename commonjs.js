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
