document.addEventListener('DOMContentLoaded', function () { // loading document do this
    const resultsContainer = document.getElementById('search-results-placeholder'); //create container for results

    function renderRecipes(recipes) {
        const rendered = Mustache.render(searchResultsTemplate, { recipes });
        resultsContainer.innerHTML = rendered;

        const seeFullRecipeButtons = document.querySelectorAll('.see-full-recipe');
        seeFullRecipeButtons.forEach((button, index) => {
            button.addEventListener('click', function () {
                const recipeId = recipes[index]._id;
                showFullRecipe(recipeId); 
            });
        });
    }

    document.getElementById('search-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;

        try {
            const response = await fetch(`http://3.84.112.227:3000/api/recipes/search?query=${encodeURIComponent(query)}`);

            if (!response.ok) {
                const errorData = await response.json();
                resultsContainer.innerHTML = `<p class="ui-message error">${errorData.error || "Something went wrong."}</p>`;
                return;
            }

            const data = await response.json();
            const recipes = Array.isArray(data) ? data : data.recipes; // getting fancy with these if statements!
            renderRecipes(recipes);
        } catch (err) {
            resultsContainer.innerHTML = `<p class="ui-message error">No recipes found or error occurred.</p>`;
        }
    });

    document.getElementById('showAllBtn').addEventListener('click', async function () {
        try {
            const response = await fetch('http://3.84.112.227:3000/api/recipes');
            const data = await response.json();
            const recipes = Array.isArray(data) ? data : data.recipes; // there we go again. I like this stuff!
            renderRecipes(recipes);
        } catch (err) {
            resultsContainer.innerHTML = `<p class="ui-message error">Unable to fetch all recipes.</p>`;
        }
    });
});