import mongoose from 'mongoose';

const currentMedicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  strength: { type: String, default: '' },
  type: { type: String, default: 'Tablet' }, // Tablet, Syrup, etc.
  quantity: { type: String, default: '1' },
  frequency: { type: String, default: 'Once daily' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
});

const medicationRoutineSchema = new mongoose.Schema({
  medicine: { type: String, required: true },
  time: { type: String, required: true }, // e.g. "8:00 AM" or "08:00"
  quantity: { type: String, default: '1 tablet' },
  foodRelation: {
    type: String,
    enum: ['Before food', 'After food', 'With food', 'Empty stomach', 'Anytime'],
    default: 'After food',
  },
});

const healthProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    personalInfo: {
      name: { type: String, default: '' },
      age: { type: Number, default: null },
      gender: { type: String, default: '' },
      height: { type: String, default: '' }, // e.g. "172 cm"
      weight: { type: String, default: '' }, // e.g. "68 kg"
      location: { type: String, default: '' },
    },
    conditions: {
      type: [String],
      default: [],
    },
    takingMedicinesCurrently: {
      type: Boolean,
      default: false,
    },
    currentMedications: {
      type: [currentMedicationSchema],
      default: [],
    },
    medicationRoutine: {
      type: [medicationRoutineSchema],
      default: [],
    },
    knownMedicineAllergies: {
      type: Boolean,
      default: false,
    },
    allergies: {
      type: [String],
      default: [],
    },
    allergyDetails: {
      type: String,
      default: '',
    },
    otherRestrictions: {
      type: String,
      default: '',
    },
    healthGoals: {
      type: [String],
      default: [],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedSteps: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('HealthProfile', healthProfileSchema);
