const { ObjectId } = require('mongodb');
const { getBookingsCollection, getStudiosCollection } = require('../config/db');

// Helper to convert "HH:MM" to minutes for time overlap calculations
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

// POST /api/bookings
// Challenge 1: Protected by JWT in HTTPOnly cookies via requireAuth
// Challenge 2: Double-Booking Prevention against existing "Confirmed" bookings
async function createBooking(req, res, next) {
  try {
    const {
      studioId,
      bookingDate,
      startTime,
      endTime,
      notes,
    } = req.body;

    if (!studioId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Studio ID, booking date, start time, and end time are required.',
      });
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time.',
      });
    }

    // 1. Fetch studio to verify existence and get rate & details
    let studioQuery;
    try {
      studioQuery = { _id: new ObjectId(studioId) };
    } catch {
      studioQuery = { _id: studioId };
    }

    const studiosCol = getStudiosCollection();
    const studio = await studiosCol.findOne(studioQuery);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio workspace not found.',
      });
    }

    // 2. Double-Booking Prevention Check (Challenge 2)
    // Check against existing "Confirmed" bookings for the same studio on the same date
    const bookingsCol = getBookingsCollection();
    const existingConfirmedBookings = await bookingsCol.find({
      studioId: studio._id.toString(),
      bookingDate: bookingDate,
      status: 'Confirmed',
    }).toArray();

    // Check interval overlap: (newStart < existingEnd) && (newEnd > existingStart)
    const hasOverlap = existingConfirmedBookings.some((existing) => {
      const existingStartMin = timeToMinutes(existing.startTime);
      const existingEndMin = timeToMinutes(existing.endTime);
      return startMinutes < existingEndMin && endMinutes > existingStartMin;
    });

    if (hasOverlap) {
      return res.status(409).json({
        success: false,
        isConflict: true,
        message: `Double-Booking Prevention Alert: This studio is already CONFIRMED for ${bookingDate} between ${startTime} and ${endTime}. Please choose different hours or another date.`,
      });
    }

    // 3. Calculate shoot hours and total pricing
    const durationHours = Math.max(1, Math.round(((endMinutes - startMinutes) / 60) * 10) / 10);
    const hourlyRate = studio.hourlyRate || 80;
    const subtotal = durationHours * hourlyRate;
    const securityDeposit = studio.securityDeposit || 100;
    const totalAmount = subtotal + securityDeposit;

    // 4. Save new reservation with status "Pending" (Requirement)
    const newBooking = {
      studioId: studio._id.toString(),
      studioTitle: studio.title,
      studioCategory: studio.category,
      studioLocation: studio.location,
      studioImage: studio.imageUrl || studio.images?.[0] || '',
      hourlyRate,
      securityDeposit,
      bookingDate,
      startTime,
      endTime,
      durationHours,
      subtotal,
      totalAmount,
      notes: notes ? notes.trim() : '',
      userEmail: req.user.email,
      userName: req.user.name,
      userId: req.user.id,
      status: 'Pending', // Specification required status
      createdAt: new Date(),
    };

    const result = await bookingsCol.insertOne(newBooking);

    res.status(201).json({
      success: true,
      message: 'Booking reservation submitted successfully with status Pending!',
      booking: { ...newBooking, _id: result.insertedId },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/bookings/my
// Returns current authenticated user's reservations
async function getMyBookings(req, res, next) {
  try {
    const bookingsCol = getBookingsCollection();
    const userEmail = req.user.email;

    const bookings = await bookingsCol
      .find({ userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/bookings/:id/cancel
// Specification requirement: "Cancel Booking option for pending slots"
async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const bookingsCol = getBookingsCollection();
    const booking = await bookingsCol.findOne(query);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking reservation not found.',
      });
    }

    // Ownership check
    if (booking.userEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel your own bookings.',
      });
    }

    // Must be in "Pending" status to cancel as per spec
    if (booking.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Only Pending bookings can be cancelled. Current status is ${booking.status}.`,
      });
    }

    await bookingsCol.updateOne(query, {
      $set: {
        status: 'Cancelled',
        cancelledAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Booking slot cancelled successfully.',
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/bookings/:id/status (Helper to set Confirmed/Completed for testing double-booking prevention)
async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const bookingsCol = getBookingsCollection();
    await bookingsCol.updateOne(query, { $set: { status, updatedAt: new Date() } });

    res.json({
      success: true,
      message: `Booking status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  updateBookingStatus,
};

