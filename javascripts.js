document.addEventListener('DOMContentLoaded', function() {
    var blogData = {
        blogItems: [
            {title: "Delicious Recipes", description: "Discover new flavors with our weekly picks. Simple and tasty!", url: "/blog/delicious-recipes"},
            {title: "Healthy Eating", description: "Learn how to eat healthy while enjoying your meals.", url: "/blog/healthy-eating"},
            {title: "Kitchen Tips", description: "Get the best out of your kitchen with these useful tips.", url: "/blog/kitchen-tips"}
        ]
    };

    const renderedBlog = Mustache.render(blogTemplate, blogData);
    document.getElementById('blog-placeholder').innerHTML = renderedBlog;
  
    fetch('http://localhost:3000/api/recipes/random/4')
      .then(response => response.json())
      .then(data => {
          const recipeList = data.map(recipe => ({
              _id: recipe._id,
              url: "#",
              ariaLabel: `Go to Recipe - ${recipe.name}`,
              imageSrc: recipe.image || '/images/recipeaselogo.png',
              imageAlt: recipe.name,
              title: recipe.name,
              description: recipe.description || 'No description available.'
          }));

          const rendered = Mustache.render(recipeTemplate, { recipes: recipeList });
          document.getElementById('recipe-placeholder').innerHTML = rendered;

          document.querySelectorAll('.recipe a').forEach((anchor, index) => {
              anchor.addEventListener('click', function (event) {
                  event.preventDefault();
                  const recipeId = recipeList[index]._id;
                  showFullRecipe(recipeId);
              });
          });
      })
      .catch(error => {
          console.error("Error loading featured recipes:", error);
      });

 
    fetch('http://localhost:3000/api/recipes/random/4')
      .then(response => response.json())
      .then(data => {
          const renderedSlideshow = Mustache.render(slideshowTemplate, { recipes: data });
          document.getElementById('slideshow-placeholder').innerHTML = renderedSlideshow;

          document.querySelectorAll('.slideshow-image').forEach(img => {
            img.addEventListener('click', function () {
                const recipeId = this.getAttribute('data-id');
                showFullRecipe(recipeId);
            });
        });

          const slides = document.querySelectorAll('.slide');
          slides.forEach((slide, index) => {
              slide.style.display = index === 0 ? 'block' : 'none';
          });

          let current = 0;
          setInterval(() => {
              slides[current].style.display = 'none';
              current = (current + 1) % slides.length;
              slides[current].style.display = 'block';
          }, 5000);
      })
      .catch(error => {
          console.error("Error loading slideshow:", error);
          document.getElementById('slideshow-placeholder').innerHTML = "<p>Unable to load featured recipes at this time.</p>";
      });
});

function showFullRecipe(recipeId) {
    fetch(`http://localhost:3000/api/recipes/${recipeId}`)
      .then(response => response.json())
      .then(recipe => {

        function combineUnits(units) {
          const result = {};
          for (const [unit, count] of Object.entries(units)) {
              const match = unit.match(/^(\d\/\d) (.+)$/);
              if (match) {
                  const fraction = match[1];
                  const baseUnit = match[2];

                  const fracMap = {
                      "1/4": 0.25,
                      "1/3": 0.33,
                      "1/2": 0.5,
                      "3/4": 0.75
                  };

                  const fracValue = fracMap[fraction];
                  if (!fracValue) continue;

                  if (!result[baseUnit]) result[baseUnit] = 0;
                  result[baseUnit] += fracValue * count;
              } else {
                  if (!result[unit]) result[unit] = 0;
                  result[unit] += count;
              }
          }
          return result;
        }

        function formatQuantity(qty) {
          const whole = Math.floor(qty);
          const fraction = +(qty - whole).toFixed(2);

          const fracMap = {
            0.25: '1/4',
            0.33: '1/3',
            0.34: '1/3',
            0.5:  '1/2',
            0.75: '3/4'
          };

          const parts = [];
          if (whole > 0) parts.push(`${whole}`);
          if (fracMap[fraction]) parts.push(fracMap[fraction]);

          return parts.join(' + ') || qty.toString();
        }

        const ingredientsList = [];
        for (const [ingredientName, ingredientData] of Object.entries(recipe.ingredients || {})) {
          const combined = combineUnits(ingredientData.units || {});
          const parts = [];

          for (const [unit, qty] of Object.entries(combined)) {
            parts.push(`${formatQuantity(qty)} ${unit}`);
          }

          const line = `${parts.join(' + ').padEnd(20, ' ')} ${ingredientName}`;
          ingredientsList.push(line);
        }

        const recipeData = {
          name: recipe.name,
          category: recipe.category,
          type: recipe.type,
          image: recipe.image || '/images/recipeaselogo.png',
          description: recipe.description || 'No description available.',
          ingredients: ingredientsList,
          instructions: recipe.instructions || []
        };

        const rendered = Mustache.render(recipeDetailTemplate, recipeData);
        const fullPanel = document.getElementById('full-recipe-view');
        fullPanel.innerHTML = rendered;

        // Toggle visibility
        document.getElementById('recipe-placeholder').style.display = 'none';
        fullPanel.style.display = 'block';

        // Add close button handler
        fullPanel.querySelector('.close-button').addEventListener('click', () => {
          fullPanel.style.display = 'none';
          document.getElementById('recipe-placeholder').style.display = 'block';
        });
      })
      .catch(err => {
        console.error("Error loading recipe:", err);
      });
}

document.getElementById('view-account').addEventListener('click', () => {
    // Replace this with real user fetch logic later
    const mockUser = {
        email: 'user@example.com',
        username: 'RecipeFan99'
    };
    const html = Mustache.render(accountInfoTemplate, mockUser);
    document.getElementById('account-action-panel').innerHTML = html;
    document.getElementById('account-action-panel').style.display = 'block';
});

document.getElementById('change-credentials').addEventListener('click', () => {
    const html = Mustache.render(changeCredentialsTemplate, {});
    document.getElementById('account-action-panel').innerHTML = html;
    document.getElementById('account-action-panel').style.display = 'block';

    // Hook up submit logic later
    document.getElementById('update-form').addEventListener('submit', e => {
        e.preventDefault();
        const newEmail = document.getElementById('new-email').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        console.log("Submitted:", { newEmail, newPassword });

        // Add real API call to update user info here
    });
});

  
