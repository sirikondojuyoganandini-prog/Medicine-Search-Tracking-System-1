import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import MedicalShop from '../models/MedicalShop.js';
import HealthProfile from '../models/HealthProfile.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'meditrack_jwt_super_secret_production_key_2026_xyz',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Register a new customer
// @route   POST /api/auth/register-customer
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, address, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'customer',
      phone: phone || '',
      address: address || '',
      location: location || { lat: 28.6139, lng: 77.2090, city: 'New Delhi' },
    });

    // Create empty initial health profile
    await HealthProfile.create({
      userId: user._id,
      personalInfo: {
        name: user.name,
        location: address || '',
      },
      isCompleted: false,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        location: user.location,
        isHealthProfileComplete: false,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new medical shop
// @route   POST /api/auth/register-shop
export const registerShop = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      shopName,
      licenseNumber,
      address,
      city,
      pincode,
      lat,
      lng,
      openingHours,
      isOpen24Hours,
    } = req.body;

    if (!name || !email || !password || !shopName || !licenseNumber || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required shop details (name, email, password, shopName, licenseNumber, address)',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'shop',
      phone: phone || '',
      address: address,
      location: {
        lat: Number(lat) || 28.6139,
        lng: Number(lng) || 77.2090,
        city: city || 'New Delhi',
        addressText: address,
      },
    });

    const medicalShop = await MedicalShop.create({
      ownerId: user._id,
      shopName,
      licenseNumber,
      phone: phone || user.phone,
      email: email,
      address,
      city: city || 'New Delhi',
      pincode: pincode || '110001',
      location: {
        lat: Number(lat) || 28.6139,
        lng: Number(lng) || 77.2090,
        addressText: address,
      },
      openingHours: openingHours || '8:00 AM - 10:00 PM',
      isOpen24Hours: Boolean(isOpen24Hours),
      isApproved: true, // auto-approved for frictionless demo, manageable by admin
      isFrozen: false,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        location: user.location,
      },
      shop: medicalShop,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register an Admin (initial setup or authorized)
// @route   POST /api/auth/register-admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    const validSecret = process.env.ADMIN_SECRET || 'meditrack_admin_master_secret';
    if (adminSecret && adminSecret !== validSecret) {
      return res.status(403).json({ success: false, message: 'Invalid admin registration secret' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unified Login (Customer, Shop, Admin)
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password, requiredRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated by administrator' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Role check if user specifically logged in from an admin/shop screen
    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Account role mismatch: This account is registered as '${user.role}', not '${requiredRole}'`,
      });
    }

    let shopDetails = null;
    if (user.role === 'shop') {
      shopDetails = await MedicalShop.findOne({ ownerId: user._id });
    }

    let healthProfile = null;
    if (user.role === 'customer') {
      healthProfile = await HealthProfile.findOne({ userId: user._id });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        location: user.location,
        isHealthProfileComplete: healthProfile ? healthProfile.isCompleted : false,
      },
      shop: shopDetails,
      healthProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let shop = null;
    let healthProfile = null;

    if (user.role === 'shop') {
      shop = await MedicalShop.findOne({ ownerId: user._id });
    } else if (user.role === 'customer') {
      healthProfile = await HealthProfile.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user,
      shop,
      healthProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Profile Details
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, location } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (location) user.location = { ...user.location, ...location };

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        location: user.location,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
