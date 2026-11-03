import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import MedicalShop from '../models/MedicalShop.js';
import Medicine from '../models/Medicine.js';
import Order from '../models/Order.js';
import Feedback from '../models/Feedback.js';
import HealthProfile from '../models/HealthProfile.js';
import MedicationReminder from '../models/MedicationReminder.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Checking database collections...');

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seed] Database already has records. Skipping initial seeding.');
      return;
    }

    console.log('[Seed] Seeding MediTrack initial demonstration data...');

    // 1. Create Admin
    const admin = await User.create({
      name: 'Dr. Vikram Malhotra (System Admin)',
      email: 'admin@meditrack.com',
      password: 'adminPassword123!',
      role: 'admin',
      phone: '+91 98110 00001',
      address: 'Central Health Directorate, New Delhi',
      location: { lat: 28.6139, lng: 77.2090, city: 'New Delhi' },
    });

    // 2. Create Shop Owners and Shops
    // Shop 1: Apollo Pharmacy (Connaught Place)
    const apolloUser = await User.create({
      name: 'Rajesh Sharma (Apollo Manager)',
      email: 'apollo@meditrack.com',
      password: 'shopPassword123!',
      role: 'shop',
      phone: '+91 98220 11111',
      address: 'Block B, Connaught Place, New Delhi',
      location: { lat: 28.6315, lng: 77.2167, city: 'New Delhi' },
    });

    const apolloShop = await MedicalShop.create({
      ownerId: apolloUser._id,
      shopName: 'Apollo Pharmacy',
      licenseNumber: 'DL-ND-2023-9081',
      phone: '+91 11 2341 5500',
      email: 'cp@apollopharmacy.org',
      address: 'Shop 14, Inner Circle, Connaught Place',
      city: 'New Delhi',
      pincode: '110001',
      location: { lat: 28.6315, lng: 77.2167, addressText: 'Connaught Place, New Delhi' },
      openingHours: '24 Hours Open',
      isOpen24Hours: true,
      isApproved: true,
      isFrozen: false,
      rating: 4.8,
      ratingCount: 142,
    });

    // Shop 2: MedPlus Pharmacy (Karol Bagh)
    const medplusUser = await User.create({
      name: 'Suresh Singhania (MedPlus Owner)',
      email: 'medplus@meditrack.com',
      password: 'shopPassword123!',
      role: 'shop',
      phone: '+91 98330 22222',
      address: 'Ajmal Khan Road, Karol Bagh, New Delhi',
      location: { lat: 28.6517, lng: 77.1906, city: 'New Delhi' },
    });

    const medplusShop = await MedicalShop.create({
      ownerId: medplusUser._id,
      shopName: 'MedPlus Pharmacy',
      licenseNumber: 'DL-KB-2022-7721',
      phone: '+91 11 2575 8899',
      email: 'contact@medplusdelhi.com',
      address: 'Plot 42, Main Market, Karol Bagh',
      city: 'New Delhi',
      pincode: '110005',
      location: { lat: 28.6517, lng: 77.1906, addressText: 'Karol Bagh, New Delhi' },
      openingHours: '7:30 AM - 11:00 PM',
      isOpen24Hours: false,
      isApproved: true,
      isFrozen: false,
      rating: 4.7,
      ratingCount: 98,
    });

    // Shop 3: Netmeds Pharmacy (Lajpat Nagar)
    const netmedsUser = await User.create({
      name: 'Anita Verma (Netmeds In-charge)',
      email: 'netmeds@meditrack.com',
      password: 'shopPassword123!',
      role: 'shop',
      phone: '+91 98440 33333',
      address: 'Central Market, Lajpat Nagar II, New Delhi',
      location: { lat: 28.5700, lng: 77.2400, city: 'New Delhi' },
    });

    const netmedsShop = await MedicalShop.create({
      ownerId: netmedsUser._id,
      shopName: 'Netmeds Pharmacy',
      licenseNumber: 'DL-LN-2024-3312',
      phone: '+91 11 2984 1020',
      email: 'lajpatnagar@netmeds.com',
      address: 'Shop 8, Ring Road Corner, Lajpat Nagar',
      city: 'New Delhi',
      pincode: '110024',
      location: { lat: 28.5700, lng: 77.2400, addressText: 'Lajpat Nagar, New Delhi' },
      openingHours: '8:00 AM - 10:30 PM',
      isOpen24Hours: false,
      isApproved: true,
      isFrozen: false,
      rating: 4.6,
      ratingCount: 76,
    });

    // Shop 4: Sun Pharma Wellness (Saket)
    const sunUser = await User.create({
      name: 'Karan Mehra (Sun Pharma Pharmacist)',
      email: 'sunpharma@meditrack.com',
      password: 'shopPassword123!',
      role: 'shop',
      phone: '+91 98550 44444',
      address: 'Community Centre, Saket, New Delhi',
      location: { lat: 28.5244, lng: 77.2100, city: 'New Delhi' },
    });

    const sunShop = await MedicalShop.create({
      ownerId: sunUser._id,
      shopName: 'Sun Pharma Wellness',
      licenseNumber: 'DL-SK-2021-1190',
      phone: '+91 11 2652 4433',
      email: 'saket@sunpharmawellness.com',
      address: 'B-7, PVR Anupam Complex, Saket',
      city: 'New Delhi',
      pincode: '110017',
      location: { lat: 28.5244, lng: 77.2100, addressText: 'Saket, New Delhi' },
      openingHours: '8:00 AM - 10:00 PM',
      isOpen24Hours: false,
      isApproved: true,
      isFrozen: false,
      rating: 4.4,
      ratingCount: 41,
    });

    // 3. Create Demo Customer (Rahul)
    const customerRahul = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@meditrack.com',
      password: 'customerPassword123!',
      role: 'customer',
      phone: '+91 99100 88221',
      address: 'H-12, Barakhamba Road, Connaught Place, New Delhi',
      location: { lat: 28.6290, lng: 77.2210, city: 'New Delhi' },
      isHealthProfileComplete: true,
    });

    // Create Customer 2 (Priya - fresh)
    const customerPriya = await User.create({
      name: 'Priya Patel',
      email: 'priya@meditrack.com',
      password: 'customerPassword123!',
      role: 'customer',
      phone: '+91 99200 77334',
      address: 'Flat 302, Green Park Extension, New Delhi',
      location: { lat: 28.5580, lng: 77.2020, city: 'New Delhi' },
      isHealthProfileComplete: false,
    });

    // 4. Create Rahul's Health Profile
    await HealthProfile.create({
      userId: customerRahul._id,
      personalInfo: {
        name: 'Rahul Sharma',
        age: 34,
        gender: 'Male',
        height: '178 cm',
        weight: '72 kg',
        location: 'New Delhi',
      },
      conditions: ['High Blood Pressure', 'Allergies'],
      takingMedicinesCurrently: true,
      currentMedications: [
        {
          name: 'Telmisartan',
          strength: '40 mg',
          type: 'Tablet',
          quantity: '1',
          frequency: 'Once daily (Morning)',
          startDate: '2026-01-10',
          endDate: '2026-12-31',
        },
        {
          name: 'Cetirizine',
          strength: '10 mg',
          type: 'Tablet',
          quantity: '1',
          frequency: 'As needed for seasonal allergies',
          startDate: '2026-03-01',
          endDate: '',
        },
      ],
      medicationRoutine: [
        {
          medicine: 'Telmisartan 40 mg',
          time: '08:00 AM',
          quantity: '1 tablet',
          foodRelation: 'After food',
        },
        {
          medicine: 'Multivitamin & Zinc',
          time: '01:30 PM',
          quantity: '1 capsule',
          foodRelation: 'After food',
        },
      ],
      knownMedicineAllergies: true,
      allergies: ['Penicillin'],
      allergyDetails: 'Develops mild skin hives with Penicillin derivatives',
      otherRestrictions: 'Avoid excessive sodium intake',
      healthGoals: [
        'Medicine reminders',
        'Find nearby pharmacies',
        'Track orders',
        'Check medicine availability',
        'Refill reminders',
      ],
      isCompleted: true,
      completedSteps: 6,
    });

    // 5. Create Rahul's Reminders
    await MedicationReminder.create({
      userId: customerRahul._id,
      medicineName: 'Telmisartan 40 mg',
      dosage: '1 Tablet',
      time: '08:00',
      frequency: 'Daily',
      foodTiming: 'After food',
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      notes: 'Blood pressure maintenance dose after breakfast',
      isActive: true,
    });

    await MedicationReminder.create({
      userId: customerRahul._id,
      medicineName: 'Multivitamin & Zinc',
      dosage: '1 Capsule',
      time: '13:30',
      frequency: 'Daily',
      foodTiming: 'After food',
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      notes: 'Immunity support after lunch',
      isActive: true,
    });

    // 6. Create Medicines across shops
    // Paracetamol 650 mg (Available across shops with varying distances & stock - as per prompt!)
    const doloApollo = await Medicine.create({
      shopId: apolloShop._id,
      name: 'Paracetamol 650 mg',
      genericName: 'Paracetamol / Acetaminophen',
      brand: 'Dolo 650',
      category: 'Pain Relief',
      dosageForm: 'Tablet',
      strength: '650 mg',
      price: 15.0,
      discountPrice: 14.5,
      stock: 150,
      minStockAlert: 20,
      prescriptionRequired: false,
      manufacturer: 'Micro Labs Ltd',
      expiryDate: new Date('2028-06-30'),
      description: 'Widely recommended antipyretic and analgesic for fever and body ache.',
      uses: ['Fever reduction', 'Headache', 'Muscle pain', 'Body ache'],
      sideEffects: ['Nausea in rare cases', 'Consult doctor for liver health'],
    });

    const calpolMedplus = await Medicine.create({
      shopId: medplusShop._id,
      name: 'Paracetamol 650 mg',
      genericName: 'Paracetamol',
      brand: 'Calpol 650',
      category: 'Pain Relief',
      dosageForm: 'Tablet',
      strength: '650 mg',
      price: 14.5,
      discountPrice: 14.0,
      stock: 80,
      minStockAlert: 15,
      prescriptionRequired: false,
      manufacturer: 'GSK Pharmaceuticals',
      expiryDate: new Date('2027-12-31'),
      description: 'Fast acting fever and pain relief medication.',
      uses: ['Fever', 'Mild to moderate pain'],
      sideEffects: ['Mild gastric distress if taken without water'],
    });

    const pacimolNetmeds = await Medicine.create({
      shopId: netmedsShop._id,
      name: 'Paracetamol 650 mg',
      genericName: 'Paracetamol',
      brand: 'Pacimol 650',
      category: 'Pain Relief',
      dosageForm: 'Tablet',
      strength: '650 mg',
      price: 15.2,
      discountPrice: 14.8,
      stock: 45,
      minStockAlert: 10,
      prescriptionRequired: false,
      manufacturer: 'Ipca Laboratories',
      expiryDate: new Date('2028-01-15'),
      description: 'Effective antipyretic for lowering high body temperature.',
      uses: ['Fever', 'Body pain'],
    });

    const crocinSun = await Medicine.create({
      shopId: sunShop._id,
      name: 'Paracetamol 650 mg',
      genericName: 'Paracetamol',
      brand: 'Crocin 650 Advance',
      category: 'Pain Relief',
      dosageForm: 'Tablet',
      strength: '650 mg',
      price: 16.0,
      discountPrice: 15.5,
      stock: 6, // Low stock!
      minStockAlert: 10,
      prescriptionRequired: false,
      manufacturer: 'GlaxoSmithKline',
      expiryDate: new Date('2027-09-30'),
      description: 'Advance formula with fast release technology.',
      uses: ['Fever', 'Toothache', 'Joint discomfort'],
    });

    // Additional common medicines across shops
    await Medicine.create({
      shopId: apolloShop._id,
      name: 'Amoxicillin 500 mg',
      genericName: 'Amoxicillin Trihydrate',
      brand: 'Novamox 500',
      category: 'Antibiotics',
      dosageForm: 'Capsule',
      strength: '500 mg',
      price: 78.5,
      discountPrice: 72.0,
      stock: 60,
      minStockAlert: 10,
      prescriptionRequired: true,
      manufacturer: 'Cipla Ltd',
      expiryDate: new Date('2027-08-31'),
      description: 'Broad spectrum penicillin antibiotic for bacterial infections.',
      uses: ['Respiratory tract infections', 'Ear & throat infection', 'Dental infection'],
    });

    await Medicine.create({
      shopId: apolloShop._id,
      name: 'Pantoprazole 40 mg',
      genericName: 'Pantoprazole Sodium',
      brand: 'Pan 40',
      category: 'Digestive',
      dosageForm: 'Tablet',
      strength: '40 mg',
      price: 95.0,
      discountPrice: 88.0,
      stock: 120,
      minStockAlert: 15,
      prescriptionRequired: false,
      manufacturer: 'Alkem Laboratories',
      expiryDate: new Date('2028-02-28'),
      description: 'Proton pump inhibitor that reduces excess stomach acid.',
      uses: ['Acid reflux', 'GERD', 'Heartburn', 'Peptic ulcer'],
    });

    await Medicine.create({
      shopId: medplusShop._id,
      name: 'Metformin 500 mg',
      genericName: 'Metformin Hydrochloride',
      brand: 'Glycomet 500',
      category: 'Diabetes',
      dosageForm: 'Tablet',
      strength: '500 mg',
      price: 32.0,
      discountPrice: 29.5,
      stock: 90,
      minStockAlert: 20,
      prescriptionRequired: true,
      manufacturer: 'USV Ltd',
      expiryDate: new Date('2027-11-30'),
      description: 'First-line anti-diabetic medication for Type 2 diabetes mellitus.',
      uses: ['Type 2 Diabetes', 'Insulin resistance management'],
    });

    await Medicine.create({
      shopId: medplusShop._id,
      name: 'Cetirizine 10 mg',
      genericName: 'Cetirizine Hydrochloride',
      brand: 'Cetzine',
      category: 'Allergy',
      dosageForm: 'Tablet',
      strength: '10 mg',
      price: 22.0,
      discountPrice: 19.5,
      stock: 110,
      minStockAlert: 15,
      prescriptionRequired: false,
      manufacturer: 'Dr. Reddy Laboratories',
      expiryDate: new Date('2028-04-30'),
      description: 'Second-generation antihistamine for allergic rhinitis and urticaria.',
      uses: ['Runny nose', 'Sneezing', 'Skin itchiness', 'Watery eyes'],
    });

    await Medicine.create({
      shopId: netmedsShop._id,
      name: 'Telmisartan 40 mg',
      genericName: 'Telmisartan',
      brand: 'Telma 40',
      category: 'Cardiology',
      dosageForm: 'Tablet',
      strength: '40 mg',
      price: 115.0,
      discountPrice: 104.0,
      stock: 75,
      minStockAlert: 12,
      prescriptionRequired: true,
      manufacturer: 'Glenmark Pharmaceuticals',
      expiryDate: new Date('2028-05-15'),
      description: 'Angiotensin II receptor antagonist for essential hypertension.',
      uses: ['Hypertension / High blood pressure', 'Cardiovascular risk reduction'],
    });

    await Medicine.create({
      shopId: netmedsShop._id,
      name: 'Azithromycin 500 mg',
      genericName: 'Azithromycin',
      brand: 'Azee 500',
      category: 'Antibiotics',
      dosageForm: 'Tablet',
      strength: '500 mg',
      price: 120.0,
      discountPrice: 112.0,
      stock: 50,
      minStockAlert: 10,
      prescriptionRequired: true,
      manufacturer: 'Cipla Ltd',
      expiryDate: new Date('2027-10-31'),
      description: 'Macrolide antibiotic for chest, throat, and sinus infections.',
      uses: ['Bacterial bronchitis', 'Tonsillitis', 'Skin infections'],
    });

    await Medicine.create({
      shopId: sunShop._id,
      name: 'Montelukast & Levocetirizine',
      genericName: 'Montelukast 10mg + Levocetirizine 5mg',
      brand: 'Montair LC',
      category: 'Respiratory',
      dosageForm: 'Tablet',
      strength: '10mg/5mg',
      price: 185.0,
      discountPrice: 168.0,
      stock: 35,
      minStockAlert: 8,
      prescriptionRequired: true,
      manufacturer: 'Cipla Ltd',
      expiryDate: new Date('2027-09-15'),
      description: 'Combination formulation for allergic asthma and chronic rhinitis.',
      uses: ['Allergic rhinitis', 'Asthma prevention', 'Nighttime sneezing'],
    });

    await Medicine.create({
      shopId: sunShop._id,
      name: 'TusQ DX Cough Syrup',
      genericName: 'Dextromethorphan + Chlorpheniramine + Phenylephrine',
      brand: 'TusQ-DX',
      category: 'Respiratory',
      dosageForm: 'Syrup',
      strength: '100 ml',
      price: 110.0,
      discountPrice: 99.0,
      stock: 40,
      minStockAlert: 10,
      prescriptionRequired: false,
      manufacturer: 'Blue Cross Laboratories',
      expiryDate: new Date('2027-04-30'),
      description: 'Triple active syrup for dry irritating cough and chest decongestion.',
      uses: ['Dry cough', 'Throat irritation', 'Nasal congestion'],
    });

    // 7. Create Sample Order for Rahul
    const order1 = await Order.create({
      orderNumber: 'MED-2026-98124',
      customerId: customerRahul._id,
      shopId: apolloShop._id,
      items: [
        {
          medicineId: doloApollo._id,
          name: 'Paracetamol 650 mg',
          price: 14.5,
          quantity: 2,
          dosageForm: 'Tablet',
          subtotal: 29.0,
        },
      ],
      totalAmount: 29.0,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed',
      deliveryAddress: {
        fullName: 'Rahul Sharma',
        street: 'H-12, Barakhamba Road',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        phone: '+91 99100 88221',
      },
      statusHistory: [
        { status: 'Pending', timestamp: new Date(Date.now() - 3600000), note: 'Order placed by customer' },
        { status: 'Confirmed', timestamp: new Date(Date.now() - 1800000), note: 'Order accepted by Apollo Pharmacy' },
      ],
    });

    // 8. Create Sample Feedback
    await Feedback.create({
      customerId: customerRahul._id,
      shopId: apolloShop._id,
      orderId: order1._id,
      rating: 5,
      comment: 'Very fast order confirmation and medicines were fresh and authentic. Great experience!',
      shopReply: 'Thank you Mr. Sharma! We are glad to serve you 24x7 at Apollo Pharmacy.',
    });

    console.log('[Seed] Database successfully populated with initial data!');
    console.log('[Seed] Demo Credentials:');
    console.log('   Admin: admin@meditrack.com / adminPassword123!');
    console.log('   Shop: apollo@meditrack.com / shopPassword123!');
    console.log('   Customer: rahul@meditrack.com / customerPassword123!');
  } catch (err) {
    console.error('[Seed Error]', err);
  }
};

// If run directly via node utils/seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
  connectDB().then(async () => {
    await seedDatabase();
    process.exit(0);
  });
}
