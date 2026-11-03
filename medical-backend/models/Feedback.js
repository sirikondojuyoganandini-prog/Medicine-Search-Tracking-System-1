import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
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
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide feedback comment'],
      trim: true,
    },
    shopReply: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Feedback', feedbackSchema);
