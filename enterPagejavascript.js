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
            //{ value: "breakfast", name: "Breakfast" },
            { value: "appetizer_ingredients", name: "Appetizers" },
          //  { value: "salads", name: "Salads" },
            { value: "main_course_ingredients", name: "Main Courses" },
         //   { value: "drinks", name: "Drinks" }
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
                desserts: ["Cake", "Pie", "Pudding", "Ice Cream", "Cookies", "Sweet Breads"],
               // breakfast: ["Pancakes", "Omelet", "Porridge", "Eggs", "Waffles", "Casseroles"],
                appetizers: ["Finger Foods", "Dips & Spreads",  "Wings & Things"],
              //  salads: ["Potato Salad", "Macaroni Salad", "Caesar Salads", "Salads with Protien"],
                maincourses: ["Beef", "Chicken", "Casseroles", "Soups", "Pork", "Vegetarian"],
              //  drinks: ["After Dinner", "Margaritas", "Cocktails", "Martinis"]
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

