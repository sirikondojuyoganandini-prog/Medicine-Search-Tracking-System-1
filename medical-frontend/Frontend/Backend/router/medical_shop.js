// Medical Shop API Route Definitions & Client Interface
// Connects frontend components to medical-backend REST APIs

export const MEDICAL_SHOP_ROUTES = {
  PROFILE: '/shops/profile',
  GET_ORDERS: '/shops/orders',
  UPDATE_ORDER_STATUS: (id) => `/shops/orders/${id}/status`,
  FEEDBACKS: '/shops/feedbacks',
  REPLY_FEEDBACK: (id) => `/shops/feedbacks/${id}/reply`,
  MY_MEDICINES: '/medicines/shop/my',
  CREATE_MEDICINE: '/medicines',
  UPDATE_MEDICINE: (id) => `/medicines/${id}`,
  DELETE_MEDICINE: (id) => `/medicines/${id}`,
};

export default MEDICAL_SHOP_ROUTES;
