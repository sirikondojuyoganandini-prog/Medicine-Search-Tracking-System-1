import User from '../models/User.js';
import MedicalShop from '../models/MedicalShop.js';
import Feedback from '../models/Feedback.js';
import Geofence from '../models/Geofence.js';
import { calculateDistanceMeters, isInsideGeofence, formatDistance, calculateDistanceKm } from '../utils/distanceCalculator.js';

// @desc    Submit feedback for a pharmacy
// @route   POST /api/customer/feedback
export const submitFeedback = async (req, res) => {
  try {
    const { shopId, orderId, rating, comment } = req.body;

    if (!shopId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide shopId, rating, and comment' });
    }

    const shop = await MedicalShop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not found' });
    }

    const feedback = await Feedback.create({
      customerId: req.user._id,
      shopId,
      orderId: orderId || null,
      rating: Number(rating),
      comment,
    });

    // Update shop average rating
    const allShopFeedbacks = await Feedback.find({ shopId });
    const avgRating =
      allShopFeedbacks.reduce((acc, item) => acc + item.rating, 0) / allShopFeedbacks.length;

    shop.rating = Math.round(avgRating * 10) / 10;
    shop.ratingCount = allShopFeedbacks.length;
    await shop.save();

    res.status(201).json({ success: true, feedback, message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Geofence Detection & Check
// @route   POST /api/customer/geofence/check
export const checkGeofence = async (req, res) => {
  try {
    const { shopId, userLat, userLng, radiusMeters = 500, medicineSearched } = req.body;

    if (!shopId || userLat === undefined || userLng === undefined) {
      return res.status(400).json({ success: false, message: 'shopId, userLat, and userLng are required' });
    }

    const shop = await MedicalShop.findById(shopId);
    if (!shop || !shop.location || !shop.location.lat) {
      return res.status(404).json({ success: false, message: 'Pharmacy location not found' });
    }

    const distanceMeters = calculateDistanceMeters(
      userLat,
      userLng,
      shop.location.lat,
      shop.location.lng
    );

    const inside = distanceMeters <= Number(radiusMeters);

    let geofenceRecord = await Geofence.findOne({
      userId: req.user._id,
      shopId,
    });

    let shouldNotify = false;
    const now = new Date();

    if (!geofenceRecord) {
      geofenceRecord = new Geofence({
        userId: req.user._id,
        shopId,
        medicineSearched: medicineSearched || '',
        radiusMeters: Number(radiusMeters),
        isInside: inside,
      });
    }

    // Determine if entry happened (was outside or newly entering)
    if (inside) {
      // Check if last notification was over 15 minutes ago to prevent spamming
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
      if (!geofenceRecord.lastNotifiedAt || geofenceRecord.lastNotifiedAt < fifteenMinutesAgo) {
        shouldNotify = true;
        geofenceRecord.lastNotifiedAt = now;
        geofenceRecord.notificationHistory.push({
          timestamp: now,
          distance: distanceMeters,
          message: `Entered ${shop.shopName} geofence within ${distanceMeters}m`,
        });
      }
      geofenceRecord.isInside = true;
    } else {
      geofenceRecord.isInside = false;
    }

    await geofenceRecord.save();

    res.json({
      success: true,
      inside,
      shouldNotify,
      distanceMeters,
      formattedDistance: formatDistance(distanceMeters / 1000),
      radiusMeters: Number(radiusMeters),
      shop: {
        _id: shop._id,
        shopName: shop.shopName,
        phone: shop.phone,
        address: shop.address,
        location: shop.location,
      },
      notification: shouldNotify
        ? {
            title: `You're near ${shop.shopName}!`,
            body: medicineSearched
              ? `Your searched medicine "${medicineSearched}" is available here.`
              : `Your tracked pharmacy "${shop.shopName}" is only ${distanceMeters}m away.`,
            shopId: shop._id,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's active geofences
// @route   GET /api/customer/geofence
export const getUserGeofences = async (req, res) => {
  try {
    const geofences = await Geofence.find({ userId: req.user._id, isActive: true })
      .populate('shopId', 'shopName address phone location rating')
      .sort({ updatedAt: -1 });

    res.json({ success: true, geofences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
