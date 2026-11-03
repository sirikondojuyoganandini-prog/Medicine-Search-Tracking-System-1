import MedicalShop from '../models/MedicalShop.js';
import Medicine from '../models/Medicine.js';
import Order from '../models/Order.js';
import Feedback from '../models/Feedback.js';

// Helper to get shop belonging to logged-in user
const getShopForUser = async (userId) => {
  const shop = await MedicalShop.findOne({ ownerId: userId });
  return shop;
};

// @desc    Get Shop Profile & Dashboard Stats
// @route   GET /api/shops/profile
export const getShopProfile = async (req, res) => {
  try {
    const shop = await getShopForUser(req.user._id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not registered for this account' });
    }

    const totalMedicines = await Medicine.countDocuments({ shopId: shop._id });
    const lowStockCount = await Medicine.countDocuments({
      shopId: shop._id,
      $expr: { $lte: ['$stock', '$minStockAlert'] },
    });

    const totalOrders = await Order.countDocuments({ shopId: shop._id });
    const pendingOrders = await Order.countDocuments({
      shopId: shop._id,
      orderStatus: { $in: ['Pending', 'Confirmed', 'Preparing'] },
    });

    const revenueResult = await Order.aggregate([
      { $match: { shopId: shop._id, orderStatus: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalEarnings = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      shop,
      stats: {
        totalMedicines,
        lowStockCount,
        totalOrders,
        pendingOrders,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Shop Profile & Location
// @route   PUT /api/shops/profile
export const updateShopProfile = async (req, res) => {
  try {
    const shop = await getShopForUser(req.user._id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not found' });
    }

    const {
      shopName,
      phone,
      address,
      city,
      pincode,
      lat,
      lng,
      openingHours,
      isOpen24Hours,
      deliveryRadiusKm,
    } = req.body;

    if (shopName) shop.shopName = shopName;
    if (phone) shop.phone = phone;
    if (address) shop.address = address;
    if (city) shop.city = city;
    if (pincode) shop.pincode = pincode;
    if (openingHours) shop.openingHours = openingHours;
    if (isOpen24Hours !== undefined) shop.isOpen24Hours = isOpen24Hours;
    if (deliveryRadiusKm !== undefined) shop.deliveryRadiusKm = Number(deliveryRadiusKm);

    if (lat !== undefined && lng !== undefined) {
      shop.location = {
        lat: Number(lat),
        lng: Number(lng),
        addressText: address || shop.address,
      };
    }

    await shop.save();

    res.json({
      success: true,
      message: 'Pharmacy profile and location updated successfully',
      shop,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Shop Incoming Orders
// @route   GET /api/shops/orders
export const getShopOrders = async (req, res) => {
  try {
    const shop = await getShopForUser(req.user._id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not found' });
    }

    const { status } = req.query;
    const filter = { shopId: shop._id };
    if (status && status !== 'All') {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
      .populate('customerId', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Order Status (Accept, Reject, Progress)
// @route   PATCH /api/shops/orders/:id/status
export const updateShopOrderStatus = async (req, res) => {
  try {
    const shop = await getShopForUser(req.user._id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not found' });
    }

    const { status, note } = req.body;
    const validStatuses = [
      'Pending',
      'Confirmed',
      'Preparing',
      'Ready for Pickup',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findOne({ _id: req.params.id, shopId: shop._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for this pharmacy' });
    }

    // If cancelling, restore stock
    if (status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.items) {
        await Medicine.findByIdAndUpdate(item.medicineId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order updated to ${status} by ${shop.shopName}`,
    });

    if (status === 'Delivered') {
      order.paymentStatus = 'Completed';
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Feedback for Shop
// @route   GET /api/shops/feedbacks
export const getShopFeedback = async (req, res) => {
  try {
    const shop = await getShopForUser(req.user._id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not found' });
    }

    const feedbacks = await Feedback.find({ shopId: shop._id })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reply to Feedback
// @route   POST /api/shops/feedbacks/:id/reply
export const replyToFeedback = async (req, res) => {
  try {
    const shop = await getShopForUser(req.user._id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not found' });
    }

    const { reply } = req.body;
    const feedback = await Feedback.findOne({ _id: req.params.id, shopId: shop._id });
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    feedback.shopReply = reply;
    await feedback.save();

    res.json({ success: true, message: 'Reply sent successfully', feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
