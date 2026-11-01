const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studioController');
const { requireAuth } = require('../middleware/auth');

// Public endpoints
router.get('/featured', studioController.getFeaturedStudios);
router.get('/', studioController.getAllStudios);
router.get('/:id', studioController.getStudioById);

// Protected endpoints (Challenge 1: HTTPOnly JWT mutation guard)
router.get('/owner/my-listings', requireAuth, studioController.getMyListings);
router.post('/', requireAuth, studioController.createStudio);
router.put('/:id', requireAuth, studioController.updateStudio);
router.delete('/:id', requireAuth, studioController.deleteStudio);

module.exports = router;
