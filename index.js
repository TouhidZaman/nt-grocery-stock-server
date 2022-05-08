const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
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
        //// JWT Token Area   ////
        //////////////////////////
        app.post("/login", async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.send({ accessToken });
        });

        //////////////////////////
        //// Insert Operations ////
        //////////////////////////

        //Inserting single inventory item
        app.post("/inventory-items", async (req, res) => {
            const inventoryItem = req.body;
            const result = await inventoryItemsCollection.insertOne(inventoryItem);
            res.send(result);
        });

        //Inserting single category
        app.post("/categories", async (req, res) => {
            const category = req.body;
            const result = await categoriesCollection.insertOne(category);
            res.send(result);
        });

        ////////////////////////
        //// Find Operations ////
        ////////////////////////

        //Getting inventory item by id
        app.get("/inventory-items/:id", async (req, res) => {
            const itemId = req.params.id;
            // console.log(itemId);
            try {
                const query = { _id: ObjectId(itemId) };
                const result = await inventoryItemsCollection.findOne(query);
                res.send(result);
            } catch {
                res.status(400).send({ message: "invalid item id" });
            }
        });

        //Getting all inventory items
        app.get("/inventory-items", async (req, res) => {
            let query = {};
            let cursor;
            if (req.query.addedBy) {
                const addedBy = req.query.addedBy;
                query = { addedBy };
            }
            if (req.query.limitTo) {
                const limitTo = parseInt(req.query.limitTo);
                cursor = inventoryItemsCollection.find(query).limit(limitTo);
                // console.log(limitTo);
            } else {
                cursor = inventoryItemsCollection.find(query);
            }
            const result = await cursor.toArray();
            res.send(result);
        });

        //Getting category by id
        app.get("/categories/:id", async (req, res) => {
            const categoryId = req.params.id;
            try {
                const query = { _id: ObjectId(categoryId) };
                const category = await categoriesCollection.findOne(query);
                res.send(category);
            } catch {
                res.status(400).send({ message: "invalid category id" });
            }
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

        //Updating single inventory item
        app.put("/inventory-items/:id", async (req, res) => {
            const itemId = req.params.id;
            try {
                const updatedItem = req.body;
                const filter = { _id: ObjectId(itemId) };
                const updateDoc = {
                    $set: {
                        ...updatedItem,
                    },
                };
                const options = { upsert: true };
                const result = await inventoryItemsCollection.updateOne(
                    filter,
                    updateDoc,
                    options
                );
                res.send(result);
            } catch {
                res.status(400).send({ message: "invalid item id" });
            }
        });

        //Updating single category
        app.put("/categories/:id", async (req, res) => {
            const categoryId = req.params.id;
            try {
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
            } catch {
                res.status(400).send({ message: "invalid category id" });
            }
        });

        //////////////////////////
        //// Delete Operations ///
        //////////////////////////

        //Deleting single inventory item
        app.delete("/inventory-items/:id", async (req, res) => {
            const itemId = req.params.id;
            try {
                const filter = { _id: ObjectId(itemId) };
                const result = await inventoryItemsCollection.deleteOne(filter);
                res.send(result);
            } catch {
                res.status(400).send({ message: "invalid item id" });
            }
        });

        //Deleting single category
        app.delete("/categories/:id", async (req, res) => {
            const categoryId = req.params.id;
            try {
                const filter = { _id: ObjectId(categoryId) };
                const result = await categoriesCollection.deleteOne(filter);
                res.send(result);
            } catch {
                res.status(400).send({ message: "invalid category id" });
            }
        });
        //
    } finally {
        //
    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("welcome to grocery warehouse server");
});

//Serving to port
app.listen(port, () => {
    console.log("nt-grocery-stock-server is listening to port:", port);
});
