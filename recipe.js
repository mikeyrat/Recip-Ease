document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (!recipeId) {
        document.getElementById('full-recipe-view').innerHTML = `
            <p class="ui-message error">No recipe ID provided in the URL.</p>
        `;
        return;
    }

    // Show the recipe
    showFullRecipe(recipeId);
    setTimeout(() => {
        const goBackBtn = document.querySelector('#full-recipe-view .close-button');
        if (goBackBtn) goBackBtn.style.display = 'none';
    }, 300);

    // Setup sharing once the DOM is ready and after a delay to let rendering happen
    setTimeout(() => {
        const sharePanel = document.getElementById('share-buttons');
        if (!sharePanel) return;

        const baseURL = window.location.origin;
        const fullURL = `${baseURL}/recipe.html?id=${recipeId}`;

        // Setup buttons
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
    }, 300); // Give the recipe time to render
});
