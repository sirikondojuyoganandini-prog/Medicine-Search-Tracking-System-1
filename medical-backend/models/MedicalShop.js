import mongoose from 'mongoose';

const medicalShopSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopName: {
      type: String,
      required: [true, 'Please provide shop name'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide drug license number'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone'],
    },
    email: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide physical address'],
    },
    city: {
      type: String,
      default: 'New Delhi',
    },
    pincode: {
      type: String,
      default: '110001',
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Please provide latitude coordinate'],
      },
      lng: {
        type: Number,
        required: [true, 'Please provide longitude coordinate'],
      },
      addressText: {
        type: String,
        default: '',
      },
    },
    openingHours: {
      type: String,
      default: '8:00 AM - 10:00 PM',
    },
    isOpen24Hours: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    ratingCount: {
      type: Number,
      default: 1,
    },
    deliveryRadiusKm: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('MedicalShop', medicalShopSchema);
