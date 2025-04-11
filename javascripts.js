// MyRecipEase.com by Michael Forman
// Prepared for Maryville University Masters of Programming Capstone Project, Dr. Joseph Gradecki
// Copyright 2024-2025 Michael Forman - All rights reserved.

//Main shared javascript functions and DOM loads

document.addEventListener('DOMContentLoaded', function() { //When page loads, gather the data for the blog entries on the left side Nav bar. 
    if (window.location.pathname.endsWith('siteinfo.html')) { // siteinfo.html needs it own load due to its nature this 'IF' is all about that 
        const nav = document.getElementById('navigation-placeholder'); // give it nav
        const footer = document.getElementById('footer-placeholder'); // give it the footer
        const content = document.querySelector('.centerCol'); // Only real data is in centercol on this one

        if (nav) nav.innerHTML = navTemplate;
        if (footer) footer.innerHTML = footerTemplate;

        if (content) {
            content.innerHTML += `
                
            `;
        }

        return; // if the page loading isn't siteinfo.html, then move along, nothing to see here.
    }

    const loginNavLink = document.getElementById('login-nav-link');  // regular page loads, fire up nav
        const userId = localStorage.getItem('userId');
        if (loginNavLink && userId) { // check to see who's logged in, if anyone
            fetch(`http://3.84.112.227:3000/api/users/${userId}`) // fetch username from id
                .then(res => res.json())
                .then(user => {
                    if (user && user.username) {
                        loginNavLink.textContent = `Logged in as ${user.username}`; // fill menu button
                        loginNavLink.href = '/signin.html'; // Still link to account page
                    }
                })
                .catch(err => {
                    console.error("Couldn't fetch user info for nav link:", err);
                });
        } else if (loginNavLink) {
            loginNavLink.textContent = "Click to Sign In";
        }

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

    fetch('http://3.84.112.227:3000/api/recipes/random/4') // fetch 4 random recipes for display in the featured recipes at the bottom
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

 
    fetch('http://3.84.112.227:3000/api/recipes/random/4') // this funtion is almost the same as above, but we are loading the recipes for the "slideshow display" at the top.
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
        

function showFullRecipe(recipeId) { // Main function to display recipes in a variety of places
    fetch(`http://3.84.112.227:3000/api/recipes/${recipeId}`) // get the recipe by its id
      .then(response => response.json())
      .then(recipe => {
        const recipeData = { //once we have the json, here how we are filling the objects in the recipeData array for display
          name: recipe.name,
          category: recipe.category,
          type: recipe.type,
          image: recipe.image || '/images/recipeaselogo.png',
          description: recipe.description || 'No description available.',
          servings: recipe.servings || "N/A",
          ingredients: formatIngredients(recipe.ingredients || {}), // while we're filling objects, lets format the ingredients correctly
          instructions: recipe.instructions || []
        };
  
        const rendered = Mustache.render(recipeDetailTemplate, recipeData); // grab the recipeDetailTemplate and fill it with the data
        const fullPanel = document.getElementById('full-recipe-view'); // put it in the display panel...
  
        if (!fullPanel) { // ... assuming it exists
          console.error("Missing #full-recipe-view container");
          return;
        }
  
        fullPanel.innerHTML = rendered; // render it
  
        const recipeBlock = document.getElementById('recipe-placeholder'); // look for the placeholder and put it there
        const searchBlock = document.getElementById('search-results-placeholder'); // or in search block if from search page
  
        if (recipeBlock && recipeBlock.style) recipeBlock.style.display = 'none'; // determine where its going to be displayed, as search page is different
        if (searchBlock && searchBlock.style) searchBlock.style.display = 'none';
        fullPanel.style.display = 'block';
  
        const resultsHeader = document.getElementById('results-header'); // prepare and set the headers depending on where used
        const featuredHeader = document.getElementById('featured-header');
  
        if (resultsHeader) resultsHeader.textContent = 'Full Recipe:';
        if (featuredHeader) featuredHeader.textContent = 'Full Recipe:';
  
        const closeButton = fullPanel.querySelector('.close-button');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            fullPanel.style.display = 'none';
            if (recipeBlock && recipeBlock.style) recipeBlock.style.display = 'block';
            if (searchBlock && searchBlock.style) searchBlock.style.display = 'block';
  
            const resultsHeader = document.getElementById('results-header');
            const featuredHeader = document.getElementById('featured-header');
  
            if (resultsHeader) resultsHeader.textContent = 'Search Results:';
            if (featuredHeader) featuredHeader.textContent = 'Featured Recipes';
          });
        }
      })
      .catch(err => {
        console.error("Error loading recipe:", err);
      });
  }
  

function formatIngredients(ingredientsObj) { // ingredients are stored like {'All-purpose flour': { units: { Cup: 2, '1/2 Cup': 1 } }
    function combineUnits(units) { // but they need to read "2 + 1/2 Cups All-purpose flour. So..."
      const result = {}; // we do all these gymnastics... first to convert fractions to decimal
      for (const [unit, count] of Object.entries(units)) {
        const match = unit.match(/^([1-9]\/[1-9]) (.+)$/); // look for fractions e.g., '1/2 Cup'
        if (match) {
          const fraction = match[1]; // if its a fraction, then we do this
          const baseUnit = match[2]; // if its a full unit "2 Cups" we fill baseUnit here
          const fracMap = { // converts fractions to decimale
            "1/8": 0.125,
            "1/4": 0.25,
            "1/3": 0.33,
            "1/2": 0.5,
            "3/4": 0.75
          };
          const fracValue = fracMap[fraction]; // look up fraction on map
          if (!fracValue) continue; // not a fraction move along with loop
          if (!result[baseUnit]) result[baseUnit] = 0; // no baseUnit, then ingredient is only fraction like "1/4 Cup"
          result[baseUnit] += fracValue * count; // multiply fraction value * number of units for that item like "2/3 Cup" would be { units: '1/3 Cup': 2 } }
        } else {
          if (!result[unit]) result[unit] = 0; // if you have 3 1/3 cup, then make it 1 cup
          result[unit] += count;
        }
      }
      return result;
    }
  
    function formatQuantity(qty) { // believe it or not, once we convert frac to decimal, we have to go back for display
      const whole = Math.floor(qty);
      const fraction = +(qty - whole).toFixed(2);
      const fracMap = { // convert decimals back to fractions
        0.125: '1/8',
        0.25: '1/4',
        0.33: '1/3',
        0.34: '1/3',
        0.375: '3/8',
        0.5:  '1/2',
        0.625: '5/8',
        0.66: '2/3',
        0.67: '2/3',
        0.68: '2/3',
        0.75: '3/4',
        0.875: '7/8'
      };
      const parts = [];
      if (whole > 0) parts.push(`${whole}`); // create the strings for display
      if (fracMap[fraction]) parts.push(fracMap[fraction]);
      return parts.join(' + ') || qty.toString();
    }
  
    const output = []; // Now combine all the unit quantities and ingredient names in to a nice readable line
    for (const [ingredientName, ingredientData] of Object.entries(ingredientsObj || {})) {
      const combined = combineUnits(ingredientData.units || {});
      const parts = [];
      for (const [unit, qty] of Object.entries(combined)) {
        parts.push(`${formatQuantity(qty)} ${unit}`);
      }
      const dividedNote = ingredientData.divided ? " (divided)" : ""; // if the "divided" check box is checked, then put that into the string
        const line = `${parts.join(' + ').padEnd(20, ' ')} ${ingredientName}${dividedNote}`;
      output.push(line);
    }
    return output;
  }

