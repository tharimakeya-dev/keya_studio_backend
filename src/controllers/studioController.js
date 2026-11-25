const { ObjectId } = require('mongodb');
const { getStudiosCollection } = require('../config/db');

// GET /api/studios/featured
// Explicit requirement: "Fetch dynamically from MongoDB, displaying 6 top-rated or newest studio spaces using .limit(6)"
async function getFeaturedStudios(req, res, next) {
  try {
    const studiosCol = getStudiosCollection();
    const studios = await studiosCol
      .find({})
      .sort({ rating: -1, createdAt: -1 })
      .limit(6)
      .toArray();

    res.json({
      success: true,
      count: studios.length,
      studios,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/studios (all studios with optional search, category filter, and sorting)
async function getAllStudios(req, res, next) {
  try {
    const { category, search, sort } = req.query;
    const studiosCol = getStudiosCollection();
    const query = {};

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { category: searchRegex },
        { detailedOverview: searchRegex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') {
      sortOption = { hourlyRate: 1 };
    } else if (sort === 'price-high') {
      sortOption = { hourlyRate: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    }

    const studios = await studiosCol.find(query).sort(sortOption).toArray();

    res.json({
      success: true,
      count: studios.length,
      studios,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/studios/owner/my-listings
// Specification: "Table/Card format showing user-owned spaces (ownerEmail match)"
async function getMyListings(req, res, next) {
  try {
    const studiosCol = getStudiosCollection();
    const ownerEmail = req.user.email;

    const studios = await studiosCol
      .find({ ownerEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      count: studios.length,
      studios,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/studios/:id
async function getStudioById(req, res, next) {
  try {
    const { id } = req.params;
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const studiosCol = getStudiosCollection();
    const studio = await studiosCol.findOne(query);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio workspace not found.',
      });
    }

    res.json({
      success: true,
      studio,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/studios
// Protected by requireAuth (Challenge 1)
// Specification: "Form with Title, Category, Hourly Rate ($), Security Deposit ($), Max Capacity, Location/Address, Image URL, Amenities List, Detailed Overview, and Read-only User Email & Name"
async function createStudio(req, res, next) {
  try {
    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      imageUrl,
      images,
      amenities,
      detailedOverview,
    } = req.body;

    if (!title || !category || !hourlyRate || !location || !detailedOverview) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required studio details (Title, Category, Rate, Location, Overview).',
      });
    }

    const defaultPhoto = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80';
    const finalImage = imageUrl && imageUrl.trim() ? imageUrl.trim() : defaultPhoto;
    const finalImages = images && images.length ? images : [finalImage];

    const newStudio = {
      title: title.trim(),
      category: category.trim(),
      hourlyRate: Number(hourlyRate),
      securityDeposit: Number(securityDeposit || 0),
      maxCapacity: Number(maxCapacity || 10),
      location: location.trim(),
      imageUrl: finalImage,
      images: finalImages,
      amenities: Array.isArray(amenities) ? amenities : [],
      detailedOverview: detailedOverview.trim(),
      ownerName: req.user.name,
      ownerEmail: req.user.email,
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date(),
    };

    const studiosCol = getStudiosCollection();
    const result = await studiosCol.insertOne(newStudio);

    res.status(201).json({
      success: true,
      message: 'New studio workspace listed successfully!',
      studio: { ...newStudio, _id: result.insertedId },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/studios/:id
// Protected by requireAuth (Challenge 1)
// Specification: "Pre-filled form with existing listing data; read-only host info. On submit, update MongoDB via PUT/PATCH and show a success toast before redirecting to /my-listings"
async function updateStudio(req, res, next) {
  try {
    const { id } = req.params;
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const studiosCol = getStudiosCollection();
    const studio = await studiosCol.findOne(query);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio listing not found.',
      });
    }

    // Ownership check
    if (studio.ownerEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own studio listings.',
      });
    }

    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      imageUrl,
      images,
      amenities,
      detailedOverview,
    } = req.body;

    const updatePayload = {
      updatedAt: new Date(),
    };

    if (title) updatePayload.title = title.trim();
    if (category) updatePayload.category = category.trim();
    if (hourlyRate !== undefined) updatePayload.hourlyRate = Number(hourlyRate);
    if (securityDeposit !== undefined) updatePayload.securityDeposit = Number(securityDeposit);
    if (maxCapacity !== undefined) updatePayload.maxCapacity = Number(maxCapacity);
    if (location) updatePayload.location = location.trim();
    if (imageUrl) updatePayload.imageUrl = imageUrl.trim();
    if (images && images.length) updatePayload.images = images;
    if (amenities) updatePayload.amenities = Array.isArray(amenities) ? amenities : [];
    if (detailedOverview) updatePayload.detailedOverview = detailedOverview.trim();

    await studiosCol.updateOne(query, { $set: updatePayload });

    res.json({
      success: true,
      message: 'Studio listing updated successfully!',
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/studios/:id
// Protected by requireAuth (Challenge 1)
// Specification: "Delete Action: Show confirmation modal before deleting the document from MongoDB with a success toast."
async function deleteStudio(req, res, next) {
  try {
    const { id } = req.params;
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const studiosCol = getStudiosCollection();
    const studio = await studiosCol.findOne(query);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio listing not found.',
      });
    }

    // Ownership check
    if (studio.ownerEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own studio listings.',
      });
    }

    await studiosCol.deleteOne(query);

    res.json({
      success: true,
      message: 'Studio listing deleted successfully from Keya Studio!',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFeaturedStudios,
  getAllStudios,
  getMyListings,
  getStudioById,
  createStudio,
  updateStudio,
  deleteStudio,
};
