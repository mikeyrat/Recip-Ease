let currentUserId = null;
let selectedIngredientName = null;
let selectedIngredientUnits = {};

document.addEventListener('DOMContentLoaded', function () {
  // Wait a short moment for the dropdown template to finish rendering
  setTimeout(() => {
    const savedRecipeId = localStorage.getItem('currentRecipeId');
    const savedBasics = localStorage.getItem('currentRecipeBasics');

    if (savedBasics) {
      const data = JSON.parse(savedBasics);

      // Set text fields
      document.getElementById('recipeName').value = data.name || '';
      document.getElementById('description').value = data.description || '';
      document.getElementById('servings').value = data.servings || '';

      // Get the newly-rendered selects
      const foodCategorySelect = document.getElementById('foodCategory');
      const dishTypeSelect = document.getElementById('dishType');

      if (foodCategorySelect) {
        foodCategorySelect.value = data.category;
        foodCategorySelect.dispatchEvent(new Event('change'));
      }

      // Delay setting dish type until options are available
      let retries = 0;
      const interval = setInterval(() => {
        const dishTypeSelect = document.getElementById('dishType'); // refresh reference
        const optionExists = dishTypeSelect && Array.from(dishTypeSelect.options).some(
          opt => opt.value === data.type
        );
        if (optionExists || retries > 10) {
          if (dishTypeSelect) {
            dishTypeSelect.value = data.type;
          }
          clearInterval(interval);
        }
        retries++;
      }, 100);

      currentRecipeId = parseInt(savedRecipeId);
      if (currentRecipeId) {
        renderEnteredInstructions(currentRecipeId);
        renderEnteredIngredients(currentRecipeId).then(addedIngredients => {
          // Remove used ingredients from the suggestion list
          document.querySelectorAll('.parsed-ingredients-list li').forEach(li => {
            const text = li.textContent.trim().toLowerCase();
            addedIngredients.forEach(name => {
              if (text.includes(name.toLowerCase())) {
                li.remove();
              }
            });
          });
        });
      }
    }
  }, 200); // Delay start until template is rendered
});


document.addEventListener('DOMContentLoaded', function() {
    sharedPageInit();

    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
        currentUserId = parseInt(storedUserId);
    } else {
        alert("You must be signed in to create a recipe.");
        window.location.href = "/signin.html"; 
    }
    var buttonData = {
        buttons: [
            { label: "Cup" },
            { label: "1/2<br>Cup" },
            { label: "1/4<br>Cup" },
            { label: "1/3<br>Cup" },
            { label: "TBSP" },
            { label: "1/2<br>TBSP" },
            { label: "TSP" },
            { label: "1/2<br>TSP" },
            { label: "Oz." },
            { label: "Gms." },
            { label: "Qty" },
            { label: "Other" }
        ]
    };
    var buttonGridRendered = Mustache.render(buttonGridTemplate, buttonData);
    document.getElementById('button-grid-placeholder').innerHTML = buttonGridRendered;
    document.querySelectorAll('.button-grid button').forEach(button => {
        button.addEventListener('click', () => {
          if (!selectedIngredientName) {
            alert("Please select an ingredient first.");
            return;
          }
      
          const unitLabel = button.innerHTML.replace(/<br\s*\/?>/gi, ' ').trim();
          selectedIngredientUnits[unitLabel] = (selectedIngredientUnits[unitLabel] || 0) + 1;
      
          console.log(`Unit selected: ${unitLabel} (${selectedIngredientUnits[unitLabel]})`);
        });
      });
});

document.addEventListener('DOMContentLoaded', function() {
    var categoryData = {
        categories: [
            { value: "dessert_ingredients", name: "Desserts" },
            { value: "appetizer_ingredients", name: "Appetizers" },
            { value: "main_course_ingredients", name: "Main Courses" },
            { value: "sauces_ingredients", name: "Marinades and Sauces" },
        ]
    };

    var renderedDropdown = Mustache.render(categoryDropdownTemplate, categoryData);
    var foodCategoryDropdown = document.getElementById('foodCategoryDropdown');
    foodCategoryDropdown.innerHTML = renderedDropdown;

    var foodCategorySelect = document.getElementById('foodCategory');
    if (foodCategorySelect) {
        foodCategorySelect.addEventListener('change', function() {
            var category = this.value;
            var dishTypeSelect = document.getElementById('dishType');
            dishTypeSelect.innerHTML = ''; 

             var normalized = category.replace('_ingredients', '').replace('main_course', 'maincourses');

            var dishes = {
                dessert: [
                    { value: "cake", name: "Cake" },
                    { value: "pie", name: "Pie" },
                    { value: "pudding", name: "Pudding" },
                    { value: "icecream", name: "Ice Cream" },
                    { value: "cookies", name: "Cookies" },
                    { value: "sweetbreads", name: "Sweet Breads" }
                ],
                appetizer: [
                    { value: "fingerfoods", name: "Finger Foods" },
                    { value: "dips", name: "Dips & Spreads" },
                    { value: "wings", name: "Wings & Things" }
                ],
                maincourses: [
                    { value: "beef", name: "Beef" },
                    { value: "chicken", name: "Chicken" },
                    { value: "casseroles", name: "Casseroles" },
                    { value: "soups", name: "Soups" },
                    { value: "pork", name: "Pork" },
                    { value: "vegetarian", name: "Vegetarian" }
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

        if (dishes[normalized]) {
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

document.addEventListener('DOMContentLoaded', function () {
    const recipeForm = document.getElementById('recipeForm');

    recipeForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const recipeData = {
            name: document.getElementById('recipeName').value.trim(),
            category: document.getElementById('foodCategory').value.trim(),
            type: document.getElementById('dishType').value.trim(),
            description: document.getElementById('description').value.trim(),
            servings: document.getElementById('servings').value.trim(),
            user_id: currentUserId
        };

        // Basic validation
        if (!recipeData.name || !recipeData.category || !recipeData.type) {
            alert("Please fill in the required fields: name, category, and type.");
            return;
        }

        try {
            const response = await fetch('http://3.84.112.227:3000/api/recipes/basicinfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recipeData)
            });

            const result = await response.json();

            if (response.ok && result.recipe_id) {
                currentRecipeId = result.recipe_id;
                localStorage.setItem('currentRecipeId', currentRecipeId);
                localStorage.setItem('currentRecipeBasics', JSON.stringify(recipeData));
                //alert(`Recipe saved! ID: ${currentRecipeId}`);
            } else {
                throw new Error(result.error || 'Failed to save recipe');
            }
        } catch (err) {
            console.error('Save failed:', err);
            alert('Error saving recipe. Please try again.');
        }
    });
});

function loadIngredients(category, type) {
    const listContainer = document.getElementById('parsedIngredientsList');
    if (!listContainer) return;
  
    if (!category || !type) {
      listContainer.innerHTML = "<p>Please select both category and type.</p>";
      return;
    }
  
    fetch(`http://3.84.112.227:3000/api/${category}?types=${type}`)
      .then(response => response.json())
      .then(data => {
        if (!data.ingredients || data.ingredients.length === 0) {
          listContainer.innerHTML = "<p>No ingredients found for this selection.</p>";
          return;
        }
  
        // Sort by usage_count descending
        const sortedIngredients = data.ingredients.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
  
        const ul = document.createElement('ul');
        sortedIngredients.forEach(item => {
            const li = document.createElement('li');
          
            const nameSpan = document.createElement('span');
            nameSpan.className = 'ingredient-name';
            nameSpan.textContent = item.ingredient;
          
            const actionsSpan = document.createElement('span');
            actionsSpan.className = 'ingredient-actions';
          
            li.appendChild(nameSpan);
            li.appendChild(actionsSpan);
          
            // Make entire row clickable
            li.style.cursor = 'pointer';
            li.title = 'Click to add quantity';
          
            li.addEventListener('click', () => {
              selectIngredient(item.ingredient);
            });
          
            ul.appendChild(li);
          });
  
        listContainer.innerHTML = '';
        listContainer.appendChild(ul);
      })
      .catch(err => {
        console.error("Error fetching ingredients:", err);
        listContainer.innerHTML = "<p>Error loading ingredients.</p>";
      });
  }

  function selectIngredient(ingredientName) {
    selectedIngredientName = ingredientName;
    selectedIngredientUnits = {}; // reset the unit counts
  
    // Highlight the selected ingredient
    document.querySelectorAll('.parsed-ingredients-list li').forEach(li => {
      li.style.backgroundColor = '';
    });
  
    const selectedLi = Array.from(document.querySelectorAll('.parsed-ingredients-list li'))
      .find(li => li.textContent.includes(ingredientName));
    if (selectedLi) {
      selectedLi.style.backgroundColor = '#fff3dc';
    }
  
    console.log(`Selected: ${ingredientName}`);
  }
  
  
  // Add event listener on both category and type selectors
  document.addEventListener('DOMContentLoaded', () => {
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
  
  document.querySelector('.ingredient-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    if (!selectedIngredientName || Object.keys(selectedIngredientUnits).length === 0) {
      alert("Please select an ingredient and at least one unit.");
      return;
    }
  
    if (!currentRecipeId) {
      alert("Please save recipe basics first.");
      return;
    }
  
    try {
      const isDivided = document.getElementById('divided')?.checked || false;

      const response = await fetch(`http://3.84.112.227:3000/api/recipes/${currentRecipeId}/ingredients`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedIngredientName,
          units: selectedIngredientUnits,
          divided: isDivided
        })
      });

  
      const result = await response.json();
  
      if (response.ok) {
        // alert(`Added ${selectedIngredientName} to recipe.`);
        selectedIngredientName = null;
        selectedIngredientUnits = {};
        document.getElementById('divided').checked = false;
        document.querySelectorAll('.parsed-ingredients-list li').forEach(li => li.style.backgroundColor = '');
      
        // Refresh list
        const addedIngredients = await renderEnteredIngredients(currentRecipeId);

        document.querySelector('#parsedIngredientsList ul')?.querySelectorAll('li')?.forEach(li => {
          const text = li.textContent.trim().toLowerCase();
          addedIngredients.forEach(name => {
            if (text.includes(name.toLowerCase())) {
              li.remove();
            }
          });
        });
      } else {
        throw new Error(result.error || "Failed to add ingredient");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving ingredient.");
    }
  });

  document.querySelector('.instructions-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const textarea = document.getElementById('instructions');
    const stepText = textarea.value.trim();
  
    if (!stepText) {
      alert("Please enter some instruction text.");
      return;
    }
  
    if (!currentRecipeId) {
      alert("Please save recipe basics first.");
      return;
    }
  
    try {
      const response = await fetch(`http://3.84.112.227:3000/api/recipes/${currentRecipeId}/instructions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ push: { instructions: stepText } })
      });
  
      const result = await response.json();
  
      if (response.ok) {
        textarea.value = '';
        await renderEnteredInstructions(currentRecipeId);
      } else {
        throw new Error(result.error || "Failed to add instruction.");
      }
    } catch (err) {
      console.error("Error saving instruction:", err);
      alert("Failed to save instruction.");
    }
  });
  

  async function renderEnteredIngredients(recipeId) {
    recipeId = parseInt(recipeId);
    try {
      const response = await fetch(`http://3.84.112.227:3000/api/recipes/${recipeId}`);
      const recipe = await response.json();
  
      if (!recipe || !recipe.ingredients || Object.keys(recipe.ingredients).length === 0) {
        console.log("No ingredients to display.");
        const container = document.getElementById('entered-ingredients');
        if (container) container.innerHTML = "<p>No ingredients added yet.</p>";
        return [];
      }
  
      const lines = formatIngredients(recipe.ingredients);
      const container = document.getElementById('entered-ingredients');
      if (!container) return [];
  
      const ul = document.createElement('ul');
      lines.forEach(line => {
        const li = document.createElement('li');
        li.textContent = line;
        li.style.cursor = 'pointer';
        li.title = 'Click to interact (future use)';
        li.addEventListener('click', () => {
          console.log(`Clicked entered ingredient: ${line}`);
        });
        ul.appendChild(li);
      });
  
      container.innerHTML = '';
      container.appendChild(ul);
  
      return Object.keys(recipe.ingredients); // return names for cross-filtering
    } catch (err) {
      console.error("Error loading entered ingredients:", err);
      return [];
    }
  }

  async function renderEnteredInstructions(recipeId) {
    try {
      const response = await fetch(`http://3.84.112.227:3000/api/recipes/${recipeId}`);
      const recipe = await response.json();
  
      const container = document.getElementById('entered-instructions');
      if (!container) return;
  
      if (!recipe.instructions || recipe.instructions.length === 0) {
        container.innerHTML = "<p>No instructions added yet.</p>";
        return;
      }
  
      const ol = document.createElement('ol');
      recipe.instructions.forEach((step, index) => {
        const li = document.createElement('li');
        li.textContent = step;
        li.style.cursor = 'pointer';
        li.title = 'Click to edit or remove (future)';
        ol.appendChild(li);
      });
  
      container.innerHTML = '';
      container.appendChild(ol);
    } catch (err) {
      console.error("Error loading instructions:", err);
    }
  }

  document.getElementById('saveRecipeBtn').addEventListener('click', async () => {
    if (!currentRecipeId) {
      alert("No recipe to save.");
      return;
    }
  
    // Fetch the recipe to get its ingredients
    try {
      const response = await fetch(`http://3.84.112.227:3000/api/recipes/${currentRecipeId}`);
      const recipe = await response.json();
  
      if (!recipe || !recipe.ingredients) {
        alert("No ingredients to finalize.");
        return;
      }
  
      const ingredientNames = Object.keys(recipe.ingredients || {});
      const collection = recipe.category || 'unknown';
  
      // Increment usage count for each ingredient
      for (const ingredient of ingredientNames) {
        const safeIngredient = encodeURIComponent(ingredient);
        const safeCollection = encodeURIComponent(collection);
        await fetch(`http://3.84.112.227:3000/api/${safeCollection}/${safeIngredient}/increment`, {
          method: 'PUT'
        });
      }
  
      alert("Recipe saved!");
  
      // Clear form fields
      document.getElementById('recipeName').value = '';
      document.getElementById('description').value = '';
      document.getElementById('servings').value = '';
      document.getElementById('foodCategory').value = '';
      document.getElementById('dishType').innerHTML = '';
  
      // Clear selected state
      selectedIngredientName = null;
      selectedIngredientUnits = {};
      currentRecipeId = null;
  
      // Clear local storage
      localStorage.removeItem('currentRecipeId');
      localStorage.removeItem('currentRecipeBasics');
  
      // Clear lists
      document.getElementById('parsedIngredientsList').innerHTML = '';
      document.getElementById('entered-ingredients').innerHTML = '';
      document.getElementById('entered-instructions').innerHTML = '';
  
    } catch (err) {
      console.error("Error finalizing recipe:", err);
      alert("Something went wrong while saving.");
    }
  });

  document.getElementById('cancel-button').addEventListener('click', async () => {
    if (!currentRecipeId) {
      alert("No saved recipe to delete.");
      return;
    }
  
    const confirm1 = confirm("Are you sure you want to cancel and delete this recipe?");
    if (!confirm1) return;
  
    const confirm2 = prompt('Please type "delete recipe" to confirm:');
    if (confirm2?.toLowerCase() !== "delete recipe") {
      alert("Recipe NOT deleted. Confirmation failed.");
      return;
    }
  
    try {
      const response = await fetch(`http://3.84.112.227:3000/api/recipes/${currentRecipeId}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) {
        throw new Error("Server rejected the deletion.");
      }
  
      alert("Recipe deleted successfully.");
  
      // Clear all form fields
      document.getElementById('recipeName').value = '';
      document.getElementById('description').value = '';
      document.getElementById('servings').value = '';
      document.getElementById('foodCategory').value = '';
      document.getElementById('dishType').innerHTML = '';
  
      // Clear state
      selectedIngredientName = null;
      selectedIngredientUnits = {};
      currentRecipeId = null;
  
      // Clear local storage
      localStorage.removeItem('currentRecipeId');
      localStorage.removeItem('currentRecipeBasics');
  
      // Clear ingredient and instruction lists
      document.getElementById('parsedIngredientsList').innerHTML = '';
      document.getElementById('entered-ingredients').innerHTML = '';
      document.getElementById('entered-instructions').innerHTML = '';
  
    } catch (err) {
      console.error("Error deleting recipe:", err);
      alert("An error occurred while deleting the recipe.");
    }
  });
  
  
  
  

