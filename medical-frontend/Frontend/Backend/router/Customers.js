// Customer API Route Definitions & Client Interface
// Connects frontend components to medical-backend REST APIs

export const CUSTOMER_ROUTES = {
  SUBMIT_FEEDBACK: '/customer/feedback',
  CHECK_GEOFENCE: '/customer/geofence/check',
  GET_GEOFENCES: '/customer/geofence',
  HEALTH_PROFILE: '/health-profile',
  MY_ORDERS: '/orders/my',
  ORDER_BY_ID: (id) => `/orders/${id}`,
  CANCEL_ORDER: (id) => `/orders/${id}/cancel`,
  REMINDERS: '/reminders',
  MARK_REMINDER_TAKEN: (id) => `/reminders/${id}/take`,
};

export default CUSTOMER_ROUTES;
