document.addEventListener('DOMContentLoaded', function() {
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

            var dishes = {
            desserts: [
                { value: "cake", name: "Cake" },
                { value: "pie", name: "Pie" },
                { value: "pudding", name: "Pudding" },
                { value: "icecream", name: "Ice Cream" },
                { value: "cookies", name: "Cookies" },
                { value: "sweetbreads", name: "Sweet Breads" }
            ],
            appetizers: [
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

            if (dishes[category]) {
                dishes[category].forEach(function(dish) {
                    var option = document.createElement('option');
                    option.value = dish.toLowerCase();
                    option.textContent = dish;
                    dishTypeSelect.appendChild(option);
                });
            }
        });
    } else {
        console.error('foodCategory select box not found');
    }
});

