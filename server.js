const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/recip_ease')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const db = mongoose.connection;
const validCollections = ['recipes', 'dessert_ingredients', 'appetizer_ingredients', 'main_course_ingredients', 'users'];
const validIngredientCollections = [
    "dessert_ingredients",
    "appetizer_ingredients",
    "main_course_ingredients"
];
const validUnits = new Set([
    "Cup", "1/2<br>Cup", "1/4<br>Cup", "1/3<br>Cup",
    "TBSP", "1/2<br>TBSP", "TSP", "1/2<br>TSP",
    "Oz.", "Gms.", "Qty", "Other"
]);

db.once('open', () => console.log('Connected to MongoDB'));



app.get('/api/recipes/search', async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Search query is required." });
        }

        const collection = mongoose.connection.collection('recipes');

        const searchResults = await collection.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
                { type: { $regex: query, $options: "i" } }
            ]
        }).toArray();

        if (searchResults.length === 0) {
            return res.status(404).json({ error: "No recipes found matching your search." });
        }

        res.json(searchResults);
    } catch (err) {
        console.error("Error searching recipes:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/recipes/random/:count', async (req, res) => {
    try {
        const count = parseInt(req.params.count);
        const collection = mongoose.connection.collection('recipes');

        const totalRecipes = await collection.countDocuments();
        if (totalRecipes === 0) {
            return res.status(404).json({ error: "No recipes found." });
        }
		
        const randomRecipes = await collection.aggregate([
            { $sample: { size: Math.min(count, totalRecipes) } },
            { $project: { _id: 1, name: 1, image: 1 } } 
        ]).toArray();

        res.json(randomRecipes);
    } catch (err) {
        console.error("Error fetching random recipes:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/:collectionName', async (req, res) => {
    try {
        const { collectionName } = req.params;
        const { types } = req.query;

        const collection = mongoose.connection.collection(collectionName);

        if (validIngredientCollections.includes(collectionName)) {
            let query = {};

            if (types) {
                query.types = { $in: [types.toLowerCase()] };
            }

            let ingredients = await collection.find(query).toArray();

            if (ingredients.length === 0) {
                return res.status(404).json({ error: `No ingredients found for type '${types}'.` });
            }

            return res.json({ collection: collectionName, types: types || null, ingredients });
        }

        if (!validCollections.includes(collectionName)) {
            return res.status(400).json({ error: "Invalid collection name." });
        }

        const data = await collection.find().toArray();
        res.json(data);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const collection = mongoose.connection.collection('users');

        const user = await collection.findOne(
            { _id: userId },
            { projection: { password_hash: 0 } }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/:collectionName/:id?', async (req, res) => {
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
        console.log(`Returning ${data.length} documents from ${collectionName}`);
        res.json(data);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/users/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required." });
        }

        const collection = mongoose.connection.collection('users');
        const existingUser = await collection.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const timestamp = new Date().toISOString();

        const lastUser = await collection.find().sort({ _id: -1 }).limit(1).toArray();
        const newUserId = lastUser.length > 0 ? lastUser[0]._id + 1 : 1;

        const newUser = {
            _id: newUserId,
            username,
            email,
            password_hash: hashedPassword,
            created_at: timestamp,
            updated_at: timestamp
        };

        const result = await collection.insertOne(newUser);

        res.status(201).json({ message: "User added successfully", insertedId: result.insertedId });
    } catch (err) {
        console.error("Error inserting user:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required." });
        }

        const collection = mongoose.connection.collection('users');
        const lastUser = await collection.find().sort({ _id: -1 }).limit(1).toArray();
        const newUserId = lastUser.length > 0 ? lastUser[0]._id + 1 : 1;

        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const timestamp = new Date().toISOString();

        const newUser = {
            _id: newUserId,
            username,
            email,
            password_hash: hashedPassword,
            created_at: timestamp,
            updated_at: timestamp
        };

        const result = await collection.insertOne(newUser);
        res.status(201).json({ message: "User added successfully", insertedId: result.insertedId });
    } catch (err) {
        console.error('Error inserting user:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "username and password are required." });
        }

        const collection = mongoose.connection.collection('users');

        const user = await collection.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        res.json({ message: "Login successful", userId: user._id });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/recipes/basicinfo", async (req, res) => {
  try {
		const { name, category, type, description } = req.body;

		if (!name || !category || !type) {
		  return res.status(400).json({ error: "Missing required fields" });
		}
		
		const lastRecipe = await db.collection("recipes").find().sort({ _id: -1 }).limit(1).toArray();
		const newRecipeId = lastRecipe.length > 0 ? lastRecipe[0]._id + 1 : 1; 

		const newRecipe = {
		  _id: newRecipeId,
		  user_id: 1,  // Assuming a single-user system for now
		  name,
		  category,
		  type,
		  description: description || "",  // Default empty description
		  ingredients: {},  // Default empty object for ingredients
		  instructions: [],  // Default empty array for instructions
		  created_at: new Date(),
		  updated_at: new Date(),
		  image: ""  // Default empty image field
		};

		const recipe = await db.collection("recipes").insertOne(newRecipe);
		res.status(201).json({ 
		  message: "Basic recipe information created successfully", 
		  recipe_id: recipe.insertedId 
		});
	  } catch (err) {
		console.error("Error inserting recipe:", err);
		res.status(500).json({ error: "Failed to create recipe" });
	}
});

app.post('/api/recipes', async (req, res) => {
    try {
        const { user_id, name, category, type, ingredients, instructions, image } = req.body;

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


app.post('/api/:collectionName', async (req, res) => {
    try {
        const { collectionName } = req.params;

        if (collectionName === 'users') {
            return res.status(403).json({ error: "Unauthorized to add users through this endpoint." });
        }

        if (!validCollections.includes(collectionName)) {
            return res.status(400).json({ error: "Invalid collection name." });
        }

        const newData = req.body;
        if (!newData || Object.keys(newData).length === 0) {
            return res.status(400).json({ error: "Request body is empty." });
        }

        const collection = mongoose.connection.collection(collectionName);
        const result = await collection.insertOne(newData);

        res.status(201).json({ message: "Document added successfully", insertedId: result.insertedId });
    } catch (err) {
        console.error("Error inserting document:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { email, password } = req.body;

        if (!email && !password) {
            return res.status(400).json({ error: "At least one field (email or password) is required for update." });
        }

        const collection = mongoose.connection.collection('users');
        let updateFields = { updated_at: new Date().toISOString() };

        if (email) updateFields.email = email;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.password_hash = hashedPassword;
        }

        const result = await collection.updateOne({ _id: userId }, { $set: updateFields });

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json({ message: "User updated successfully", modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/recipes/:id/ingredients', async (req, res) => {
    try {
        const { id } = req.params;
        const docId = parseInt(id);
        const { name, quantity, unit } = req.body;

        if (!name || quantity === undefined || !unit) {
            return res.status(400).json({ error: "Ingredient name, quantity, and unit are required." });
        }

        if (!validUnits.has(unit)) {
            return res.status(400).json({ error: `Invalid unit. Accepted units: ${[...validUnits].join(", ")}` });
        }

        const collection = mongoose.connection.collection('recipes');

        const recipe = await collection.findOne({ _id: docId });
        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found." });
        }

        const result = await collection.updateOne(
            { _id: docId },
            { $set: { [`ingredients.${name}`]: { quantity, unit } } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Recipe not found." });
        }

        res.json({ message: "Ingredient added/updated successfully", modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error("Error updating ingredient:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/recipes/:id/instructions', async (req, res) => {
    try {
        const { id } = req.params;
        const docId = parseInt(id);
        const updateData = req.body; 

        if (!updateData.push || !updateData.push.instructions) {
            return res.status(400).json({ error: "Instruction text is required." });
        }

        const collection = mongoose.connection.collection('recipes');
        const recipe = await collection.findOne({ _id: docId });

        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found." });
        }

        if (!Array.isArray(recipe.instructions)) {
            console.log("Fixing invalid instructions field...");
            await collection.updateOne({ _id: docId }, { $set: { instructions: [] } });
        }

        const result = await collection.updateOne(
            { _id: docId },
            { $push: { instructions: updateData.push.instructions } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Recipe not found." });
        }

        res.json({ message: "Instruction added successfully", modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error("Error updating recipe:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/:collection/:ingredient/increment', async (req, res) => {
    try {
        const { collection, ingredient } = req.params;

        if (!validIngredientCollections.includes(collection)) {
            return res.status(400).json({ error: "Invalid ingredient collection name." });
        }

        const collectionRef = mongoose.connection.collection(collection);

        console.log(`Incrementing usage count for ingredient: ${ingredient} in collection: ${collection}`);

        const ingredientId = parseInt(ingredient);

        const result = await collectionRef.updateOne(
            { $or: [{ ingredient: ingredient }, { _id: ingredientId }] }, 
            { $inc: { usage_count: 1 } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: `Ingredient '${ingredient}' not found in ${collection}.` });
        }

        res.json({ message: `Usage count incremented for '${ingredient}'.`, modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error("Error updating ingredient usage count:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "Update data is required." });
        }

        const collection = mongoose.connection.collection('recipes');
        const docId = parseInt(id); 

        updateData.updated_at = new Date(); 

        const result = await collection.updateOne(
            { _id: docId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Recipe not found." });
        }

        res.json({ message: "Recipe updated successfully", modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error("Error updating recipe:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/:collectionName/:id', async (req, res) => {
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

        if (updateData.push && updateData.push.instructions) {
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

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Document not found." });
        }

        res.json({ message: "Document updated successfully", modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error("Error updating document:", err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/recipes/:id/instructions', async (req, res) => {
    try {
        const { id } = req.params;
        const docId = parseInt(id);
        const { instructions } = req.body;

        if (!instructions) {
            return res.status(400).json({ error: "Instruction text is required for deletion." });
        }

        const collection = mongoose.connection.collection('recipes');

        const recipe = await collection.findOne({ _id: docId });

        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found." });
        }

        if (!Array.isArray(recipe.instructions)) {
            return res.status(400).json({ error: "`instructions` field is missing or not an array." });
        }

        const result = await collection.updateOne(
            { _id: docId },
            { $pull: { instructions: instructions } }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ error: "Instruction not found in recipe." });
        }

        res.json({ message: "Instruction removed successfully", modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error("Error deleting instruction:", err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/recipes/:id/ingredients', async (req, res) => {
    try {
        const { id } = req.params;
        const docId = parseInt(id);
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Ingredient name is required for deletion." });
        }

        const collection = mongoose.connection.collection('recipes');

        const recipe = await collection.findOne({ _id: docId });
        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found." });
        }

        if (!recipe.ingredients || !recipe.ingredients[name]) {
            return res.status(400).json({ error: `Ingredient '${name}' not found in the recipe.` });
        }

        const result = await collection.updateOne(
            { _id: docId },
            { $unset: { [`ingredients.${name}`]: "" } }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ error: `Ingredient '${name}' could not be removed.` });
        }

        res.json({ message: `Ingredient '${name}' removed successfully`, modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error("Error deleting ingredient:", err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/recipes/:id', async (req, res) => {
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


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
