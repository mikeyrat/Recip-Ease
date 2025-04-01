document.addEventListener('DOMContentLoaded', function () {
    const resultsContainer = document.getElementById('search-results-placeholder');

    function renderRecipes(recipes) {
        const rendered = Mustache.render(shareTemplate, { recipes });
        resultsContainer.innerHTML = rendered;

        const shareButtons = document.querySelectorAll('.share-recipe');
        shareButtons.forEach(button => {
            const recipeId = button.getAttribute('data-id');
            button.addEventListener('click', () => {
                const shareUrl = `recipe.html?id=${recipeId}`;
                window.open(shareUrl, '_blank');
            });
        });

        const previewButtons = document.querySelectorAll('.preview-recipe');
        previewButtons.forEach(button => {
            const recipeId = button.getAttribute('data-id');
            button.addEventListener('click', () => {
                showFullRecipe(recipeId); 
            });
        });
    }

    async function fetchAllRecipes() {
        try {
            const response = await fetch('http://localhost:3000/api/recipes');
            const data = await response.json();
            const recipes = Array.isArray(data) ? data : data.recipes;
            renderRecipes(recipes);
        } catch (err) {
            resultsContainer.innerHTML = `<p class="ui-message error">Unable to fetch recipes for sharing.</p>`;
        }
    }

    document.getElementById('search-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;

        try {
            const response = await fetch(`http://localhost:3000/api/recipes/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            const recipes = Array.isArray(data) ? data : data.recipes;
            renderRecipes(recipes);
        } catch (err) {
            resultsContainer.innerHTML = `<p class="ui-message error">Search error occurred.</p>`;
        }
    });

    document.getElementById('showAllBtn').addEventListener('click', fetchAllRecipes);

    fetchAllRecipes();
});
