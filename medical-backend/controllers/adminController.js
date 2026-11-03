import User from '../models/User.js';
import MedicalShop from '../models/MedicalShop.js';
import Medicine from '../models/Medicine.js';
import Order from '../models/Order.js';
import Feedback from '../models/Feedback.js';
import HealthProfile from '../models/HealthProfile.js';

// @desc    Get Admin Dashboard Stats & Metrics
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalShops = await MedicalShop.countDocuments();
    const approvedShops = await MedicalShop.countDocuments({ isApproved: true, isFrozen: false });
    const frozenShops = await MedicalShop.countDocuments({ isFrozen: true });
    const totalMedicines = await Medicine.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['Pending', 'Confirmed', 'Preparing'] } });

    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $nin: ['Cancelled'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const lowStockMedicines = await Medicine.find({
      $expr: { $lte: ['$stock', '$minStockAlert'] },
    })
      .populate('shopId', 'shopName phone')
      .limit(6);

    const recentOrders = await Order.find()
      .populate('customerId', 'name email phone')
      .populate('shopId', 'shopName')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentFeedbacks = await Feedback.find()
      .populate('customerId', 'name')
      .populate('shopId', 'shopName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalShops,
        approvedShops,
        frozenShops,
        totalMedicines,
        totalOrders,
        pendingOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
      lowStockMedicines,
      recentOrders,
      recentFeedbacks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    
    // Attach health profile indicator and orders count
    const customerData = await Promise.all(
      customers.map(async (c) => {
        const orderCount = await Order.countDocuments({ customerId: c._id });
        const health = await HealthProfile.findOne({ userId: c._id });
        return {
          ...c.toObject(),
          orderCount,
          healthCompleted: health?.isCompleted || false,
        };
      })
    );

    res.json({ success: true, customers: customerData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a customer
// @route   DELETE /api/admin/customers/:id
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    await HealthProfile.deleteMany({ userId: req.params.id });

    res.json({ success: true, message: 'Customer and related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all medical shops
// @route   GET /api/admin/shops
export const getAllShops = async (req, res) => {
  try {
    const shops = await MedicalShop.find()
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

    const shopData = await Promise.all(
      shops.map(async (shop) => {
        const medicineCount = await Medicine.countDocuments({ shopId: shop._id });
        const orderCount = await Order.countDocuments({ shopId: shop._id });
        return {
          ...shop.toObject(),
          medicineCount,
          orderCount,
        };
      })
    );

    res.json({ success: true, shops: shopData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject medical shop
// @route   PATCH /api/admin/shops/:id/approve
export const toggleApproveShop = async (req, res) => {
  try {
    const shop = await MedicalShop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not found' });
    }

    shop.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : !shop.isApproved;
    await shop.save();

    res.json({
      success: true,
      message: `Shop ${shop.isApproved ? 'approved' : 'unapproved'} successfully`,
      shop,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Freeze/Unfreeze medical shop
// @route   PATCH /api/admin/shops/:id/freeze
export const toggleFreezeShop = async (req, res) => {
  try {
    const shop = await MedicalShop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not found' });
    }

    shop.isFrozen = req.body.isFrozen !== undefined ? req.body.isFrozen : !shop.isFrozen;
    await shop.save();

    res.json({
      success: true,
      message: `Shop ${shop.isFrozen ? 'frozen' : 'unfrozen'} successfully`,
      shop,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete medical shop
// @route   DELETE /api/admin/shops/:id
export const deleteShop = async (req, res) => {
  try {
    const shop = await MedicalShop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not found' });
    }

    await Medicine.deleteMany({ shopId: shop._id });
    await User.findByIdAndDelete(shop.ownerId);
    await MedicalShop.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Medical shop, owner user, and inventory deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all medicines (admin view across all shops)
// @route   GET /api/admin/medicines
export const getAllMedicinesAdmin = async (req, res) => {
  try {
    const medicines = await Medicine.find()
      .populate('shopId', 'shopName phone address city')
      .sort({ createdAt: -1 });

    res.json({ success: true, medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete medicine (admin action)
// @route   DELETE /api/admin/medicines/:id
export const deleteMedicineAdmin = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    res.json({ success: true, message: 'Medicine deleted successfully by admin' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders across system
// @route   GET /api/admin/orders
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name email phone')
      .populate('shopId', 'shopName phone address')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (admin override)
// @route   PATCH /api/admin/orders/:id/status
export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status} by Administrator`,
    });

    await order.save();
    res.json({ success: true, message: 'Order status updated by admin', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all customer feedback
// @route   GET /api/admin/feedbacks
export const getAllFeedbacksAdmin = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('customerId', 'name email')
      .populate('shopId', 'shopName address')
      .sort({ createdAt: -1 });

    res.json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
