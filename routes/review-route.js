const express = require("express");
const router = express.Router();

const Product = require("../models/product-model.js");
const Review = require("../models/review-model.js");

// REVIEW **********************************
// CREATE RVW

router.post("/review/create", async (req, res) => {
  try {
    // PUSH NEW REVIEWS INTO REVIEW ARRAY
    const review = new Review({
      rating: req.body.rating,
      comment: req.body.comment,
      username: req.body.username
    });

    await review.save();

    const product = await Product.findById(req.body.product);
    if (!product.reviews) {
      product.reviews = []; // SUBSTITUTE = ADD "reviews: []" to PRODUCT ROUTE
    }
    product.reviews.push(review);

    // CALCULATE AVERAGE RATING

    if (product.averageRating === undefined) {
      product.averageRating = req.body.rating; // INITIALIZE IT AT FIRST REVIEW RATING
    } else {
      const total =
        product.averageRating * (product.reviews.length - 1) + req.body.rating;

      product.averageRating = total / product.reviews.length;
    }

    await product.save();
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// (product.reviews.length -1 * average + newrate )/  product.reviews.length

// READ RVWs

router.get("/review", async (req, res) => {
  try {
    const product = await Product.find();
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// UPDATE RVWs

router.post("/review/update", async (req, res) => {
  try {
    if (req.query.id && req.body.rating && req.body.comment) {
      const review = await Review.findOne({ _id: req.query.id });
      review.rating = req.body.rating;
      review.comment = req.body.comment;
      await review.save();

      // GET THE PRODUCT LINKED TO THIS ID
      const product = await Product.findOne({
        reviews: { $in: [req.query.id] }
      }).populate("reviews");
      const total =
        product.averageRating * (product.reviews.length - 1) + req.body.rating;
      product.averageRating = total / product.reviews.length;
      await product.save();

      return res.json({ message: "Review updated !" });
    } else {
      return res.status(400).json({ message: "Missing parameter" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;

// DELETE RVW

router.post("/review/delete", async (req, res) => {
  try {
    if (req.query.id) {
      const review = await Review.findById(req.query.id);

      // GET THE RELATED PRODUCT
      // const product = await Product.findOne({ reviews: { $in: [req.query.id] } });
      const product = await Product.findOne({ reviews: req.query.id }).populate(
        "reviews"
      );
      console.log(product);

      // REMOVE REVIEWS FROM product.reviews
      for (let i = 0; i < product.reviews.length; i++) {
        if (String(product.reviews[i]._id) === req.query.id) {
          console.log(String(product.reviews[i]._id));
          product.reviews.splice(i, 1);
          break;
        }
      }
      // NEW AVERAGE
      let total = 0;
      for (let j = 0; j < product.reviews.length; j++) {
        // RE-ADD ALL RATINGS TO CALCULATE NEW AVERAGE
        total = total + product.reviews[j].rating;
      }
      // BECAUSE i < product.reviews.length, i = 0 SO ERROR CASE
      if (product.reviews.length === 1) {
        product.averageRating = total;
      } else if (product.reviews.length >= 1) {
        product.averageRating = total / product.reviews.length;
      }
      await review.remove();
      await product.save();
      return res.json({ message: " Review has been removed." });
    } else {
      return res.status(400).json({ message: "Missing id" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
