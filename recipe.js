// MyRecipEase.com by Michael Forman
// Prepared for Maryville University Masters of Programming Capstone Project, Dr. Joseph Gradecki
// Copyright 2024-2025 Michael Forman - All rights reserved.

document.addEventListener('DOMContentLoaded', () => {
    const pathParts = window.location.pathname.split('/');
    const recipeId = pathParts[pathParts.length - 1] || null;

    if (!recipeId) {
        document.getElementById('full-recipe-view').innerHTML = `
            <p class="ui-message error">No recipe ID provided in the URL.</p>
        `;
        return;
    }

    showFullRecipe(recipeId);
    setTimeout(() => {
        const goBackBtn = document.querySelector('#full-recipe-view .close-button');
        if (goBackBtn) goBackBtn.style.display = 'none';
    }, 300);

    setTimeout(() => {
        const sharePanel = document.getElementById('share-buttons');
        if (!sharePanel) return;

        const baseURL = window.location.origin;
        const fullURL = `${baseURL}/recipes/${recipeId}`;

        document.getElementById('facebook-share').onclick = () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullURL)}`, '_blank');
        };

        document.getElementById('twitter-share').onclick = () => {
            const text = "Check out this recipe I found on Recip-Ease!";
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullURL)}&text=${encodeURIComponent(text)}`, '_blank');
        };

        document.getElementById('email-share').onclick = () => {
            const subject = "You've got to try this recipe!";
            const body = `Check out this recipe on Recip-Ease: ${fullURL}`;
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        };

        document.getElementById('copy-link').onclick = () => {
            navigator.clipboard.writeText(fullURL).then(() => {
                const confirm = document.getElementById('copy-confirmation');
                confirm.style.display = 'inline';
                setTimeout(() => confirm.style.display = 'none', 3000);
            });
        };

        sharePanel.style.display = 'block';
    }, 300); 
});
