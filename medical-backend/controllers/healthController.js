import HealthProfile from '../models/HealthProfile.js';
import User from '../models/User.js';

// @desc    Get Current Customer's Health Profile
// @route   GET /api/health-profile
export const getHealthProfile = async (req, res) => {
  try {
    let profile = await HealthProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await HealthProfile.create({
        userId: req.user._id,
        personalInfo: {
          name: req.user.name,
          location: req.user.address || '',
        },
        isCompleted: false,
      });
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Update Multi-Step Health Profile
// @route   PUT /api/health-profile
export const updateHealthProfile = async (req, res) => {
  try {
    let profile = await HealthProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new HealthProfile({ userId: req.user._id });
    }

    const {
      personalInfo,
      conditions,
      takingMedicinesCurrently,
      currentMedications,
      medicationRoutine,
      knownMedicineAllergies,
      allergies,
      allergyDetails,
      otherRestrictions,
      healthGoals,
      isCompleted,
      completedSteps,
    } = req.body;

    if (personalInfo) {
      profile.personalInfo = {
        ...profile.personalInfo,
        ...personalInfo,
      };
    }

    if (conditions !== undefined) profile.conditions = conditions;
    if (takingMedicinesCurrently !== undefined) profile.takingMedicinesCurrently = takingMedicinesCurrently;
    if (currentMedications !== undefined) profile.currentMedications = currentMedications;
    if (medicationRoutine !== undefined) profile.medicationRoutine = medicationRoutine;
    if (knownMedicineAllergies !== undefined) profile.knownMedicineAllergies = knownMedicineAllergies;
    if (allergies !== undefined) profile.allergies = allergies;
    if (allergyDetails !== undefined) profile.allergyDetails = allergyDetails;
    if (otherRestrictions !== undefined) profile.otherRestrictions = otherRestrictions;
    if (healthGoals !== undefined) profile.healthGoals = healthGoals;

    if (completedSteps !== undefined) {
      profile.completedSteps = Math.max(profile.completedSteps || 0, completedSteps);
    }

    if (isCompleted !== undefined) {
      profile.isCompleted = isCompleted;
      // Also update user document
      await User.findByIdAndUpdate(req.user._id, { isHealthProfileComplete: isCompleted });
    }

    await profile.save();

    res.json({
      success: true,
      message: 'Health profile updated successfully',
      profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
