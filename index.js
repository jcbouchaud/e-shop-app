const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/online-shop", {
  useNewUrlParser: true
});

// IMPORT ALL MODELS

const Department = require("./models/department-model.js");
const Category = require("./models/category-model.js");
const Product = require("./models/product-model.js");
const Review = require("./models/review-model.js");

// IMPORT ROUTES

const departmentRoute = require("./routes/department-route.js");
app.use(departmentRoute);

const categoryRoute = require("./routes/category-route.js");
app.use(categoryRoute);

const productRoute = require("./routes/product-route.js");
app.use(productRoute);

const reviewRoute = require("./routes/review-route.js");
app.use(reviewRoute);

// SERVER STARTED

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
