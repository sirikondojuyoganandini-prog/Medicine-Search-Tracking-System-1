import Medicine from '../models/Medicine.js';
import MedicalShop from '../models/MedicalShop.js';
import { calculateDistanceKm, formatDistance } from '../utils/distanceCalculator.js';

// Helper to get shop belonging to logged-in user
const getShopForUser = async (userId) => {
  return await MedicalShop.findOne({ ownerId: userId });
};

// @desc    Add a new medicine (Shop only)
// @route   POST /api/medicines
export const createMedicine = async (req, res) => {
  try {
    const shop = await getShopForUser(req.user._id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not found for this account' });
    }

    const {
      name,
      genericName,
      brand,
      category,
      dosageForm,
      strength,
      price,
      discountPrice,
      stock,
      minStockAlert,
      prescriptionRequired,
      manufacturer,
      batchNumber,
      expiryDate,
      description,
      uses,
      sideEffects,
    } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide medicine name, price, and stock' });
    }

    const medicine = await Medicine.create({
      shopId: shop._id,
      name,
      genericName: genericName || '',
      brand: brand || '',
      category: category || 'General',
      dosageForm: dosageForm || 'Tablet',
      strength: strength || '',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      stock: Number(stock),
      minStockAlert: minStockAlert ? Number(minStockAlert) : 10,
      prescriptionRequired: Boolean(prescriptionRequired),
      manufacturer: manufacturer || '',
      batchNumber: batchNumber || '',
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      description: description || '',
      uses: Array.isArray(uses) ? uses : uses ? uses.split(',').map((s) => s.trim()) : [],
      sideEffects: Array.isArray(sideEffects) ? sideEffects : sideEffects ? sideEffects.split(',').map((s) => s.trim()) : [],
    });

    res.status(201).json({ success: true, medicine, message: 'Medicine added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get medicines for current shop
// @route   GET /api/medicines/shop/my
export const getMyMedicines = async (req, res) => {
  try {
    const shop = await getShopForUser(req.user._id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not found' });
    }

    const { search, category, lowStock } = req.query;
    const filter = { shopId: shop._id, isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (lowStock === 'true') {
      filter.$expr = { $lte: ['$stock', '$minStockAlert'] };
    }

    const medicines = await Medicine.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, count: medicines.length, medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single medicine by ID
// @route   GET /api/medicines/:id
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('shopId', 'shopName address phone location rating');
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    res.json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update medicine (Shop only, own inventory)
// @route   PUT /api/medicines/:id
export const updateMedicine = async (req, res) => {
  try {
    const shop = await getShopForUser(req.user._id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not found' });
    }

    const medicine = await Medicine.findOne({ _id: req.params.id, shopId: shop._id });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found in your inventory' });
    }

    const fields = [
      'name',
      'genericName',
      'brand',
      'category',
      'dosageForm',
      'strength',
      'price',
      'discountPrice',
      'stock',
      'minStockAlert',
      'prescriptionRequired',
      'manufacturer',
      'batchNumber',
      'expiryDate',
      'description',
      'isActive',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        medicine[field] = req.body[field];
      }
    });

    if (req.body.uses !== undefined) {
      medicine.uses = Array.isArray(req.body.uses)
        ? req.body.uses
        : req.body.uses.split(',').map((s) => s.trim());
    }

    if (req.body.sideEffects !== undefined) {
      medicine.sideEffects = Array.isArray(req.body.sideEffects)
        ? req.body.sideEffects
        : req.body.sideEffects.split(',').map((s) => s.trim());
    }

    await medicine.save();

    res.json({ success: true, medicine, message: 'Medicine updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete medicine (Shop only, own inventory)
// @route   DELETE /api/medicines/:id
export const deleteMedicine = async (req, res) => {
  try {
    const shop = await getShopForUser(req.user._id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Medical shop not found' });
    }

    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, shopId: shop._id });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found in your inventory' });
    }

    res.json({ success: true, message: 'Medicine removed from inventory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search medicines and nearby pharmacies (Core feature)
// @route   GET /api/medicines/search
export const searchMedicines = async (req, res) => {
  try {
    const {
      q,
      category,
      shopName,
      inStockOnly,
      userLat,
      userLng,
      sortBy = 'distance',
      maxDistanceKm = 50,
    } = req.query;

    const filter = { isActive: true };

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: regex },
        { genericName: regex },
        { brand: regex },
        { category: regex },
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    // Find medicines matching search
    const medicines = await Medicine.find(filter)
      .populate({
        path: 'shopId',
        match: { isApproved: true, isFrozen: false },
        select: 'shopName phone email address city pincode location rating ratingCount openingHours isOpen24Hours',
      })
      .lean();

    // Filter out medicines where shopId is null (e.g. shop not approved or frozen)
    let validMedicines = medicines.filter((m) => m.shopId !== null);

    if (shopName) {
      const sRegex = new RegExp(shopName, 'i');
      validMedicines = validMedicines.filter((m) => sRegex.test(m.shopId.shopName));
    }

    if (inStockOnly === 'true') {
      validMedicines = validMedicines.filter((m) => m.stock > 0);
    }

    const lat = userLat ? parseFloat(userLat) : null;
    const lng = userLng ? parseFloat(userLng) : null;

    // Attach distance calculation and availability status
    const results = validMedicines.map((med) => {
      let distanceKm = null;
      if (lat && lng && med.shopId?.location?.lat && med.shopId?.location?.lng) {
        distanceKm = calculateDistanceKm(
          lat,
          lng,
          med.shopId.location.lat,
          med.shopId.location.lng
        );
      }

      let availabilityStatus = 'Out of Stock';
      if (med.stock > med.minStockAlert) {
        availabilityStatus = 'In Stock';
      } else if (med.stock > 0) {
        availabilityStatus = 'Low Stock';
      }

      return {
        ...med,
        distanceKm,
        formattedDistance: distanceKm !== null ? formatDistance(distanceKm) : 'Location unavailable',
        availabilityStatus,
      };
    });

    // Distance threshold filter if user provided location
    let filteredResults = results;
    if (lat && lng && maxDistanceKm) {
      filteredResults = filteredResults.filter(
        (m) => m.distanceKm === null || m.distanceKm <= Number(maxDistanceKm)
      );
    }

    // Sort results
    filteredResults.sort((a, b) => {
      if (sortBy === 'distance') {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      } else if (sortBy === 'price_asc') {
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      } else if (sortBy === 'price_desc') {
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      } else if (sortBy === 'stock') {
        return b.stock - a.stock;
      }
      return 0;
    });

    // Extract unique matching shops with coordinates for map markers
    const shopMap = new Map();
    filteredResults.forEach((med) => {
      const s = med.shopId;
      if (s && s._id) {
        const idStr = s._id.toString();
        if (!shopMap.has(idStr)) {
          shopMap.set(idStr, {
            ...s,
            distanceKm: med.distanceKm,
            formattedDistance: med.formattedDistance,
            matchingMedicines: [],
          });
        }
        shopMap.get(idStr).matchingMedicines.push({
          _id: med._id,
          name: med.name,
          price: med.price,
          discountPrice: med.discountPrice,
          stock: med.stock,
          availabilityStatus: med.availabilityStatus,
        });
      }
    });

    const nearbyShops = Array.from(shopMap.values()).sort((a, b) => {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });

    res.json({
      success: true,
      totalCount: filteredResults.length,
      medicines: filteredResults,
      nearbyShops,
      userLocation: lat && lng ? { lat, lng } : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
