import mongoose from 'mongoose';

const geofenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalShop',
      required: true,
    },
    medicineSearched: {
      type: String,
      default: '',
    },
    radiusMeters: {
      type: Number,
      default: 500,
      min: 50,
      max: 5000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isInside: {
      type: Boolean,
      default: false,
    },
    lastNotifiedAt: {
      type: Date,
    },
    notificationHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        distance: Number,
        message: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Geofence', geofenceSchema);
