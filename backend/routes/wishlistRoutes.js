const express = require("express");
const {
  getWishlist,
  toggleWishlist,
  moveToCart,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);
router.post("/move-to-cart", moveToCart);

module.exports = router;
