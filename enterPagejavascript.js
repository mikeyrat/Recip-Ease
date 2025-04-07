let currentUserId = null;

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
});

document.addEventListener('DOMContentLoaded', function() {
    var categoryData = {
        categories: [
            { value: "dessert_ingredients", name: "Desserts" },
            { value: "appetizer_ingredients", name: "Appetizers" },
            { value: "main_course_ingredients", name: "Main Courses" },
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
                alert(`Recipe saved! ID: ${currentRecipeId}`);
            } else {
                throw new Error(result.error || 'Failed to save recipe');
            }
        } catch (err) {
            console.error('Save failed:', err);
            alert('Error saving recipe. Please try again.');
        }
    });
});


