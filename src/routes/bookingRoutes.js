const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/auth');

// All booking routes require authentication (Challenge 1)
router.use(requireAuth);

router.post('/', bookingController.createBooking);
router.get('/my', bookingController.getMyBookings);
router.patch('/:id/cancel', bookingController.cancelBooking);
router.patch('/:id/status', bookingController.updateBookingStatus);

module.exports = router;

