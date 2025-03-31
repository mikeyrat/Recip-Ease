document.addEventListener('DOMContentLoaded', function() { //When page loads, gather the data for the blog entries on the left side Nav bar. 
    var blogData = {  // future plans is this loads from real blogs via API
        blogItems: [
            {title: "Delicious Recipes", description: "Discover new flavors with our weekly picks. Simple and tasty!", url: "/blog/delicious-recipes"},
            {title: "Healthy Eating", description: "Learn how to eat healthy while enjoying your meals.", url: "/blog/healthy-eating"},
            {title: "Kitchen Tips", description: "Get the best out of your kitchen with these useful tips.", url: "/blog/kitchen-tips"}
        ]
    };

    const renderedBlog = Mustache.render(blogTemplate, blogData); // call the mushache template with the above array of data
    const blogHolder = document.getElementById('blog-placeholder'); // when called by the html, render it
    if (blogHolder) blogHolder.innerHTML = renderedBlog;

    fetch('http://localhost:3000/api/recipes/random/4') // fetch 4 random recipes for display in the featured recipes at the bottom
      .then(response => response.json())
      .then(data => {
          const recipeList = data.map(recipe => ({ //create a list from the response using a map of recipe name, image, imageAlt, title and description
              _id: recipe._id,
              url: "#",
              ariaLabel: `Go to Recipe - ${recipe.name}`,
              imageSrc: recipe.image || '/images/recipeaselogo.png', // if a recipe has no image, use the site logo
              imageAlt: recipe.name,
              title: recipe.name,
              description: recipe.description || 'No description available.'
          }));

          const rendered = Mustache.render(recipeTemplate, { recipes: recipeList }); // send the list to Mustache to fill the template
          const recipeHolder = document.getElementById('recipe-placeholder'); // render it when called.
          if (recipeHolder) recipeHolder.innerHTML = rendered;
          document.querySelectorAll('.recipe a').forEach((anchor, index) => { 
              anchor.addEventListener('click', function (event) { //wait for user to click a link for a recipe
                  event.preventDefault();
                  const recipeId = recipeList[index]._id; // grab the right recipe from the list
                  showFullRecipe(recipeId); // send it to the function to show the whole recipe
              });
          });
      })
      .catch(error => { // catch stupid error like me not having node.js running lol (a lot)
          console.error("Error loading featured recipes:", error);
      });

 
    fetch('http://localhost:3000/api/recipes/random/4') // this funtion is almost the same as above, but we are loading the recipes for the "slideshow display" at the top.
      .then(response => response.json())
      .then(data => {
          const renderedSlideshow = Mustache.render(slideshowTemplate, { recipes: data }); // gotta love Mustache
          const slideshowHolder = document.getElementById('slideshow-placeholder'); // render it when page loads
          if (slideshowHolder) slideshowHolder.innerHTML = renderedSlideshow;

          document.querySelectorAll('.slideshow-image').forEach(img => {  // wait for that click
            img.addEventListener('click', function () {
                const recipeId = this.getAttribute('data-id');
                showFullRecipe(recipeId); // show the whole recipe at the bottom in place of Featured Recipes
            });
        });

        const slides = document.querySelectorAll('.slide'); // show the slides

        if (slides.length > 0) {
            slides.forEach((slide, index) => {
                slide.style.display = index === 0 ? 'block' : 'none';
            });
        
            let current = 0;
            setInterval(() => {
                slides[current].style.display = 'none';
                current = (current + 1) % slides.length;
                slides[current].style.display = 'block';
            }, 5000); // interval is 5 seconds. Change this to make it longer or shorter
        }
        })
        .catch(error => {
            console.error("Error loading slideshow:", error);
            const placeholder = document.getElementById('slideshow-placeholder');
            if (placeholder) {
                placeholder.innerHTML = "<p>Unable to load featured recipes at this time.</p>";
            }
        });
});
        

function showFullRecipe(recipeId) { // the function the whole site will use to display the recipes.
    fetch(`http://localhost:3000/api/recipes/${recipeId}`) // grab the recipe using it's ID
      .then(response => response.json())
      .then(recipe => {

        function combineUnits(units) {  // tough part here. We need to convert data like "Flour": "Quantity": [ {"Cup": 2}, {"1/2 Cup": 1}] or some such into "2-1/2 Cups Flour" for display
          const result = {};
          for (const [unit, count] of Object.entries(units)) {
              const match = unit.match(/^(\d\/\d) (.+)$/); // first discern whether a unit is a whole number (Cup) or a fraction (1/2 Cup)
              if (match) {
                  const fraction = match[1];
                  const baseUnit = match[2];

                  const fracMap = { // quick map to convert fractions to decimals
                      "1/4": 0.25,
                      "1/3": 0.33,
                      "1/2": 0.5,
                      "3/4": 0.75
                  };

                  const fracValue = fracMap[fraction];
                  if (!fracValue) continue;

                  if (!result[baseUnit]) result[baseUnit] = 0; // if no whole cups, then move on
                  result[baseUnit] += fracValue * count; // add the fractions to the whole if any
              } else {
                  if (!result[unit]) result[unit] = 0;
                  result[unit] += count;
              }
          }
          return result; // All of the above was to add various fractions like 3/4 cup to whole cups to combine different measures into one "measure"
        }

        function formatQuantity(qty) { //now we go backwards to make the display read right.
          const whole = Math.floor(qty);
          const fraction = +(qty - whole).toFixed(2);

          const fracMap = { //mapping back from 2.5 cups to be 2-1/2 cups
            0.25: '1/4',
            0.33: '1/3',
            0.34: '1/3',
            0.5:  '1/2',
            0.75: '3/4'
          };

          const parts = [];
          if (whole > 0) parts.push(`${whole}`); 
          if (fracMap[fraction]) parts.push(fracMap[fraction]);

          return parts.join(' + ') || qty.toString();// the whole units and the fractions are combined here
        }

        const ingredientsList = []; //create a array list to prepare the ingredients for display
        for (const [ingredientName, ingredientData] of Object.entries(recipe.ingredients || {})) {
          const combined = combineUnits(ingredientData.units || {}); // call the function to combine the ingredient units from "Quantity": [ {"Cup": 2}, {"1/2 Cup": 1}] to "Cups: 2.5"
          const parts = [];

          for (const [unit, qty] of Object.entries(combined)) {
            parts.push(`${formatQuantity(qty)} ${unit}`); //Converts "Cups: 2.5" to "2-1/2 Cups" for display in the recipes which is how cooks expect to read it
          }

          const line = `${parts.join(' + ').padEnd(20, ' ')} ${ingredientName}`; //display each line
          ingredientsList.push(line);
        }

        const recipeData = { // variable that holds the recipe data any time it is gathered from database or input from user on enter page
          name: recipe.name,
          category: recipe.category,
          type: recipe.type,
          image: recipe.image || '/images/recipeaselogo.png',
          description: recipe.description || 'No description available.',
          ingredients: ingredientsList,
          instructions: recipe.instructions || []
        };

        const rendered = Mustache.render(recipeDetailTemplate, recipeData); // load the Mustache template
        const fullPanel = document.getElementById('full-recipe-view'); // where the recipe will be shown

        if (!fullPanel) {
            console.error("Missing #full-recipe-view container");
            return;
        }

        fullPanel.innerHTML = rendered;

        // Toggle visibility to hide either featured recipes or search results
        const recipeBlock = document.getElementById('recipe-placeholder'); // used on index.html
        const searchBlock = document.getElementById('search-results-placeholder'); // used on search.html

        if (recipeBlock && recipeBlock.style) recipeBlock.style.display = 'none';
        if (searchBlock && searchBlock.style) searchBlock.style.display = 'none';
        fullPanel.style.display = 'block';

        // Add close button handler at the bottom of the recipe panel
        const closeButton = fullPanel.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                fullPanel.style.display = 'none';
                if (recipeBlock && recipeBlock.style) recipeBlock.style.display = 'block';
                if (searchBlock && searchBlock.style) searchBlock.style.display = 'block';
            });
        }
        })
        .catch(err => {
            console.error("Error loading recipe:", err);
        });
}

