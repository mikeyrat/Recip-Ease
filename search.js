document.addEventListener('DOMContentLoaded', function () {
    const resultsContainer = document.getElementById('search-results-placeholder');

    function renderRecipes(recipes) {
        const rendered = Mustache.render(searchResultsTemplate, { recipes });
        resultsContainer.innerHTML = rendered;

        const seeFullRecipeButtons = document.querySelectorAll('.see-full-recipe');
        seeFullRecipeButtons.forEach((button, index) => {
            button.addEventListener('click', function () {
                const recipeId = recipes[index]._id;
                showFullRecipe(recipeId); // 🔥 This is the same function from javascripts.js
            });
        });
    }

    // Search form logic
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
            resultsContainer.innerHTML = `<p class="ui-message error">No recipes found or error occurred.</p>`;
        }
    });

    // Show All button logic
    document.getElementById('showAllBtn').addEventListener('click', async function () {
        try {
            const response = await fetch('http://localhost:3000/api/recipes');
            const data = await response.json();
            const recipes = Array.isArray(data) ? data : data.recipes;
            renderRecipes(recipes);
        } catch (err) {
            resultsContainer.innerHTML = `<p class="ui-message error">Unable to fetch all recipes.</p>`;
        }
    });
});