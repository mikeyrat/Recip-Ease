document.addEventListener('DOMContentLoaded', function() {
    const recipesData = {
        recipes: [
            { name: "Bejing Beef - Panda Copycat" },
            { name: "Penne with Vodka Sauce" },
            { name: "Arrabiata (Angry) Sauce" },
            { name: "Mom's Ruebens" },
            { name: "Crock Pot BBQ Beef" },
            { name: "Steak Diane - Sorta" },
            { name: "Deb's Ricotta Cookies" },
            { name: "Herion Wings - My Version" },
            { name: "Best Pizza Dough" },
            { name: "Old School Beef Casserole" },
            { name: "Peanut Butter Cookies" },
            { name: "My Fajita Marinade" }
        ]
    };

   
    const rendered = Mustache.render(shareTemplate, recipesData);
    document.getElementById('search-results-placeholder').innerHTML = rendered;

    const seeFullRecipeButtons = document.querySelectorAll('.see-full-recipe');
    seeFullRecipeButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert("Sharing to social media will be implemented in the full site.");
        });
    });

    const favoriteButtons = document.querySelectorAll('.favorite');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert("Email to a Friend will be implemented in full site.");
        });
    });
});


