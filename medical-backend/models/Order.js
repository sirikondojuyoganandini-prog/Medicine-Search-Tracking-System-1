import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  dosageForm: {
    type: String,
    default: 'Tablet',
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalShop',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [val => val.length > 0, 'An order must contain at least one item'],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Pay at Pharmacy'],
      default: 'Cash on Delivery',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Refunded'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Preparing',
        'Ready for Pickup',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
      ],
      default: 'Pending',
    },
    deliveryAddress: {
      fullName: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
      notes: String,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: 'Pending', timestamp: new Date(), note: 'Order placed by customer' }],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Order', orderSchema);
