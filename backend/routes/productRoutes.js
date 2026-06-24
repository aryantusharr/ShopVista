const express = require("express");
const {
  getProducts,
  getProductById,
  seedProducts,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);
router.post("/seed", seedProducts);
router.get("/:id", getProductById);

module.exports = router;
