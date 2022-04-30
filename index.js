const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

//Mongodb config
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xkali.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

// API Endpoints
async function run() {
    try {
        await client.connect();
        const inventoryItemsCollection = client
            .db("groceryWDB")
            .collection("inventoryItems");

        const categoriesCollection = client.db("groceryWDB").collection("categories");

        //////////////////////////
        //// Insert Operations ////
        //////////////////////////

        //Inserting single inventory item
        app.post("/inventoryItem", async (req, res) => {
            const inventoryItem = req.body;
            const result = await inventoryItemsCollection.insertOne(inventoryItem);
            res.send(result);
        });

        //Inserting single category
        app.post("/category", async (req, res) => {
            const category = req.body;
            const result = await categoriesCollection.insertOne(category);
            res.send(result);
        });

        ////////////////////////
        //// Find Operations ////
        ////////////////////////

        //Getting category by id
        app.get("/category/:id", async (req, res) => {
            const categoryId = req.params.id;
            const query = { _id: ObjectId(categoryId) };
            const category = await categoriesCollection.findOne(query);
            res.send(category);
        });

        //Getting all categories
        app.get("/categories", async (req, res) => {
            const query = {};
            const cursor = categoriesCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        });

        //////////////////////////
        //// Update Operations ////
        //////////////////////////

        //Updating single category
        app.put("/category/:id", async (req, res) => {
            const categoryId = req.params.id;
            const updatedCategory = req.body;
            const filter = { _id: ObjectId(categoryId) };
            const updateDoc = {
                $set: {
                    ...updatedCategory,
                },
            };
            const options = { upsert: true };
            const result = await categoriesCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        //////////////////////////
        //// Delete Operations ///
        //////////////////////////

        //Deleting single category
        app.delete("/category/:id", async (req, res) => {
            const categoryId = req.params.id;
            const filter = { _id: ObjectId(categoryId) };
            const result = await categoriesCollection.deleteOne(filter);
            res.send(result);
        });
    } finally {
    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("welcome to grocery warehouse server");
});

//Serving to port
app.listen(port, () => {
    console.log("grocery-warehouse-server is listening to port:", port);
});
