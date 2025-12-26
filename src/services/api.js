const API_URL = 'http://localhost:5000/api';

const api = {
  // Products
  getProducts: () => fetch(`${API_URL}/products`).then(res => res.json()),
  getProduct: (id) => fetch(`${API_URL}/products/${id}`).then(res => res.json()),
  createProduct: (data) => fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  updateProduct: (id, data) => fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  deleteProduct: (id) => fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // Customers
  getCustomers: () => fetch(`${API_URL}/customers`).then(res => res.json()),
  getCustomer: (id) => fetch(`${API_URL}/customers/${id}`).then(res => res.json()),
  getCustomerAddresses: (id) => fetch(`${API_URL}/customers/${id}/addresses`).then(res => res.json()),
  createCustomer: (data) => fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  updateCustomer: (id, data) => fetch(`${API_URL}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  deleteCustomer: (id) => fetch(`${API_URL}/customers/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // Orders
  getOrders: () => fetch(`${API_URL}/orders`).then(res => res.json()),
  getOrder: (id) => fetch(`${API_URL}/orders/${id}`).then(res => res.json()),
  createOrder: (data) => fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  updateOrder: (id, data) => fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  deleteOrder: (id) => fetch(`${API_URL}/orders/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // Suppliers
  getSuppliers: () => fetch(`${API_URL}/suppliers`).then(res => res.json()),
  getSupplier: (id) => fetch(`${API_URL}/suppliers/${id}`).then(res => res.json()),
  createSupplier: (data) => fetch(`${API_URL}/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  updateSupplier: (id, data) => fetch(`${API_URL}/suppliers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  deleteSupplier: (id) => fetch(`${API_URL}/suppliers/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // Payments
  getPayments: () => fetch(`${API_URL}/payments`).then(res => res.json()),
  createPayment: (data) => fetch(`${API_URL}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  // Dashboard
  getDashboard: () => fetch(`${API_URL}/dashboard`).then(res => res.json()),

  // Customer Operations
  cancelOrder: (orderId) => fetch(`${API_URL}/customer/cancel/${orderId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json()),
  
  makePayment: (data) => fetch(`${API_URL}/customer/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json())
};

export default api;
