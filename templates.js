const navTemplate = `
    <nav class="navigation">
        <ul>
            <li><a href="/index.html">Home</a></li>
            <li><a href="/search.html">Search</a></li>
            <li><a href="/enter.html">Enter</a></li>
            <li><a href="/share.html">Share</a></li>
            <li><a href="/signin.html" id="login-nav-link">Login/Sign Up</a></li>
            <li><a href="#" id="hide-nav-link" class="recipe-entry">Hide Navigation</a></li>
        </ul>
    </nav>`;

    const footerTemplate = `
    <footer class="site-footer">
        <p>© 2025 MyRecipEase. All rights reserved.</p>
        <nav>
            <ul>
                <li><a href="/siteinfo.html#privacy">Privacy Policy</a></li>
                <li><a href="/siteinfo.html#terms">Terms of Use</a></li>
                <li><a href="/siteinfo.html#contact">Contact Us</a></li>
            </ul>
        </nav>
    </footer>`;

const blogTemplate = `
    <div class="blog-highlights">
        <h3>Blog Highlights</h3>
        {{#blogItems}}
        <div class="blog-item">
            <h4>{{title}}</h4>
            <p>{{description}}</p>
            <a href="{{url}}">Read more...</a>
        </div>
        {{/blogItems}}
    </div>`;

const recipeTemplate = `
    <div class="featured-recipes">
        {{#recipes}}
        <div class="recipe">
            <a href="{{url}}" aria-label="{{ariaLabel}}">
                <img src="{{imageSrc}}" alt="{{imageAlt}}">
                <h3>{{title}}</h3>
                <p>{{description}}</p>
                <span class="link-text">Read More</span>
            </a>
        </div>
        {{/recipes}}
    </div>`;

const buttonGridTemplate = `
    <div class="button-grid">
        {{#buttons}}
        <button>{{{label}}}</button>
        {{/buttons}}
    </div>`;

const categoryDropdownTemplate = `
    <select id="foodCategory" name="foodCategory">
        <option value="">Choose a category</option>
        {{#categories}}
        <option value="{{value}}">{{name}}</option>
        {{/categories}}
    </select>`;

const searchResultsTemplate = `
<ul>
    {{#recipes}}
    <li>
        <h3>{{name}}</h3>
        <button class="see-full-recipe">See Full Recipe</button>
    </li>
    {{/recipes}}
    </ul>
`;

const shareTemplate = `
<ul>
  {{#recipes}}
  <li>
    <h3>{{name}}</h3>
    <button class="share-recipe" data-id="{{_id}}">Share</button>
    <button class="preview-recipe" data-id="{{_id}}">Preview Recipe</button>
  </li>
  {{/recipes}}
</ul>
`;

const slideshowTemplate = `
<div class="slideshow-container">
    {{#recipes}}
    <div class="slide">
        <div class="image-wrapper">
            <img src="{{image}}" alt="{{name}}" width="500" height="500"
                 onerror="this.src='/images/recipeaselogo.png';"
                 class="slideshow-image"
                 data-id="{{_id}}">
            <div class="image-overlay top-overlay">{{name}}</div>
            <div class="image-overlay bottom-overlay">{{description}}</div>
        </div>
    </div>
    {{/recipes}}
</div>
`;

const recipeDetailTemplate = `
<div class="recipe-detail">
    <div class="recipe-header">
        <h2>{{name}}</h2>
        <p class="recipe-category">
            <strong>Category:</strong> {{category}} | 
            <strong>Type:</strong> {{type}} | 
            <strong>Servings:</strong> {{servings}}
        </p>
    </div>
    
    <div class="recipe-image-container">
        <img src="{{image}}" alt="{{name}}" onerror="this.src='/images/recipeaselogo.png'" />
    </div>

    <div class="recipe-description">
        <p>{{description}}</p>
    </div>

    <div class="recipe-ingredients">
        <h3>Ingredients</h3>
        <ul>
            {{#ingredients}}
            <li>{{.}}</li>
            {{/ingredients}}
        </ul>
    </div>

    <div class="recipe-instructions">
        <h3>Instructions</h3>
        <ol>
            {{#instructions}}
            <li>{{.}}</li>
            {{/instructions}}
        </ol>
    </div>

    <div class="closeout-buttons">
        <button class="close-button">Go Back</button>
    </div>
</div>
`;

const signupTemplate = `
<div class="signup-wrapper">
    
    <form id="signup-form">
    <h3>Create a New Account</h3>
        <div class="form-group">
            <input type="text" id="signup-first" placeholder="First Name" required>
        </div>
        <div class="form-group">
            <input type="text" id="signup-last" placeholder="Last Name" required>
        </div>
        <div class="form-group">
            <input type="text" id="signup-username" placeholder="Username" required>
        </div>
        <div class="form-group">
            <input type="email" id="signup-email" placeholder="Email" required>
        </div>
        <div class="form-group">
            <input type="password" id="signup-password" placeholder="Password" required>
        </div>
        <div class="form-group">
            <input type="password" id="signup-password-confirm" placeholder="Confirm Password" required>
        </div>
        <div class="login-button-container">
            <button type="submit" class="recipe-entry">Register</button>
            <button type="button" class="recipe-entry cancel-signup">Cancel</button>
        </div>
    </form>
    <div id="signup-message" style="margin-top: 10px;"></div>
</div>
`;

const accountInfoTemplate = `
<h3>Your Account Info</h3>
<p><strong>First Name:</strong> {{firstName}}</p>
<p><strong>Last Name:</strong> {{lastName}}</p>
<p><strong>Username:</strong> {{username}}</p>
<p><strong>Email:</strong> {{email}}</p>
`;

const changeCredentialsTemplate = `
<h3>Change Your Email or Password</h3>
<form id="update-form">
    <label for="new-email">New Email:</label><br>
    <input type="email" id="new-email" name="new-email" placeholder="Leave blank to keep current"><br><br>

    <label for="new-password">New Password:</label><br>
    <input type="password" id="new-password" name="new-password" placeholder="Leave blank to keep current"><br><br>

    <label for="new-password-confirm">Confirm New Password:</label><br>
    <input type="password" id="new-password-confirm" name="new-password-confirm" placeholder="Re-enter new password"><br><br>

    <div class="login-button-container">
        <button type="submit" class="recipe-entry">Submit Changes</button>
        <button type="button" class="recipe-entry cancel-update">Cancel</button>
    </div>
</form>
`;

