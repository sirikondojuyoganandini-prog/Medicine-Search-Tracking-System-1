import MedicationReminder from '../models/MedicationReminder.js';

// @desc    Get all reminders for user
// @route   GET /api/reminders
export const getReminders = async (req, res) => {
  try {
    const reminders = await MedicationReminder.find({ userId: req.user._id }).sort({ time: 1 });
    res.json({ success: true, reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new reminder
// @route   POST /api/reminders
export const createReminder = async (req, res) => {
  try {
    const {
      medicineName,
      time,
      dosage = '1 Tablet',
      frequency = 'Daily',
      foodTiming = 'After food',
      daysOfWeek,
      notes = '',
    } = req.body;

    if (!medicineName || !time) {
      return res.status(400).json({ success: false, message: 'Please provide medicine name and scheduled time' });
    }

    const reminder = await MedicationReminder.create({
      userId: req.user._id,
      medicineName,
      time,
      dosage,
      frequency,
      foodTiming,
      daysOfWeek: daysOfWeek || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      notes,
    });

    res.status(201).json({ success: true, reminder, message: 'Reminder created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
export const updateReminder = async (req, res) => {
  try {
    const reminder = await MedicationReminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    const fields = ['medicineName', 'time', 'dosage', 'frequency', 'foodTiming', 'daysOfWeek', 'notes', 'isActive'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        reminder[f] = req.body[f];
      }
    });

    await reminder.save();
    res.json({ success: true, reminder, message: 'Reminder updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log / mark reminder as taken today
// @route   POST /api/reminders/:id/take
export const markReminderTaken = async (req, res) => {
  try {
    const reminder = await MedicationReminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    reminder.lastTakenDate = new Date();
    reminder.logs.push({
      takenAt: new Date(),
      status: 'taken',
      dateString: todayStr,
    });

    await reminder.save();

    res.json({ success: true, message: `Marked ${reminder.medicineName} as taken today!`, reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await MedicationReminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    res.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
