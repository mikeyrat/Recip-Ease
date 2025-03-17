document.addEventListener('DOMContentLoaded', function() {
    const recipesData = {
        recipes: [
            { name: "Chicken ala King" },
            { name: "Southern Fried Chicken" },
            { name: "Roast Chicken" },
            { name: "Sweet Sour Chicken" },
            { name: "Chicken Salad" },
            { name: "Sesame Baked Chicken" },
            { name: "Wicked Chicken" },
            { name: "Hot Barbeque Chicken Wings" },
            { name: "Chicken Noodle Soup" }
        ]
    };

   
    const rendered = Mustache.render(searchResultsTemplate, recipesData);
    document.getElementById('search-results-placeholder').innerHTML = rendered;

    const seeFullRecipeButtons = document.querySelectorAll('.see-full-recipe');
    seeFullRecipeButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert("Recipe contents will be dynamically retrieved programmatically from MongoDB when code is fully implemented");
        });
    });

    const favoriteButtons = document.querySelectorAll('.favorite');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert("To be implemented in full site.");
        });
    });
});


