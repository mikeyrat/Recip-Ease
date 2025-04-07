require('dotenv').config();
const express = require('express'); // framework for node.js
const mongoose = require('mongoose'); // yeah, the DB!!
const cors = require('cors'); // cross origin resource sharing - allow connection to the db without browsers hiccups
const bcrypt = require('bcrypt'); // encrypts passwords and keeps them hiden

const app = express(); // create web app and port 
const port = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const db = mongoose.connection; //instantiate our connection as "db"
const validCollections = ['recipes', 'dessert_ingredients', 'appetizer_ingredients', 'main_course_ingredients', 'users']; // we use this const in several routes
const validIngredientCollections = [ // this is just the ingredients collections, used much later
    "dessert_ingredients",
    "appetizer_ingredients",
    "main_course_ingredients"
];
const validUnits = new Set([ // list of quantities so when recipes are entered only these will work.
    "Cup", "1/2<br>Cup", "1/4<br>Cup", "1/3<br>Cup",
    "TBSP", "1/2<br>TBSP", "TSP", "1/2<br>TSP",
    "Oz.", "Gms.", "Qty", "Other"
]);

db.once('open', () => console.log('Connected to MongoDB')); //establist the MongoDB connection



app.get('/api/recipes/search', async (req, res) => { // route to search recipes by keyword or type
    try {
        const { query } = req.query; //load the query from express' req object (the info about the incoming http request. req is everywhere)

        if (!query) { // malformed query, or call to api that is wrong
            return res.status(400).json({ error: "Search query is required." });
        }

        const collection = mongoose.connection.collection('recipes'); //set the collection variable for the search

        const searchResults = await collection.find({ // build the payload for the db query
            $or: [
                { name: { $regex: query, $options: "i" } }, // recipe name?
                { category: { $regex: query, $options: "i" } }, // recipe category?
                { type: { $regex: query, $options: "i" } },// recipe type?
                { description: { $regex: query, $options: "i" } },
                {
                    $expr: {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: { $objectToArray: "$ingredients" },
                              as: "ingredient",
                              cond: {
                                $regexMatch: {
                                  input: "$$ingredient.k",
                                  regex: query,
                                  options: "i"
                                }
                              }
                            }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }).toArray();

        if (searchResults.length === 0) { // no results? Whoops
            return res.status(404).json({ error: "No recipes found matching your search." });
        }

        res.json(searchResults); //search results come back as json, so send them to the calling script that way
    } catch (err) {
        console.error("Error searching recipes:", err); // catches odd errors
        res.status(500).json({ error: err.message }); // return error message to calling script
    }
});

app.get('/api/recipes/random/:count', async (req, res) => { // route to call random amount of recipes for display
    try {
        const count = parseInt(req.params.count); // parse the count parameter to an integer
        const collection = mongoose.connection.collection('recipes'); // set collection

        const totalRecipes = await collection.countDocuments(); // if recipes db is empty (never!) error
        if (totalRecipes === 0) {
            return res.status(404).json({ error: "No recipes found." });
        }
		
        const randomRecipes = await collection.aggregate([ // grab all the recipes, and randomly select 'count" of them
            { $sample: { size: Math.min(count, totalRecipes) } },
            { $project: { _id: 1, name: 1, image: 1, description: 1 } } // only looking for these fields, though for the slideshow or features
        ]).toArray();

        res.json(randomRecipes);
    } catch (err) {
        console.error("Error fetching random recipes:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/:collectionName', async (req, res) => { //generic route that gets documents from the chosen collection
    try {
        const { collectionName } = req.params; // the collectionName is sent as a parameterized variable to prevent outside interference 
        const { types } = req.query; 

        const collection = mongoose.connection.collection(collectionName); // loads "collection" variable with "collectionName" from URL

        if (validIngredientCollections.includes(collectionName)) { // checks to see if 'collection' is in the global const array validCollections
            let query = {};

            if (types) { 
                query.types = { $in: [types.toLowerCase()] }; // if 'type" i sent, make sure it's lowercase like in the collection
            }
                    // most of the above is preparing the payload for the GET statement
            let ingredients = await collection.find(query).toArray();

            if (ingredients.length === 0) {
                return res.status(404).json({ error: `No ingredients found for type '${types}'.` });
            } 

            return res.json({ collection: collectionName, types: types || null, ingredients });
        }

        if (!validCollections.includes(collectionName)) {
            return res.status(400).json({ error: "Invalid collection name." });
        }
            // await the response then load into array
        const data = await collection.find().toArray();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:id', async (req, res) => { // get the user document based on their ID this is used for a lot of purposes
    try {
        const userId = parseInt(req.params.id);
        const collection = mongoose.connection.collection('users');

        const user = await collection.findOne(
            { _id: userId },
            { projection: { password_hash: 0 } } // tells mongo to exclude hashed passwords from results of this query
        );

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/:collectionName/:id?', async (req, res) => { // generic route to find documents is any collection by ID.
    try {
        const { collectionName, id } = req.params;
        console.log(`Incoming request for: /api/${collectionName}/${id || "ALL"}`);

        if (!validCollections.includes(collectionName)) {
            console.log(`Invalid collection: ${collectionName}`);
            return res.status(400).json({ error: "Invalid collection name." });
        }

        const collection = mongoose.connection.collection(collectionName);

        if (id) {
            const docId = parseInt(id);
            console.log(`Searching for _id: ${docId} in ${collectionName}`);
            const document = await collection.findOne({ _id: docId });

            if (!document) {
                console.log(`No document found with _id: ${docId} in ${collectionName}`);
                return res.status(404).json({ error: `${collectionName.slice(0, -1)} not found.` });
            }

            console.log(`Document found:`, document);
            return res.json(document);
        }

        const data = await collection.find().toArray();
        res.json(data);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/users/register', async (req, res) => { // first POST... this is the route to create new user account
    try {
        const { username, email, password, firstName, lastName } = req.body; // we want to make fields for all of these, though...

        if (!username || !email || !password) { // ... these are the only one's required
            return res.status(400).json({ error: "Username, email, and password are required." });
        }

        const collection = mongoose.connection.collection('users'); // these lines check if email exists in user base
        const existingUser = await collection.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email." });
        } 

        const existingUsername = await collection.findOne({ username }); // these lines check if username exists in user base

        if (existingUsername) {
            return res.status(400).json({ error: "User already exists with this username." });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // hash the pass
        const timestamp = new Date().toISOString();

        const lastUser = await collection.find().sort({ _id: -1 }).limit(1).toArray(); // get the user with the highest user ID so we can make a unique one
        const newUserId = lastUser.length > 0 ? lastUser[0]._id + 1 : 1; // increment the last so the new user is one higher

        const newUser = { //create the payload to add the user document
            _id: newUserId,
            username,
            email,
            password_hash: hashedPassword, 
            created_at: timestamp,
            updated_at: timestamp,
			firstName: firstName || "", //no name leave blank
			lastName: lastName || ""
        };

        const result = await collection.insertOne(newUser); 

        res.status(201).json({ message: "User added successfully", insertedId: result.insertedId }); // return status or error
    } catch (err) {
        console.error("Error inserting user:", err);  //troubleshooting don't need
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users/login', async (req, res) => { //route to log in peeps
    try {
        const { username, password } = req.body; // get ur username and pass

        if (!username || !password) { //empty PHHFFFT!
            return res.status(400).json({ error: "username and password are required." });
        }

        const collection = mongoose.connection.collection('users'); //set collection

        const user = await collection.findOne({ username }); // look for username

        if (!user) { //nope? phhffftt!
            return res.status(401).json({ error: "Invalid username or password." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash); //pass good? bad? deal with it
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        res.json({ message: "Login successful", userId: user._id }); // yay 
        localStorage.setItem('userId', result.userId);
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/recipes/basicinfo", async (req, res) => { // route to store basic recipe document on entry page
  try {
		const { name, category, type, description, servings, user_id } = req.body; // only require basic info at first, build on ingredients and instuctions

        if (!user_id || isNaN(user_id)) {
            return res.status(400).json({ error: "Valid user_id is required." });
        }

		if (!name || !category || !type) { // need all the info bud
		  return res.status(400).json({ error: "Missing required fields" });
		}
		
		const lastRecipe = await db.collection("recipes").find().sort({ _id: -1 }).limit(1).toArray(); // find highest id in collection
		const newRecipeId = lastRecipe.length > 0 ? lastRecipe[0]._id + 1 : 1;  // increment for our id

		const newRecipe = { // build payload
		  _id: newRecipeId,
		  user_id: parseInt(user_id),  
		  name,
		  category,
		  type,
		  description: description || "",  // Default empty description
          servings: servings || "",
		  ingredients: {},  // Default empty object for ingredients
		  instructions: [],  // Default empty array for instructions
		  created_at: new Date(),
		  updated_at: new Date(),
		  image: ""  // Default empty image field
		};

		const recipe = await db.collection("recipes").insertOne(newRecipe); // add to collection
		res.status(201).json({ 
		  message: "Basic recipe information created successfully",  // yup good
		  recipe_id: recipe.insertedId 
		});
	  } catch (err) {
		console.error("Error inserting recipe:", err); // not so good dont need this line later
		res.status(500).json({ error: "Failed to create recipe" });
	}
});

app.post('/api/recipes', async (req, res) => { //may not use this one after all
    try {
        const { user_id, name, category, type, ingredients, instructions, image, servings, description } = req.body;

        if (!user_id || !name || !category || !type || !ingredients || !instructions) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        if (isNaN(user_id)) {
            return res.status(400).json({ error: "User ID must be an integer." });
        }

        if (typeof ingredients !== "object" || Array.isArray(ingredients)) {
            return res.status(400).json({ error: "Ingredients must be an object with ingredient names as keys." });
        }

        if (!Array.isArray(instructions)) {
            return res.status(400).json({ error: "Instructions must be an array." });
        }

        const collection = mongoose.connection.collection('recipes');
        const timestamp = new Date(); 

        const lastRecipe = await collection.find().sort({ _id: -1 }).limit(1).toArray();
        const newRecipeId = lastRecipe.length > 0 ? lastRecipe[0]._id + 1 : 1;

        const newRecipe = {
            _id: newRecipeId,  
            user_id: parseInt(user_id),  
            name,
            category,
            type,
            description: description || "",  // Default empty description
            servings: servings || "",
            ingredients,  
            instructions,
            created_at: timestamp,  
            updated_at: timestamp,  
            image: image || "" 
        };

        const result = await collection.insertOne(newRecipe);

        res.status(201).json({ message: "Recipe added successfully", insertedId: result.insertedId });
    } catch (err) {
        console.error("Error inserting recipe:", err);
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/:collectionName', async (req, res) => { // general POST for any collection. Likely not used by anyone but admins
    try {
        const { collectionName } = req.params;

        if (collectionName === 'users') { // except users... no one makes users
            return res.status(403).json({ error: "Unauthorized to add users through this endpoint." });
        }

        if (!validCollections.includes(collectionName)) { // must be valid collection
            return res.status(400).json({ error: "Invalid collection name." });
        }

        const newData = req.body; // payload comes from javascript, no assembly (here) required
        if (!newData || Object.keys(newData).length === 0) {
            return res.status(400).json({ error: "Request body is empty." });
        }

        const collection = mongoose.connection.collection(collectionName); // fire away, whatever you sent
        const result = await collection.insertOne(newData);

        res.status(201).json({ message: "Document added successfully", insertedId: result.insertedId }); // lets hope
    } catch (err) {
        console.error("Error inserting document:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => { // change user email or password
    try {
        const userId = parseInt(req.params.id);
        const { email, password, firstName, lastName } = req.body; // this could be problem unless checked on java script side. first and last not required on acct creation

        if (!email && !password) { // one of the other bro, or both
            return res.status(400).json({ error: "At least one field (email or password) is required for update." });
        }

        const collection = mongoose.connection.collection('users');
        let updateFields = { updated_at: new Date().toISOString() };

        if (email) updateFields.email = email;
		if (firstName) updateFields.firstName = firstName; // need to test... what if empty?
		if (lastName) updateFields.lastName = lastName; // same same

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.password_hash = hashedPassword;
        }

        const result = await collection.updateOne({ _id: userId }, { $set: updateFields }); // fire away

        if (result.matchedCount === 0) { // whoops no user by that ID. someone messed up
            return res.status(404).json({ error: "User not found." });
        }

        res.json({ message: "User updated successfully", modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error("Error updating user:", err); // testing remove later
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/recipes/:id/ingredients', async (req, res) => { // add or update ingredients to recipe document
    try {
        const { id } = req.params; // gotta have recipe id
        const docId = parseInt(id);  // gotta be int
        const { name, quantity, unit } = req.body; // gotta have all this stuff

        if (!name || quantity === undefined || !unit) { // gotta have it all bro or you dont go
            return res.status(400).json({ error: "Ingredient name, quantity, and unit are required." });
        }

        if (!validUnits.has(unit)) { //validUnits from above the first route
            return res.status(400).json({ error: `Invalid unit. Accepted units: ${[...validUnits].join(", ")}` });
        }

        const collection = mongoose.connection.collection('recipes');

        const recipe = await collection.findOne({ _id: docId }); // first check to see if you have the recipe
        if (!recipe) { // no recipe no PUT
            return res.status(404).json({ error: "Recipe not found." });
        }

        const result = await collection.updateOne( // all good, so PUT
            { _id: docId },
            { $set: { [`ingredients.${name}`]: { quantity, unit } } }
        );

        if (result.matchedCount === 0) { // thought we'd been here, but check again for like error checking
            return res.status(404).json({ error: "Recipe not found." });
        }

        res.json({ message: "Ingredient added/updated successfully", modifiedCount: result.modifiedCount }); //yay
    } catch (err) {
        console.error("Error updating ingredient:", err);  /// troubleshooting delete later
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/recipes/:id/instructions', async (req, res) => { // PUT for adding - updating instructions in a recipe
    try {
        const { id } = req.params; // only required paramaters is the recipe id
        const docId = parseInt(id); // make int
        const updateData = req.body;  // instantiate variable for payload

        if (!updateData.push || !updateData.push.instructions) { // gotta have text
            return res.status(400).json({ error: "Instruction text is required." });
        }

        const collection = mongoose.connection.collection('recipes'); // open connection
        const recipe = await collection.findOne({ _id: docId }); // is recipe there?

        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found." }); // sorry no instructions for you!
        }

        if (!Array.isArray(recipe.instructions)) { // some older recipes may not have instructions as array, if so fix
            console.log("Fixing invalid instructions field..."); // troubleshooting remove plz later
            await collection.updateOne({ _id: docId }, { $set: { instructions: [] } }); // OK, insert that puppy
        }

        const result = await collection.updateOne(
            { _id: docId },
            { $push: { instructions: updateData.push.instructions } }
        );

        if (result.matchedCount === 0) { // 'sall good?
            return res.status(404).json({ error: "Recipe not found." }); //nope
        }

        res.json({ message: "Instruction added successfully", modifiedCount: result.modifiedCount }); //yay!
    } catch (err) {
        console.error("Error updating recipe:", err); //troubleshooting remove later
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/:collection/:ingredient/increment', async (req, res) => {  // the magic behind the site!!! this route updates an ingredient's popularity
    try {
        const { collection, ingredient } = req.params; // need the collection name and ingredient (three diff collections for recipe ingredients)

        if (!validIngredientCollections.includes(collection)) { // confirm collection is on the list
            return res.status(400).json({ error: "Invalid ingredient collection name." });
        }

        const collectionRef = mongoose.connection.collection(collection); //open collection

        console.log(`Incrementing usage count for ingredient: ${ingredient} in collection: ${collection}`); //so cool!

        const ingredientId = parseInt(ingredient); // grab and parse the current usage_count

        const result = await collectionRef.updateOne( //once you have it increment it
            { $or: [{ ingredient: ingredient }, { _id: ingredientId }] }, 
            { $inc: { usage_count: 1 } }
        );

        if (result.matchedCount === 0) { // whoopsie. we shouldnt see this tho, because this is called immediately after being added to a recipe
            return res.status(404).json({ error: `Ingredient '${ingredient}' not found in ${collection}.` });
        } // there may be a modification here if for a stretch item we add custom ingredients later

        res.json({ message: `Usage count incremented for '${ingredient}'.`, modifiedCount: result.modifiedCount }); //yay!
    } catch (err) {
        console.error("Error updating ingredient usage count:", err); // damn! but delete after testing
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/recipes/:id', async (req, res) => { //update recipe documents in general
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "Update data is required." }); // gotta have a payload or no thanks
        }

        const collection = mongoose.connection.collection('recipes');
        const docId = parseInt(id); 

        updateData.updated_at = new Date(); // the rest of the payload gotta come from the javascript tho

        const result = await collection.updateOne(
            { _id: docId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) { // no recipe, no update
            return res.status(404).json({ error: "Recipe not found." });
        }
 
        res.json({ message: "Recipe updated successfully", modifiedCount: result.modifiedCount }); // yay!
    } catch (err) {
        console.error("Error updating recipe:", err); // remove after testing
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/:collectionName/:id', async (req, res) => {  //generic PUT for updating about any collection document. Admins only right now
    try {
        const { collectionName, id } = req.params;
        const updateData = req.body;
        const docId = parseInt(id);
        const collection = mongoose.connection.collection(collectionName);

        if (!validCollections.includes(collectionName)) {
            return res.status(400).json({ error: "Invalid collection name." });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "Update data is required." });
        }

        let updateOperation = { $set: { updated_at: new Date().toISOString() } };

        if (updateData.push && updateData.push.instructions) { // instructions is special case, so treat it so if the PUT includes them
            const document = await collection.findOne({ _id: docId });
            if (!document) {
                return res.status(404).json({ error: "Document not found." });
            }
            if (!Array.isArray(document.instructions)) {
                await collection.updateOne({ _id: docId }, { $set: { instructions: [] } });
            }
            updateOperation.$push = { instructions: updateData.push.instructions };
        }

        if (updateData.set) {
            updateOperation.$set = { ...updateOperation.$set, ...updateData.set };
        }

        if (updateData.pull) {
            for (const field in updateData.pull) {
                updateOperation.$pull = { [field]: updateData.pull[field] };
            }
        }

        const result = await collection.updateOne({ _id: docId }, updateOperation);

        if (result.matchedCount === 0) { // basic error handling from here forward
            return res.status(404).json({ error: "Document not found." });
        }

        res.json({ message: "Document updated successfully", modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error("Error updating document:", err); // remove after test
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/recipes/:id/instructions', async (req, res) => { // DELETE route for instructions of a recipe
    try {
        const { id } = req.params;
        const docId = parseInt(id);
        const { instructions } = req.body; // these bastids are special case, so get their own route

        if (!instructions) {
            return res.status(400).json({ error: "Instruction text is required for deletion." }); // tell me what to remove
        }

        const collection = mongoose.connection.collection('recipes');

        const recipe = await collection.findOne({ _id: docId }); // open connection, find the recipe

        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found." }); //whoopsie
        }

        if (!Array.isArray(recipe.instructions)) { // instructions may not be array
            return res.status(400).json({ error: "`instructions` field is missing or not an array." });
        }

        const result = await collection.updateOne(
            { _id: docId },
            { $pull: { instructions: instructions } }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ error: "Instruction not found in recipe." }); // cant find what you want daggonit!
        }

        res.json({ message: "Instruction removed successfully", modifiedCount: result.modifiedCount }); // Ok I found it and deleted it
    } catch (err) {
        console.error("Error deleting instruction:", err); //troubleshooting remove later
        res.status(500).json({ error: err.message }); 
    }
});

app.delete('/api/recipes/:id/ingredients', async (req, res) => { // deleting ingredients are kinda different
    try {
        const { id } = req.params;
        const docId = parseInt(id);
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Ingredient name is required for deletion." }); // same checks as above
        }

        const collection = mongoose.connection.collection('recipes');

        const recipe = await collection.findOne({ _id: docId }); //same as above
        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found." });
        }

        if (!recipe.ingredients || !recipe.ingredients[name]) {
            return res.status(400).json({ error: `Ingredient '${name}' not found in the recipe.` }); // sorry no lime juice here to delete
        }

        const result = await collection.updateOne(
            { _id: docId },
            { $unset: { [`ingredients.${name}`]: "" } }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ error: `Ingredient '${name}' could not be removed.` }); // OK, its gone now
        }

        res.json({ message: `Ingredient '${name}' removed successfully`, modifiedCount: result.modifiedCount }); //NOTE: if we remove the recipe we may need to decrement the usage_count. Stretch item?
    } catch (err) {
        console.error("Error deleting ingredient:", err); // troubleshooting remove later
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/recipes/:id', async (req, res) => { //General find and delete a whole recipe typical stuff here yadda yadda
    try {
        const docId = parseInt(req.params.id);
        const collection = mongoose.connection.collection('recipes');

        const recipe = await collection.findOne({ _id: docId });

        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found." });
        }

        const result = await collection.deleteOne({ _id: docId });

        if (result.deletedCount === 0) {
            return res.status(500).json({ error: "Failed to delete the recipe." });
        }

        res.json({ message: "Recipe deleted successfully", deletedId: docId });
    } catch (err) {
        console.error("Error deleting recipe:", err);
        res.status(500).json({ error: err.message });
    }
});


app.listen(port, () => { // glad someone is listening... my wife says I never do
    console.log(`Server running on http://localhost:${port}`);
});
