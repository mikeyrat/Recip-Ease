// MyRecipEase.com by Michael Forman
// Prepared for Maryville University Masters of Programming Capstone Project, Dr. Joseph Gradecki
// Copyright 2024-2025 Michael Forman - All rights reserved.

document.addEventListener('DOMContentLoaded', function () { // on load
    sharedPageInit(); // function in common.js to display or hide the navigation buttons depending on user selection page to page
    const resultsContainer = document.getElementById('search-results-placeholder'); // create container to display results

    function renderRecipes(recipes) { // function to display the recipes from the search results
        const rendered = Mustache.render(shareTemplate, { recipes }); // grab the template from template.js
        resultsContainer.innerHTML = rendered; // fill the container

        const shareButtons = document.querySelectorAll('.share-recipe'); //share buttons on every line
        shareButtons.forEach(button => { // go through the buttons and...
            const recipeId = button.getAttribute('data-id'); // get the recipe ID
            button.addEventListener('click', () => { // set up listeners for the buttons
                const shareUrl = `/recipes/${recipeId}`; //create the url for the recipe page
                window.open(shareUrl, '_blank'); // show the page
            });
        });

        const previewButtons = document.querySelectorAll('.preview-recipe'); // we also have preview buttons
        previewButtons.forEach(button => { // cycle the buttons
            const recipeId = button.getAttribute('data-id'); // get the recipe id again
            button.addEventListener('click', () => { // wait for the beep.. (click)
                showFullRecipe(recipeId); // call showFullRecipe() from javascript.js
            });
        });
    }

    async function fetchAllRecipes() { // functionality for the "Show All" button
        try { // lets hope the database is, like, there
            const response = await fetch('http://3.84.112.227:3000/api/recipes'); // fetch all the documents in the recipes collection
            const data = await response.json(); // wait for the json response
            const recipes = Array.isArray(data) ? data : data.recipes; // Is there data? If so, stick it in our array of recipes to display
            renderRecipes(recipes); // display them
        } catch (err) { // no connection or other error?
            resultsContainer.innerHTML = `<p class="ui-message error">Unable to fetch recipes for sharing.</p>`; // meh, too bad
        }
    }

    document.getElementById('showMyBtn').addEventListener('click', async function () { // Functionality for "Show My Recipes" button
        const userId = localStorage.getItem('userId'); // grab the user ID from localStorage
        if (!userId) { // no userID? Not logged in.
            alert("You must be logged in to see your recipes."); // sorry chump
            return;
        }
    
        try { // database please work!
            const response = await fetch('http://3.84.112.227:3000/api/recipes'); // route for getting all recipes first
            const data = await response.json(); // gimme data!
            const recipes = Array.isArray(data) ? data : data.recipes; // love these tight if/then Data? yay throw in array, no data, boo
    
            const myRecipes = recipes.filter(recipe => recipe.user_id === parseInt(userId)); // OK, I coulda had a route for finding only user ID, but I got lazy
            if (myRecipes.length === 0) { // no recipes by user
                resultsContainer.innerHTML = `<p class="ui-message info">You haven't entered any recipes yet.</p>`; //boo
            } else {
                renderRecipes(myRecipes); // show em... call renderRecipes() from javascripts.js
            }
        } catch (err) {
            resultsContainer.innerHTML = `<p class="ui-message error">Failed to load your recipes.</p>`; // one of those things we hope to never see
        }
    });

    document.getElementById('search-form').addEventListener('submit', async function (e) { // submit button for search text box
        e.preventDefault();// javascript got this, so away browser
        const query = document.getElementById('searchInput').value.trim(); // get textbox data
        if (!query) return; // nothing there, then back you go

        try {
            const response = await fetch(`http://3.84.112.227:3000/api/recipes/search?query=${encodeURIComponent(query)}`); // route to fetch recipes using data to search
            const data = await response.json(); // wait for it... wait for it...
            const recipes = Array.isArray(data) ? data : data.recipes; // boom bam, yes no, true false data or no data?
            renderRecipes(recipes); // call renderRecipes() from javascripts.js
        } catch (err) {
            resultsContainer.innerHTML = `<p class="ui-message error">Search error occurred.</p>`; // something is amiss?
        }
    });

    document.getElementById('showAllBtn').addEventListener('click', fetchAllRecipes); // document listener for show all button.


});
