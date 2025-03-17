const navTemplate = `
    <nav class="navigation">
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/search.html">Search</a></li>
            <li><a href="/enter.html">Enter</a></li>
            <li><a href="/share.html">Share</a></li>
            <li><a href="/signin.html">Login/Sign Up</a></li>
        </ul>
    </nav>`;

const footerTemplate = `
    <footer class="site-footer">
        <p>© 2024 Recip-Ease. All rights reserved.</p>
        <nav>
            <ul>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Use</a></li>
                <li><a href="/contact">Contact Us</a></li>
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
        <button class="favorite">Favorite</button>
    </li>
    {{/recipes}}
    </ul>
`;

const shareTemplate = `
<ul>
    {{#recipes}}
    <li>
        <h3>{{name}}</h3>
        <button class="see-full-recipe">Share to Socials</button>
        <button class="favorite">Email a Friend</button>
    </li>
    {{/recipes}}
    </ul>
`;