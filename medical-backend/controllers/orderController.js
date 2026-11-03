import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';
import MedicalShop from '../models/MedicalShop.js';

// @desc    Create new order (with strict inventory validation and stock reduction)
// @route   POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      shopId,
      items,
      paymentMethod = 'Cash on Delivery',
      deliveryAddress,
    } = req.body;

    if (!shopId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Shop and order items are required' });
    }

    const shop = await MedicalShop.findById(shopId);
    if (!shop || !shop.isApproved || shop.isFrozen) {
      return res.status(400).json({ success: false, message: 'Pharmacy is currently unavailable or inactive' });
    }

    let calculatedTotal = 0;
    const validatedItems = [];

    // Verify stock and calculate real totals from database
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine item "${item.name || 'Unknown'}" not found in database`,
        });
      }

      if (medicine.shopId.toString() !== shopId) {
        return res.status(400).json({
          success: false,
          message: `Medicine "${medicine.name}" does not belong to the selected pharmacy`,
        });
      }

      const qty = Number(item.quantity);
      if (qty <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
      }

      if (medicine.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${medicine.name}". Available: ${medicine.stock}, Requested: ${qty}`,
        });
      }

      const effectivePrice = medicine.discountPrice > 0 ? medicine.discountPrice : medicine.price;
      const subtotal = effectivePrice * qty;
      calculatedTotal += subtotal;

      validatedItems.push({
        medicineId: medicine._id,
        name: medicine.name,
        price: effectivePrice,
        quantity: qty,
        dosageForm: medicine.dosageForm,
        subtotal: Math.round(subtotal * 100) / 100,
      });
    }

    // Deduct stock for all items
    for (const item of validatedItems) {
      await Medicine.findByIdAndUpdate(item.medicineId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Generate readable random order number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `MED-${Date.now().toString().slice(-4)}-${randomSuffix}`;

    const order = await Order.create({
      orderNumber,
      customerId: req.user._id,
      shopId,
      items: validatedItems,
      totalAmount: Math.round(calculatedTotal * 100) / 100,
      paymentMethod,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      deliveryAddress: deliveryAddress || {
        fullName: req.user.name,
        street: req.user.address || '',
        phone: req.user.phone || '',
      },
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date(),
          note: `Order placed successfully with ${paymentMethod}`,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer's order history
// @route   GET /api/orders/my
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('shopId', 'shopName phone address location rating')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID (with tracking details)
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('shopId', 'shopName phone address email location rating')
      .populate('customerId', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check permissions
    const isCustomerOwner = order.customerId._id.toString() === req.user._id.toString();
    const isShopOwner =
      req.user.role === 'shop' &&
      order.shopId &&
      order.shopId._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomerOwner && !isShopOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel an order (Customer)
// @route   PATCH /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.orderStatus}`,
      });
    }

    // Restore stock
    for (const item of order.items) {
      await Medicine.findByIdAndUpdate(item.medicineId, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: req.body.reason || 'Cancelled by customer',
    });

    await order.save();

    res.json({ success: true, message: 'Order cancelled and stock restored', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
