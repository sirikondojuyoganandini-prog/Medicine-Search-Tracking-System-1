import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalShop',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide medicine name'],
      trim: true,
      index: true,
    },
    genericName: {
      type: String,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      index: true,
    },
    dosageForm: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler', 'Powder', 'Other'],
      default: 'Tablet',
    },
    strength: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Please provide unit price'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Please provide available stock quantity'],
      min: 0,
      default: 0,
    },
    minStockAlert: {
      type: Number,
      default: 10,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    manufacturer: {
      type: String,
      default: '',
    },
    batchNumber: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: Date,
    },
    description: {
      type: String,
      default: '',
    },
    uses: {
      type: [String],
      default: [],
    },
    sideEffects: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

medicineSchema.index({ name: 'text', genericName: 'text', brand: 'text', category: 'text' });

export default mongoose.model('Medicine', medicineSchema);
