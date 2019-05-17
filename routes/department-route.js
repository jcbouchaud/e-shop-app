const express = require("express");
const router = express.Router();

const Department = require("../models/department-model.js");
const Category = require("../models/category-model.js");
const Product = require("../models/product-model.js");
const Review = require("../models/review-model.js");

// DEPARTMENTS **********************************
// CREATE DPT

router.post("/department/create", async (req, res) => {
  try {
    const nameExist = await Department.findOne({ title: req.body.title });
    if (nameExist) {
      return res.json({
        error: {
          message: "Department already exists"
        }
      });
    } else {
      const department = new Department({
        title: req.body.title
      });

      await department.save(); // ASYNCHRONE
      return res.json({ message: "Department successfully created !" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// READ DPTs

router.get("/department", async (req, res) => {
  try {
    const department = await Department.find();
    return res.json(department);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// UPDATE DPT

router.post("/department/update", async (req, res) => {
  try {
    // CHECK IF DPT EXISTS
    const nameExist = await Department.findOne({ title: req.body.title });
    if (nameExist) {
      return res.json({
        error: {
          message: "Department already exists"
        }
      });

      // IF NOT, CREATE NEW DPT
    } else if (req.body.id && req.body.title) {
      const department = await Department.findOne({ _id: req.body.id });
      department.title = req.body.title;
      await department.save();
      return res.json({ message: "Department name updated !" });
    } else {
      return res.status(400).json({ message: "Missing parameter" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// DELETE DPT

router.post("/department/delete", async (req, res) => {
  try {
    if (req.body.id) {
      // DELETE DPT WITHOUT CONTENT
      const department = await Department.findOne({ _id: req.body.id });
      await department.remove();

      // DELETE CATEGORY INSIDE OF DPT (LOOP THE ARRAY)
      const category = await Category.find({ department: req.body.id });
      for (let i = 0; i < category.length; i++) {
        await category[i].remove();

        // DELETE ANY PRODUCT WHICH IS PART OF THIS CATEGORY
        const product = await Product.find({
          category: category[i]
        });
        for (let j = 0; j < product.length; j++) {
          for (let k = 0; k < product[j].reviews.length; k++) {
            const review = await Review.findOne({ _id: product[j].reviews[k] });
            await review.remove();
          }
          await product[j].remove();
        }
      }

      return res.json({ message: department.title + " has been removed." });
    } else {
      return res.status(400).json({ message: "Missing id" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
