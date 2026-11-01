const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/auth');

// Wishlist requires authentication
router.use(requireAuth);

router.get('/', wishlistController.getWishlist);
router.post('/:studioId', wishlistController.addToWishlist);
router.delete('/:studioId', wishlistController.removeFromWishlist);

module.exports = router;
