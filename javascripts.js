
document.addEventListener('DOMContentLoaded', function() {
    var blogData = {
        blogItems: [
            {title: "Delicious Recipes", description: "Discover new flavors with our weekly picks. Simple and tasty!", url: "/blog/delicious-recipes"},
            {title: "Healthy Eating", description: "Learn how to eat healthy while enjoying your meals.", url: "/blog/healthy-eating"},
            {title: "Kitchen Tips", description: "Get the best out of your kitchen with these useful tips.", url: "/blog/kitchen-tips"}
        ]
    };

    var blogRendered = Mustache.render(blogTemplate, blogData);
    document.querySelector('#blog-placeholder').innerHTML = blogRendered;
    
    var recipeData = {
        recipes: [
            {
                url: "/recipes/recipe1",
                ariaLabel: "Go to Recipe 1 - Delicious Pasta",
                imageSrc: "./images/recipe1.png",
                imageAlt: "Delicious Pasta",
                title: "Recipe Title 1",
                description: "This is a short description of the recipe. Delicious and easy to make!"
            },
            {
                url: "/recipes/recipe2",
                ariaLabel: "Go to Recipe 2 - Tasty Sushi",
                imageSrc: "./images/recipe2.png",
                imageAlt: "Tasty Sushi",
                title: "Recipe Title 2",
                description: "This is a short description of the recipe. Perfect for any dinner occasion!"
            },
            {
                url: "/recipes/recipe3",
                ariaLabel: "Go to Recipe 3 - Tasty Sushi",
                imageSrc: "./images/recipe3.png",
                imageAlt: "Tasty Sushi",
                title: "Recipe Title 2",
                description: "This is a short description of the recipe. Perfect for any dinner occasion!"
            },
            {
                url: "/recipes/recipe4",
                ariaLabel: "Go to Recipe 4 - Tasty Sushi",
                imageSrc: "./images/recipe4.png",
                imageAlt: "Tasty Sushi",
                title: "Recipe Title 2",
                description: "This is a short description of the recipe. Perfect for any dinner occasion!"
            }
        ]
    }

    var recipeRendered = Mustache.render(recipeTemplate, recipeData);
    document.getElementById('recipe-placeholder').innerHTML = recipeRendered;
});

