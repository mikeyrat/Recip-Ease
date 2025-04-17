// MyRecipEase.com by Michael Forman
// Prepared for Maryville University Masters of Programming Capstone Project, Dr. Joseph Gradecki
// Copyright 2023-2025 Michael Forman - All rights reserved.

// this java script is the heart of the functionality of the site. 

let currentUserId = null; // clear these variables before we begin
let selectedIngredientName = null;
let selectedIngredientUnits = {};

document.addEventListener('DOMContentLoaded', function () { // this page has a key for that has to load properly, including database calls so timing is important as I learned the hard way
  setTimeout(() => { // Wait a short moment for the dropdown template to finish rendering - This page has a number of timing waits for things to fill, etc
    const savedRecipeId = localStorage.getItem('currentRecipeId'); // retrieve the recipe id if one is started on refresh or nav away and back
    const savedBasics = localStorage.getItem('currentRecipeBasics'); // recipe basics are name, category, dishtype, description, servings

    if (savedBasics) { // if recipe exists, then fill the recipe data
      const data = JSON.parse(savedBasics);
      document.getElementById('recipeName').value = data.name || '';  // fill the text stuff
      document.getElementById('description').value = data.description || '';
      document.getElementById('servings').value = data.servings || '';
      const foodCategorySelect = document.getElementById('foodCategory'); // get the category and dishtype for the drop downs
      const dishTypeSelect = document.getElementById('dishType');

      if (foodCategorySelect) { // if category is selected, then send a change event so it can trigger loading the dishtypes
        foodCategorySelect.value = data.category;
        foodCategorySelect.dispatchEvent(new Event('change'));
      }

      let retries = 0; // Delay setting dish type until options are available ... failing to load dishtypes due to timing issues was really pissing me off
      const interval = setInterval(() => { // so here we are
        const dishTypeSelect = document.getElementById('dishType'); // we keep retrying loading dishtypes with each retry
        const optionExists = dishTypeSelect && Array.from(dishTypeSelect.options).some(
          opt => opt.value === data.type // keep looking for distypes
        );
        if (optionExists || retries > 10) { // try 10 times anyway
          if (dishTypeSelect) {
            dishTypeSelect.value = data.type;
          }
          clearInterval(interval);
        }
        retries++; // increment retries
      }, 100); // delay 10th sec for stuff to clear

      currentRecipeId = (savedRecipeId); // ok if we made it this far, does the recipe have instructions or ingredients, if so, render them in the appropriate boxes
      if (currentRecipeId) {
        renderEnteredInstructions(currentRecipeId); // these functions are below
        renderEnteredIngredients(currentRecipeId).then(addedIngredients => {
          document.querySelectorAll('.parsed-ingredients-list li').forEach(li => { // one of my favorite cool things is to remove used ingredients from the suggestion list
            const text = li.textContent.trim().toLowerCase();
            addedIngredients.forEach(name => { // look for each ingredient already used inthe recipe
              if (text.includes(name.toLowerCase())) { // match?
                li.remove(); // remove it from the display
              }
            });
          });
        });
      }
    }
  }, 200); // This shit takes time, so delay a bit while it happens
});

document.addEventListener('DOMContentLoaded', function() { // frankly, we probs don't need ANOTHER DOM loaded, but this is the enter page and it's special!
    sharedPageInit(); // set up the nav with shared function call in javascript.js

    const storedUserId = localStorage.getItem('userId'); // checking for logged in
    if (storedUserId) {
        currentUserId = parseInt(storedUserId); // yay! move along
    } else {
        alert("You must be signed in to create a recipe."); // sorry dude, sign in first. Box takes you to sign in page
        window.location.href = "/signin.html"; 
    }
    var buttonData = { // data for our quantity buttons for feeding template
      buttons: [
          { label: "Cup" },
          { label: "1/2<br>Cup" },
          { label: "1/3<br>Cup" },
          { label: "1/4<br>Cup" },
          { label: "TBSP" },
          { label: "1/2<br>TBSP" },
          { label: "TSP" },
          { label: "1/2<br>TSP" },
          { label: "1/8<br>TSP" },
          { label: "Oz." },
          { label: "Lbs." },
          { label: "Pinch" },
          { label: "Dash" },
          { label: "Drop" },
          { label: "Whole" },
          { label: "Bunch" },
          { label: "Qty" },
          { label: "Other" }
      ]
  };
    var buttonGridRendered = Mustache.render(buttonGridTemplate, buttonData); // render the buttons
    document.getElementById('button-grid-placeholder').innerHTML = buttonGridRendered;
    document.querySelectorAll('.button-grid button').forEach(button => { // create listeners for each button with this loop. 
        button.addEventListener('click', () => { // shoulda seen the mess this was without a loop!
          if (!selectedIngredientName) { // gotta choose an ingredient first bro
            alert("Please select an ingredient first.");
            return;
          }
      
          const unitLabel = button.innerHTML.replace(/<br\s*\/?>/gi, ' ').trim(); // Do some trimming for display here
          selectedIngredientUnits[unitLabel] = (selectedIngredientUnits[unitLabel] || 0) + 1; // prep text for preview box
          updateUnitPreview(); // update preview box, duh
        });
      });
});

document.addEventListener('DOMContentLoaded', function() { // this was originally first, but we needed to see if there was a saved recipe first hence the first loader
    var categoryData = { // categories for ingredients value is actually collection name
        categories: [
            { value: "breadsrolls_ingredients", name: "Baked Goods (breads, rolls, etc.)" },
            { value: "appetizer_ingredients", name: "Appetizers" },
            { value: "sides_ingredients", name: "Sides and Veggies" },
            { value: "main_course_ingredients", name: "Main Courses" },
            { value: "dessert_ingredients", name: "Desserts" },
            { value: "sauces_ingredients", name: "Marinades and Sauces" },
        ]
    };

    var renderedDropdown = Mustache.render(categoryDropdownTemplate, categoryData); // fill and render the dropdown
    var foodCategoryDropdown = document.getElementById('foodCategoryDropdown');
    foodCategoryDropdown.innerHTML = renderedDropdown;

    var foodCategorySelect = document.getElementById('foodCategory');
    if (foodCategorySelect) { // get our selection for category (collection) of ingredients
        foodCategorySelect.addEventListener('change', function() { // send change to listener so we know we need to do something
            var category = this.value; // get the category and...
            var dishTypeSelect = document.getElementById('dishType'); // get the dishType from "dishes" below
            dishTypeSelect.innerHTML = ''; 

             var normalized = category.replace('_ingredients', '').replace('main_course', 'maincourses'); // strip "_ingredients" because I changed collection names after I did the following code

            var dishes = {
              breadsrolls: [
                    { value: "dough", name: "Dough" },
                    { value: "breads", name: "Breads" },
                    { value: "rolls", name: "Rolls" },
                    { value: "pastries", name: "Pastries" },
                    { value: "sweetgoods", name: "Sweet Goods (Donuts, Muffins, Danish, etc.)" },
                    { value: "misc", name: "Miscellaneous (tortillas, flatbreads" }
                ],
                appetizer: [
                    { value: "fingerfoods", name: "Finger Foods" },
                    { value: "dips", name: "Dips & Spreads" },
                    { value: "wings", name: "Wings & Things" }
                ],
                sides: [
                    { value: "salads", name: "Salads" },
                    { value: "coldsides", name: "Cold Sides" },
                    { value: "hotsides", name: "Hot Sides" },
                    { value: "vegetables", name: "Vegetables" },
                    { value: "picnic", name: "Picnics and Bar-B-Que Sides" },
                    { value: "international", name: "International Sides" }
                ],
                maincourses: [
                    { value: "beef", name: "Beef" },
                    { value: "chicken", name: "Chicken" },
                    { value: "casseroles", name: "Casseroles" },
                    { value: "soups", name: "Soups" },
                    { value: "pork", name: "Pork" },
                    { value: "vegetarian", name: "Vegetarian" }
                ],
                dessert: [
                    { value: "cake", name: "Cake" },
                    { value: "pie", name: "Pie" },
                    { value: "pudding", name: "Pudding" },
                    { value: "icecream", name: "Ice Cream" },
                    { value: "cookies", name: "Cookies" },
                    { value: "sweetbreads", name: "Sweet Breads" }
                ],
                sauces: [
                  { value: "dips", name: "Dips" },
                  { value: "dressings", name: "Dressings" },
                  { value: "marinades", name: "Marinades" },
                  { value: "savory_sauces", name: "Savory Sauces" },
                  { value: "spreads", name: "Spreads" },
                  { value: "sweet_sauces", name: "Sweet Sauces" }
                ]
        };

        if (dishes[normalized]) { // go through these names and fill the drop downs, etc.
            dishes[normalized].forEach(function(dish) {
                var option = document.createElement('option');
                option.value = dish.value;
                option.textContent = dish.name;
                dishTypeSelect.appendChild(option);
            });
            }
        });
    }
});

let currentRecipeId = null; // store for later use (ingredients, instructions)

document.addEventListener('DOMContentLoaded', function () { // if no recipe, then we can capture the basics
    const recipeForm = document.getElementById('recipeForm');

    recipeForm.addEventListener('submit', async function (e) { // when "Save Recipe Information" clicked do this listener
        e.preventDefault(); // Whatever the browser would do here, NO! I'll handle it with JavaScript (XSS prevention)
        const recipeData = { // take the data from the form for the following
            name: document.getElementById('recipeName').value.trim(),
            category: document.getElementById('foodCategory').value.trim(),
            type: document.getElementById('dishType').value.trim(),
            description: document.getElementById('description').value.trim(),
            servings: document.getElementById('servings').value.trim(),
            user_id: currentUserId
        };

        // Basic validation
        if (!recipeData.name || !recipeData.category || !recipeData.type) { // validate it all before sending payload to the POST
            alert("Please fill in the required fields: name, category, and type."); // no null entries here fix your shit
            return;
        }

        try { // please, please Mr. Database!
            const response = await fetch('http://3.84.112.227:3000/api/recipes/basicinfo', { // get ready to post that stuff to the recipes collection
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recipeData) // fire away!
            });

            const result = await response.json(); // worky?  Well..... we're waiting... (Thanks to Judge Smails!)

            if (response.ok && result.recipe_id) { // If its all good, we get OK, and handy dandy recipeID
                currentRecipeId = result.recipe_id;
                localStorage.setItem('currentRecipeId', currentRecipeId); // set the localStorage with the recipeid
                localStorage.setItem('currentRecipeBasics', JSON.stringify(recipeData)); // Store the saved recipe data up to this point. 
                loadIngredients(recipeData.category, recipeData.type);
                handleRecipeBasicsSaved(); // "recipeData" will be built up on as the user adds ingredients and instructions. It is the main recipes payload for this recipe
            } else {                       
                throw new Error(result.error || 'Failed to save recipe');
            }
        } catch (err) { // bad day I reckon
            console.error('Save failed:', err); // err is right thank goodness for "pm2 logs server"!
            alert('Error saving recipe. Please try again.');
        }
    });
});

function loadIngredients(category, type) { // function to load ingredients
  if (!currentRecipeId) return; // gotta have a recipe id for this
    const listContainer = document.getElementById('parsedIngredientsList'); // create container for ingredients list
    if (!listContainer) return;
  
    if (!category || !type) { // if for some reason no category and type then meh
      listContainer.innerHTML = "<p>Please select both category and type.</p>"; // technically this code should never be used due to work in top DOM load
      return;
    } // it is a nice check for corrupted data before the following fetch tho
  
    fetch(`http://3.84.112.227:3000/api/${category}?types=${type}`) //GET the ingredients from the right collection, and with the right dishType
      .then(response => response.json()) // does it work, if so yadda yadda
      .then(data => {
        if (!data.ingredients || data.ingredients.length === 0) {
          listContainer.innerHTML = "<p>No ingredients found for this selection.</p>"; // no ingredients in there, sucks to be me. Where is my collection?
          return;
        }
  
        // Sort by usage_count descending
        const sortedIngredients = data.ingredients.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0)); // Gotta sort by usage_count
                                                                                                // to make sure most common ingredients are at the top
        const ul = document.createElement('ul'); // creating clickable listing here
        sortedIngredients.forEach(item => {
            const li = document.createElement('li'); // making them so
          
            const nameSpan = document.createElement('span');
            nameSpan.className = 'ingredient-name';
            nameSpan.textContent = item.ingredient;
          
            const actionsSpan = document.createElement('span');
            actionsSpan.className = 'ingredient-actions';
          
            li.appendChild(nameSpan);
            li.appendChild(actionsSpan);
          
            li.style.cursor = 'pointer';
            li.title = 'Click to add quantity'; // building the html for each line
          
            li.addEventListener('click', () => { // creating listeners for each line
              selectIngredient(item.ingredient); // call the select ingredient function below when clicked
            });
          
            ul.appendChild(li); // add to the list
          });
  
        listContainer.innerHTML = ''; // make sure list is empty before we...
        listContainer.appendChild(ul); // fill in the lines
      })
      .catch(err => {
        console.error("Error fetching ingredients:", err);
        listContainer.innerHTML = "<p>Error loading ingredients.</p>";
      });
  }

  function selectIngredient(ingredientName) { // called when user clicks ingredient in parsed-ingredient-list
    selectedIngredientName = ingredientName;
    selectedIngredientUnits = {}; // reset the unit counts though it should always be empty in this case
    document.getElementById('unit-preview').textContent = ''; 
    document.querySelectorAll('.parsed-ingredients-list li').forEach(li => {
      li.style.backgroundColor = ''; //make sure all backgrounds are empty
    });
  
    const selectedLi = Array.from(document.querySelectorAll('.parsed-ingredients-list li'))
      .find(li => li.textContent.includes(ingredientName));
    if (selectedLi) {
      selectedLi.style.backgroundColor = '#fff3dc'; // when user clicks an ingredient it changes to greenish
    }
  
    // console.log(`Selected: ${ingredientName}`); troubleshooting meh
  }

  function updateUnitPreview() { // function to set up ingredient preview as use clicks ingredients and quantity buttons
    document.getElementById('unit-preview-row').classList.remove('hidden'); //First of all, show it, it is hidden by default to keep UI clean until user begins
    const preview = document.getElementById('unit-preview');
    if (!selectedIngredientName || Object.keys(selectedIngredientUnits).length === 0) {
      preview.textContent = ''; // if things are empty, then display nothing but box and button (gotta clear out precious selections after OK)
      return;
    }
  
    const fakeIngredient = { // this are "fake ingredients" because this const is only for display until the user clicks OK, and the REAL data gets PUTted
      [selectedIngredientName]: {
        units: selectedIngredientUnits
      }
    };
  
    const lines = formatIngredients(fakeIngredient); // send our fakeys to be formatted (see javascripts.js) so they are pretty
    preview.textContent = lines[0] || ''; // we have text or we show nothing
  }

  function clearIngredientSearchResults() {
    const resultsContainer = document.getElementById('ingredientSearchResults');
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'none';  // 👈 Hides it when cleared
    }
  }

  document.addEventListener('DOMContentLoaded', function () { // cancel button listener if the user selects an ingredient and quantity and wants to cancel
    const cancelUnitBtn = document.getElementById('cancel-unit-btn'); // get the button
    if (cancelUnitBtn) {
      cancelUnitBtn.addEventListener('click', () => { // clicked? then clear crap out and clear flags, etc., etc.
        selectedIngredientName = null;
        selectedIngredientUnits = {};
        document.getElementById('divided').checked = false;
        document.getElementById('unit-preview').textContent = '';
        clearIngredientSearchResults();
        document.querySelectorAll('.parsed-ingredients-list li').forEach(li => {
          li.style.backgroundColor = ''; // go back to the ingredient list and turn the selected ingredient background from greenish to white
        });
      });
    }
  });

  document.addEventListener('DOMContentLoaded', () => { // pretty sure this DOM loader is superflous now. It was an early attempt
    const categorySelect = document.getElementById('foodCategory');
    const typeSelect = document.getElementById('dishType');
  
    function tryLoadIngredients() {
      const category = categorySelect.value;
      const type = typeSelect.value;
      if (category && type) {
        loadIngredients(category, type);
      }
    }

    if (categorySelect && typeSelect) {
      categorySelect.addEventListener('change', tryLoadIngredients);
      typeSelect.addEventListener('change', tryLoadIngredients);
    }
  });  
  
  document.querySelector('.ingredient-form').addEventListener('submit', async (e) => { // "OK" button after selecting ingredient and quantity(s)
    e.preventDefault(); // Browser, no default action, javascript got this
    if (!selectedIngredientName || Object.keys(selectedIngredientUnits).length === 0) { // if neither ingredients or quantity fie on you
      alert("Please select an ingredient and at least one unit.");
      return; // fix it plz
    }
  
    if (!currentRecipeId) { // this is likely hardly ever true. The system has to save and keep a recipeID before entering ingredients etc
      alert("Please save recipe basics first.");
      return;
    }
  
    try { // please Mr. Mongo!
      const isDivided = document.getElementById('divided')?.checked || false; // did user click "divided button, if so, load it true not, false"

      const response = await fetch(`http://3.84.112.227:3000/api/recipes/${currentRecipeId}/ingredients`, { // here, we are "putting our ingredients to the db"
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ // here is our payload, ingredients and quantities and amounts and whether divided is checked
          name: selectedIngredientName,
          units: selectedIngredientUnits,
          divided: isDivided
        })
      });

  
      const result = await response.json(); // hope it works!
  
      if (response.ok) { // we can hope
        // alert(`Added ${selectedIngredientName} to recipe.`); was for testing, now just annoying
        selectedIngredientName = null; // clear variables
        selectedIngredientUnits = {};
        document.getElementById('unit-preview').textContent = ''; // clear preview box
        document.getElementById('divided').checked = false; // clear checked
        clearIngredientSearchResults();
        document.querySelectorAll('.parsed-ingredients-list li').forEach(li => li.style.backgroundColor = ''); // make sure no ingredients indicate selected
        const instructionForm = document.getElementById('instructions-form');
        if (instructionForm && instructionForm.style.display === 'none') { // only display parts of the instructions if form is visible
          instructionForm.style.display = 'block';
        }
      
        // Refresh list
        const addedIngredients = await renderEnteredIngredients(currentRecipeId); // sent our added ingredients to "renderEnteredIngredients" which is later

        document.querySelector('#parsedIngredientsList ul')?.querySelectorAll('li')?.forEach(li => { // basically we go through the parsed ingredients and remove what is used
          const text = li.textContent.trim().toLowerCase();
          addedIngredients.forEach(name => {
            if (text.includes(name.toLowerCase())) {
              li.remove();
            }
          });
        });
      } else {
        throw new Error(result.error || "Failed to add ingredient"); // final check to see if it all worked
      }
    } catch (err) {
      console.error(err);
      alert("Error saving ingredient."); // sorry, Charlie
    }
  });

  document.querySelector('.instructions-form').addEventListener('submit', async (e) => { // listener to see if user has clicked the "Save Instruction Step" button
    e.preventDefault(); // chill browser, javascript is in charge
  
    const textarea = document.getElementById('instructions'); // read text area
    const stepText = textarea.value.trim(); // trim it
  
    if (!stepText) { // if blank, then alert
      alert("Please enter some instruction text.");
      return;
    }
  
    if (!currentRecipeId) { //gotta save recipe basics, actually, we cant get here unless you do anymore
      alert("Please save recipe basics first.");
      return;
    }
  
    try {
      const response = await fetch(`http://3.84.112.227:3000/api/recipes/${currentRecipeId}/instructions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ push: { instructions: stepText } }) // PUT instruction step in recipes document
      });
  
      const result = await response.json();
  
      if (response.ok) {
        textarea.value = ''; // we good, clear the text box
        await renderEnteredInstructions(currentRecipeId);
      } else {
        throw new Error(result.error || "Failed to add instruction."); // sad face
      }
    } catch (err) {
      //console.error("Error saving instruction:", err);
      alert("Failed to save instruction.");
    }
  });

  document.getElementById('clear-instruction-btn')?.addEventListener('click', () => { // button if user cancels the instruction entry process
    document.getElementById('instructions').value = '';
  });
  

  async function renderEnteredIngredients(recipeId) { // function to build display for ingredients that have already been entered and saved to the document
    recipeId = parseInt(recipeId);
    try {
      const response = await fetch(`http://3.84.112.227:3000/api/recipes/${recipeId}`); // get the recipe in its current state
      const recipe = await response.json();
  
      const container = document.getElementById('entered-ingredients'); // set up the container
      if (!recipe || !recipe.ingredients || Object.keys(recipe.ingredients).length === 0) {
        container.innerHTML = "<p>No ingredients added yet.</p>"; // no ingredients, tell user
        return [];
      }
  
      const lines = formatIngredients(recipe.ingredients); // send these puppies to formatIngredients() in javascripts.js
      const ul = document.createElement('ul'); // when they come back, they gonna be clickable
  
      Object.entries(recipe.ingredients).forEach(([name, data], index) => { // step through all ingredients in the return payload
        const li = document.createElement('li');
        li.className = 'ingredient-entry';
        const displayText = lines[index]; // make them all clickable
        li.innerHTML = `
          <span class="ingredient-line">${displayText}</span>
          <button class="inline-delete-btn" style="display:none;">Delete</button> 
        `;
                // Add a nifty "Delete" button to the line, but only show it when its clicked
        const deleteBtn = li.querySelector('.inline-delete-btn');
        li.addEventListener('click', () => { // event listener for when they click the now visible delete button
          deleteBtn.style.display = deleteBtn.style.display === 'inline-block' ? 'none' : 'inline-block'; // check if there and visible, if not make it so #1
        });
  
        deleteBtn.addEventListener('click', async (e) => { // they click the delete button we do...
          e.stopPropagation();  // stop any action but this object
  
          try {
            const result = await fetch(`http://3.84.112.227:3000/api/recipes/${recipeId}/ingredients`, { // delete this ingredient from the recipe document
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name })
            });
  
            if (!result.ok) {
              const err = await result.json();
              throw new Error(err.error || "Delete failed"); // god help us
            }
  
            await renderEnteredIngredients(recipeId); // Refresh selected ingredient list
          } catch (err) {
            alert("Error deleting ingredient."); // NOOOOOO!
            console.error(err); //WTf happened
          }
        });
  
        ul.appendChild(li);
      });
  
      container.innerHTML = ''; // clear ingredients list of old ingredients
      container.appendChild(ul); // refill it with real info
      return Object.keys(recipe.ingredients);
    } catch (err) {
      console.error("Error loading entered ingredients:", err);
      return [];
    }
  }

  async function renderEnteredInstructions(recipeId) { // this function works a lot like, and frankly is copied from above, but simplified
    try {
      const response = await fetch(`http://3.84.112.227:3000/api/recipes/${recipeId}`);
      const recipe = await response.json();
  
      const container = document.getElementById('entered-instructions');
      if (!container) return;
  
      container.style.display = 'block';
  
      if (!recipe.instructions || recipe.instructions.length === 0) {
        container.innerHTML = "<p>No instructions added yet.</p>";
        return;
      }
  
      const ol = document.createElement('ol');
  
      recipe.instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.className = 'instruction-entry'; // we even add a nifty delete button
        li.innerHTML = `
          <span class="instruction-line">${instruction}</span>
          <button class="inline-delete-btn" style="display:none;">Delete</button>
        `;
  
        const deleteBtn = li.querySelector('.inline-delete-btn');
        li.addEventListener('click', () => {
          deleteBtn.style.display = deleteBtn.style.display === 'inline-block' ? 'none' : 'inline-block';
        });
  
        deleteBtn.addEventListener('click', async (e) => {
          e.stopPropagation(); // not today browser, stay on task with this
  
          try {
            const result = await fetch(`http://3.84.112.227:3000/api/recipes/${recipeId}/instructions`, { // delete this insruction and go on
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ instructions: instruction })
            });
  
            if (!result.ok) {
              const err = await result.json();
              throw new Error(err.error || "Delete failed");
            }
  
            await renderEnteredInstructions(recipeId); // Refresh
          } catch (err) {
            alert("Error deleting instruction.");
            console.error(err);
          }
        });
  
        ol.appendChild(li);
      });
  
      container.innerHTML = '';
      container.appendChild(ol); // same stuff blah blah
    } catch (err) {
      console.error("Error loading instructions:", err);
    }
  }
  

  document.getElementById('saveRecipeBtn').addEventListener('click', async () => { // technically, a recipe is saved as you go, but we need to clean up stuff
    if (!currentRecipeId) {
      alert("No recipe to save.");
      return;
    }
    try {
      const response = await fetch(`http://3.84.112.227:3000/api/recipes/${currentRecipeId}`); // first get whole recipe
      const recipe = await response.json();
  
      if (!recipe || !recipe.ingredients) { // we are going to increment the usage_count on all ingredients used in the recipe to increase their "popularity"
        alert("No ingredients to finalize."); // for later users, placing them higher on the list
        return;
      }
  
      const ingredientNames = Object.keys(recipe.ingredients || {}); // no ingredients, no good
      const collection = recipe.category || 'unknown';
  
      // Increment usage count for each ingredient
      for (const ingredient of ingredientNames) { // ok so we go ingredient by ingredient
        const safeIngredient = encodeURIComponent(ingredient); // make sure name is good
        const safeCollection = encodeURIComponent(collection); // make sure we have the right collection
        await fetch(`http://3.84.112.227:3000/api/${safeCollection}/${safeIngredient}/increment`, { // if so, send to this route to increment the usage_count
          method: 'PUT'
        });
      }
  
      alert("Recipe saved!"); // all done!
  
      // Clear all our form fields
      document.getElementById('recipeName').value = '';
      document.getElementById('description').value = '';
      document.getElementById('servings').value = '';
      document.getElementById('foodCategory').value = '';
      document.getElementById('dishType').innerHTML = '';
  
      // Clear current recipe selected state
      selectedIngredientName = null;
      selectedIngredientUnits = {};
      currentRecipeId = null;
  
      // Clear local storage of a couple of variables
      localStorage.removeItem('currentRecipeId');
      localStorage.removeItem('currentRecipeBasics');
  
      // Clear lists of ingredients, entered stuff and instructions
      document.getElementById('parsedIngredientsList').innerHTML = '';
      document.getElementById('entered-ingredients').innerHTML = '';
      document.getElementById('entered-instructions').innerHTML = '';
  
    } catch (err) {
      console.error("Error finalizing recipe:", err);
      alert("Something went wrong while saving.");
    }
  });

  document.getElementById('cancel-button').addEventListener('click', async () => { // user clicks "Clear Form"
    if (!currentRecipeId) { // no recipe, this wont work
      alert("No saved recipe to delete.");
      return;
    }
  
    const confirm1 = confirm("Are you sure you want to cancel and delete this recipe?"); // prompt to ensure user wants to do this
    if (!confirm1) return;
  
    const confirm2 = prompt('Please type "delete recipe" to confirm:'); // if they OK the above, then we ask them to enter "delete recipe
    if (confirm2?.toLowerCase() !== "delete recipe") {
      alert("Recipe NOT deleted. Confirmation failed.");
      return; // if not exactly that, we out
    }
  
    try {
      const response = await fetch(`http://3.84.112.227:3000/api/recipes/${currentRecipeId}`, { // passed all test, so delete that puppy
        method: 'DELETE'
      });
  
      if (!response.ok) {
        throw new Error("Server rejected the deletion.");
      }
  
      alert("Recipe deleted successfully.");
  
      //  again, clear all form fields
      document.getElementById('recipeName').value = '';
      document.getElementById('description').value = '';
      document.getElementById('servings').value = '';
      document.getElementById('foodCategory').value = '';
      document.getElementById('dishType').innerHTML = '';
  
      // again, clear all states
      selectedIngredientName = null;
      selectedIngredientUnits = {};
      currentRecipeId = null;
  
      // again clear local storage
      localStorage.removeItem('currentRecipeId');
      localStorage.removeItem('currentRecipeBasics');
  
      // Clear ingredient and instruction lists too
      document.getElementById('parsedIngredientsList').innerHTML = '';
      document.getElementById('entered-ingredients').innerHTML = '';
      document.getElementById('entered-instructions').innerHTML = '';
  
    } catch (err) {
      console.error("Error deleting recipe:", err);
      alert("An error occurred while deleting the recipe.");
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('ingredientSearchInput');
    const searchBtn = document.getElementById('ingredientSearchBtn');
    const resultsContainer = document.getElementById('ingredientSearchResults');
    searchInput.value = '';
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();       // prevent default form behavior
        searchBtn.click();        // trigger the same search
      }
    });
  
    const searchForm = document.getElementById('ingredientSearchForm');
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Stop form from actually submitting
    
      const query = searchInput.value.trim().toLowerCase();
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'none';
    
      if (!query) return;
    
      const collections = ['dessert_ingredients', 'appetizer_ingredients', 'main_course_ingredients', 'sauces_ingredients'];
      const allMatches = [];
    
      for (const collection of collections) {
        try {
          const response = await fetch(`http://3.84.112.227:3000/api/${collection}`);
          const data = await response.json();
          const matches = data.ingredients?.filter(item =>
            item.ingredient?.toLowerCase().includes(query)
          ).map(item => ({ name: item.ingredient, collection })) || [];
    
          allMatches.push(...matches);
        } catch (err) {
          console.error(`Error searching ${collection}:`, err);
        }
      }
    
      if (allMatches.length === 0) {
        resultsContainer.innerHTML = '<li>No matching ingredients found.</li>';
        resultsContainer.style.display = 'block';
        return;
      }
    
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'block';
    
      allMatches.forEach(({ name }) => {
        const li = document.createElement('li');
    
        const nameSpan = document.createElement('span');
        nameSpan.className = 'ingredient-name';
        nameSpan.textContent = name;
    
        const actionsSpan = document.createElement('span');
        actionsSpan.className = 'ingredient-actions';
    
        li.appendChild(nameSpan);
        li.appendChild(actionsSpan);
    
        li.title = 'Click to add quantity';
        li.addEventListener('click', () => {
          selectIngredient(name);
          document.getElementById('unit-preview-row')?.classList.remove('hidden');
        });
    
        resultsContainer.appendChild(li);
      });
    
      searchInput.value = ''; // ✅ Clears input after search
    });
    
  });
  
  
  
  function showElementById(id) { // used to show hidden elements when needed. I like the UI to look clean when no recipe has been started
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
  }
  
  // After saving recipe basics successfully, display the parsed-ingredient-list
  function handleRecipeBasicsSaved() {
    showElementById('parsedIngredientsList');
  }
  
  // After user clicks an ingredient and then a quantity button then show the preview row
  function handleIngredientSelectedAndQuantified() {
    showElementById('unit-preview-row');
  }
  
  // After ingredient is successfully added to the recipe - show the list of entered ingredients and the instructions entry form
  function handleIngredientAdded() {
    showElementById('ingredients-section');
    showElementById('instructions');           // Textarea
    showElementById('entered-instructions');   // List of instructions
    showElementById('instructions-form');
  }
  
  

