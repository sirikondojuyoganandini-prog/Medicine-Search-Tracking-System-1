const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log(' Starting MediTrack Comprehensive Integration Tests ');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  };

  const post = async (url, body, token) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json() };
  };

  const get = async (url, token) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return { status: res.status, data: await res.json() };
  };

  const put = async (url, body, token) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json() };
  };

  const patch = async (url, body, token) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json() };
  };

  const del = async (url, token) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return { status: res.status, data: await res.json() };
  };

  try {
    // 1. Healthcheck
    const health = await get('/health');
    assert(health.data.status === 'OK', 'Backend Health Endpoint is reachable and OK');

    // 2. Login as Admin
    const adminLogin = await post('/auth/login', {
      email: 'admin@meditrack.com',
      password: 'adminPassword123!',
      requiredRole: 'admin',
    });
    assert(adminLogin.data.success && adminLogin.data.token, 'Admin authentication successful');
    const adminToken = adminLogin.data.token;

    // 3. Login as Shop
    const shopLogin = await post('/auth/login', {
      email: 'apollo@meditrack.com',
      password: 'shopPassword123!',
      requiredRole: 'shop',
    });
    assert(shopLogin.data.success && shopLogin.data.shop, 'Medical Shop authentication successful');
    const shopToken = shopLogin.data.token;
    const apolloShopId = shopLogin.data.shop._id;

    // 4. Login as Customer
    const customerLogin = await post('/auth/login', {
      email: 'rahul@meditrack.com',
      password: 'customerPassword123!',
      requiredRole: 'customer',
    });
    assert(customerLogin.data.success && customerLogin.data.user, 'Customer authentication successful');
    const customerToken = customerLogin.data.token;

    // 5. Test Medicine Search with Haversine distance
    const searchRes = await get('/medicines/search?q=Paracetamol&userLat=28.6290&userLng=77.2210&sortBy=distance');
    assert(searchRes.data.success && searchRes.data.medicines.length > 0, 'Medicine Search returns database results');
    const firstMed = searchRes.data.medicines[0];
    assert(firstMed.distanceKm !== null && firstMed.formattedDistance, `Haversine distance calculated: ${firstMed.formattedDistance}`);
    assert(searchRes.data.nearbyShops.length > 0, `Nearby mapped pharmacies found: ${searchRes.data.nearbyShops.length}`);

    // 6. Test Shop Inventory CRUD
    const addMedRes = await post(
      '/medicines',
      {
        name: 'Ibuprofen 400 mg Test',
        genericName: 'Ibuprofen',
        category: 'Pain Relief',
        dosageForm: 'Tablet',
        price: 45.0,
        discountPrice: 40.0,
        stock: 50,
        minStockAlert: 10,
      },
      shopToken
    );
    assert(addMedRes.data.success && addMedRes.data.medicine, 'Shop added new medicine to inventory');
    const createdMedId = addMedRes.data.medicine._id;

    // Update the medicine stock & price
    const updateMedRes = await put(
      `/medicines/${createdMedId}`,
      { stock: 45, price: 42.0 },
      shopToken
    );
    assert(updateMedRes.data.success && updateMedRes.data.medicine.stock === 45, 'Shop updated medicine inventory');

    // 7. Test Customer Order Placement & Stock Validation
    const initialStock = updateMedRes.data.medicine.stock;
    const orderRes = await post(
      '/orders',
      {
        shopId: apolloShopId,
        items: [{ medicineId: createdMedId, quantity: 2, price: 42.0 }],
        paymentMethod: 'Cash on Delivery',
        deliveryAddress: { fullName: 'Rahul Sharma', street: 'Connaught Place', phone: '+91 99100 88221' },
      },
      customerToken
    );
    assert(orderRes.data.success && orderRes.data.order, `Order created: ${orderRes.data.order?.orderNumber}`);
    const orderId = orderRes.data.order._id;

    // Check inventory stock decreased by 2
    const checkStockMed = await get(`/medicines/${createdMedId}`);
    assert(checkStockMed.data.medicine.stock === initialStock - 2, `Inventory stock reduced from ${initialStock} to ${checkStockMed.data.medicine.stock}`);

    // 8. Test Shop Progressing Order Status
    const statusUpdateRes = await patch(
      `/shops/orders/${orderId}/status`,
      { status: 'Confirmed', note: 'Order accepted by pharmacy team' },
      shopToken
    );
    assert(statusUpdateRes.data.success && statusUpdateRes.data.order.orderStatus === 'Confirmed', 'Shop progressed order to Confirmed');

    // 9. Test Customer Tracking Order
    const trackRes = await get(`/orders/${orderId}`, customerToken);
    assert(trackRes.data.success && trackRes.data.order.statusHistory.length >= 2, 'Customer tracked order timeline with history');

    // 10. Test Geofence Evaluation API
    const geofenceCheck = await post(
      '/customer/geofence/check',
      {
        shopId: apolloShopId,
        userLat: 28.6315, // exactly at Apollo
        userLng: 77.2167,
        radiusMeters: 500,
        medicineSearched: 'Paracetamol 650 mg',
      },
      customerToken
    );
    assert(geofenceCheck.data.success && geofenceCheck.data.inside === true, 'Geofence entry detected when user within radius');

    // 11. Test Health Profile API
    const healthProfileRes = await get('/health-profile', customerToken);
    assert(healthProfileRes.data.success && healthProfileRes.data.profile, 'Customer health profile retrieved');

    // 12. Test Medication Reminders API
    const reminderRes = await post(
      '/reminders',
      {
        medicineName: 'Vitamin C 500mg',
        time: '09:00',
        dosage: '1 Tablet',
        frequency: 'Daily',
        foodTiming: 'After food',
      },
      customerToken
    );
    assert(reminderRes.data.success && reminderRes.data.reminder, 'Created medication reminder');
    const reminderId = reminderRes.data.reminder._id;

    const takeReminderRes = await post(`/reminders/${reminderId}/take`, {}, customerToken);
    assert(takeReminderRes.data.success, 'Logged medication reminder taken today');

    // Clean up test reminder
    await del(`/reminders/${reminderId}`, customerToken);

    // 13. Test Admin Stats & Governance
    const adminStats = await get('/admin/stats', adminToken);
    assert(adminStats.data.success && adminStats.data.stats.totalCustomers > 0, 'Admin stats retrieved with platform counts');

    // Clean up created test medicine
    await del(`/medicines/${createdMedId}`, shopToken);

    console.log('====================================================');
    console.log(` Verification Completed: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');
  } catch (err) {
    console.error('Test Suite Exception:', err);
  }
}

runTests();
