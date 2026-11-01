const { ObjectId } = require('mongodb');
const { getWishlistCollection, getStudiosCollection } = require('../config/db');

// GET /api/wishlist
async function getWishlist(req, res, next) {
  try {
    const wishlistCol = getWishlistCollection();
    const userEmail = req.user.email;

    const items = await wishlistCol
      .find({ userEmail })
      .sort({ addedAt: -1 })
      .toArray();

    res.json({
      success: true,
      count: items.length,
      wishlist: items,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/wishlist/:studioId
async function addToWishlist(req, res, next) {
  try {
    const { studioId } = req.params;
    const userEmail = req.user.email;

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
        message: 'Studio not found.',
      });
    }

    const wishlistCol = getWishlistCollection();
    const existing = await wishlistCol.findOne({
      userEmail,
      studioId: studio._id.toString(),
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'Studio is already in your wishlist.',
      });
    }

    const item = {
      userEmail,
      studioId: studio._id.toString(),
      studioTitle: studio.title,
      studioCategory: studio.category,
      studioLocation: studio.location,
      studioImage: studio.imageUrl || studio.images?.[0] || '',
      hourlyRate: studio.hourlyRate,
      rating: studio.rating,
      addedAt: new Date(),
    };

    await wishlistCol.insertOne(item);

    res.status(201).json({
      success: true,
      message: 'Saved to your studio wishlist in MongoDB!',
      item,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/wishlist/:studioId
async function removeFromWishlist(req, res, next) {
  try {
    const { studioId } = req.params;
    const userEmail = req.user.email;

    const wishlistCol = getWishlistCollection();
    await wishlistCol.deleteOne({
      userEmail,
      studioId: studioId.toString(),
    });

    res.json({
      success: true,
      message: 'Removed studio from wishlist.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
