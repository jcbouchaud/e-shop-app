const express = require("express");
const router = express.Router();

const Department = require("../models/department-model.js");
const Category = require("../models/category-model.js");
const Product = require("../models/product-model.js");
const Review = require("../models/review-model.js");

// CATEGORYS **********************************
// CREATE CTY

router.post("/category/create", async (req, res) => {
  try {
    // CHECK IF CTY EXISTS
    const nameExist = await Category.findOne({
      title: req.body.title
    });
    if (nameExist) {
      return res.json({
        error: {
          message: "Category already exists"
        }
      });

      // IF NOT CREATE IT
    } else {
      const department = await Department.findOne({
        title: req.body.department
      });
      const category = new Category({
        title: req.body.title,
        description: req.body.description,
        department: department
      });

      await category.save(); // ASYNCHRONE
      return res.json({ message: "Category successfully created !" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// READ CTYs

router.get("/category", async (req, res) => {
  try {
    const category = await Category.find();
    return res.json(category);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// UPDATE CTY

router.post("/category/update", async (req, res) => {
  try {
    if (
      req.query.id &&
      req.body.title &&
      req.body.description &&
      req.body.department
    ) {
      const category = await Category.findOne({ _id: req.query.id });
      category.title = req.body.title;
      category.description = req.body.description;
      category.department = req.body.department;
      await category.save();
      return res.json({ message: "Category name updated !" });
    } else {
      return res.status(400).json({ message: "Missing parameter" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// DELETE CTY

router.post("/category/delete", async (req, res) => {
  try {
    if (req.query.id) {
      // DELETE PRODUCT INSIDE OF CATEGORY
      const product = await Product.find({ category: req.query.id });
      for (let i = 0; i < product.length; i++) {
        for (let j = 0; j < product[i].reviews.length; j++) {
          const review = await Review.findOne({ _id: product[i].reviews[j] });
          await review.remove();
        }
        await product[i].remove();
      }

      // DELETE CATEGORY
      const category = await Category.findOne({ _id: req.query.id });
      await category.remove();

      return res.json({ message: category.title + " has been removed." });
    } else {
      return res.status(400).json({ message: "Missing id" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
