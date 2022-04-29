const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.get("/", (req, res) => {
    res.send("welcome to grocery warehouse server");
});

//Serving to port
app.listen(port, () => {
    console.log("grocery-warehouse-server is listening to port:", port);
});
