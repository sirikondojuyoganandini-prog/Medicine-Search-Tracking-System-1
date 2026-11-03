import mongoose from 'mongoose';

const reminderLogSchema = new mongoose.Schema({
  takenAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['taken', 'skipped', 'snoozed'],
    default: 'taken',
  },
  dateString: {
    type: String, // e.g. "2026-10-31"
  },
});

const medicationReminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medicineName: {
      type: String,
      required: [true, 'Please provide medicine name for reminder'],
      trim: true,
    },
    dosage: {
      type: String,
      default: '1 Tablet',
    },
    time: {
      type: String,
      required: [true, 'Please provide reminder time (HH:MM)'],
    },
    frequency: {
      type: String,
      enum: ['Daily', 'Twice Daily', 'Thrice Daily', 'Weekly', 'As Needed'],
      default: 'Daily',
    },
    foodTiming: {
      type: String,
      enum: ['Before food', 'After food', 'With food', 'Empty stomach', 'Anytime'],
      default: 'After food',
    },
    daysOfWeek: {
      type: [String],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    notes: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastTakenDate: {
      type: Date,
    },
    logs: {
      type: [reminderLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('MedicationReminder', medicationReminderSchema);
