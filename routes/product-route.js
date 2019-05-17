const express = require("express");
const router = express.Router();

const Category = require("../models/category-model.js");
const Product = require("../models/product-model.js");
const Review = require("../models/review-model.js");

// PRODUCTS **********************************
// CREATE PDCT

router.post("/product/create", async (req, res) => {
  try {
    // CHECK IF PRODUCT EXISTS
    const nameExist = await Product.findOne({
      title: req.body.title
    });
    if (nameExist) {
      return res.json({
        error: {
          message: "Product already exists"
        }
      });

      // IF NOT, CREATE IT
    } else {
      const category = await Category.findOne({
        title: req.body.category
      });
      const product = new Product({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        category: category
      });

      await product.save(); // ASYNCHRONE
      return res.json({ message: "Product successfully created !" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// READ PDCTs

router.get("/product", async (req, res) => {
  try {
    // CREATE A FILTER, WITH OPTIONAL PARAMETERS
    // CREATE A NEW OBJECT ONLY USING ACTIVE KEYS
    let filteredProduct = {};
    // SET UP A CATEGORY FILTER
    if (req.query.category) {
      filteredProduct.category = req.query.category;
    }
    // SET UP A NAME FILTER
    if (req.query.title) {
      filteredProduct.title = new RegExp(req.query.title, "i"); // CHERCHER PARTIE DE MOT DANS UN PDT TITLE
    }
    // SET UP A PRICE MIN AND MAX FILTER
    if (req.query.priceMin) {
      filteredProduct.price = { $gte: req.query.priceMin };
    }
    if (req.query.priceMax) {
      filteredProduct.price = { $lte: req.query.priceMax };
    }
    // SET UP A SORTING FILTER
    if (req.query.sort) {
      if (req.query.sort === "price-asc") {
        const product = await Product.find(filteredProduct).sort({ price: 1 });
        return res.json(product);
      } else if (req.query.sort === "price-desc") {
        const product = await Product.find(filteredProduct).sort({ price: -1 });
        return res.json(product);
      }
    } else {
      // COMPARE THIS OBJECT TO PRODUCT ARRAY OF PRODUCT OBJECTS, SO IT CAN FILTER MATCHES
      const product = await Product.find(filteredProduct);
      return res.json(product);
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// UPDATE PDCT

router.post("/product/update", async (req, res) => {
  try {
    if (
      req.query.id &&
      req.body.title &&
      req.body.description &&
      req.body.price &&
      req.body.category
    ) {
      const product = await Product.findOne({ _id: req.query.id });
      product.title = req.body.title;
      product.description = req.body.description;
      product.price = req.body.price;
      product.category = req.body.category;
      await product.save();
      return res.json({ message: "Product name updated !" });
    } else {
      return res.status(400).json({ message: "Missing parameter" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// DELETE PDCT

router.post("/product/delete", async (req, res) => {
  try {
    if (req.query.id) {
      const product = await Product.findOne({ _id: req.query.id });
      for (let i = 0; i < product.reviews.length; i++) {
        const review = await Review.findOne({ _id: product.reviews[i] });
        await review.remove();
      }
      await product.remove();
      return res.json({ message: product.title + " has been removed." });
    } else {
      return res.status(400).json({ message: "Missing id" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
