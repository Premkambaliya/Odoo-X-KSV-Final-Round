import fs from 'fs';

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let customerToken = '';
let categoryId = '';
let vehicleId = '';
let rentalPeriodId = '';
let customerId = '';
let orderId = '';
let paymentId = '';
let depositId = '';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function runTest(name, method, endpoint, body, token) {
  console.log('[TEST] ' + name + ' - ' + method + ' ' + endpoint);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  
  try {
    const res = await fetch(BASE_URL + endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('FAILED: ' + name, data);
      return { success: false, data };
    }
    console.log('PASSED: ' + name);
    return { success: true, data };
  } catch (error) {
    console.error('ERROR: ' + name, error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('--- STARTING E2E API TESTS ---\\n');

  // 1. Auth Admin
  const adminLogin = await runTest('Admin Login', 'POST', '/auth/login', { email: 'admin@driveease.com', password: 'Admin@123' });
  if (adminLogin.success) adminToken = adminLogin.data.data.token;

  // 2. Auth Customer (Register & Login)
  await runTest('Register Customer', 'POST', '/auth/register', { firstName: 'Test', lastName: 'User', email: 'testuser@test.com', password: 'Password@123', role: 'CUSTOMER' });
  const custLogin = await runTest('Customer Login', 'POST', '/auth/login', { email: 'testuser@test.com', password: 'Password@123' });
  if (custLogin.success) {
    customerToken = custLogin.data.data.token;
    customerId = custLogin.data.data.user.id;
  }

  // 3. Categories
  const cat = await runTest('Create Category', 'POST', '/categories', { name: 'SUV ' + Date.now(), description: 'Sport Utility Vehicle' }, adminToken);
  if (cat.success) categoryId = cat.data.data.id;

  // 4. Vehicles
  const veh = await runTest('Create Vehicle', 'POST', '/vehicles', {
    categoryId, brand: 'Toyota', model: 'Fortuner', registrationNumber: 'KA01-' + Date.now(),
    vin: 'VIN-' + Date.now(), year: 2023, fuelType: 'Diesel', transmission: 'Automatic', color: 'White',
    seatCapacity: 7, mileage: 12.5, basePrice: 5000, securityDeposit: 15000
  }, adminToken);
  if (veh.success) vehicleId = veh.data.data.id;

  // 5. Rental Periods
  const period = await runTest('Create Rental Period', 'POST', '/rental-periods', { name: '3 Days', days: 3 }, adminToken);
  if (period.success) rentalPeriodId = period.data.data.id;

  // 6. Rental Orders (Customer creates)
  const pickupDate = new Date(Date.now() + 86400000).toISOString();
  const returnDate = new Date(Date.now() + 86400000 * 4).toISOString();
  const order = await runTest('Create Rental Order', 'POST', '/rental-orders', {
    rentalPeriodId, pickupDate, expectedReturnDate: returnDate
  }, customerToken);
  if (order.success) orderId = order.data.data.id;

  // 7. Rental Items (Add Vehicle to Order)
  if (orderId && vehicleId) {
    await runTest('Add Rental Item', 'POST', '/rental-orders/' + orderId + '/items', { vehicleId }, adminToken);
  }

  // 8. Confirm Order
  if (orderId) {
    await runTest('Confirm Order', 'PATCH', '/rental-orders/' + orderId + '/status', { status: 'CONFIRMED' }, adminToken);
  }

  // 9. Quotations
  if (orderId) {
    await runTest('Generate Quotation', 'POST', '/quotations/generate/' + orderId, {}, adminToken);
  }

  // 10. Security Deposit
  if (orderId) {
    const dep = await runTest('Collect Security Deposit', 'POST', '/security-deposits', { rentalOrderId: orderId, amountCollected: 15000 }, adminToken);
    if (dep.success) depositId = dep.data.data.id;
  }

  // 11. Payments
  if (orderId) {
    const pay = await runTest('Make Payment', 'POST', '/payments', { rentalOrderId: orderId, amount: 5000, paymentMethod: 'UPI' }, adminToken);
    if (pay.success) paymentId = pay.data.data.id;
  }

  // 12. Pickup
  if (orderId) {
    await runTest('Process Pickup', 'POST', '/pickups', {
      rentalOrderId: orderId, executiveName: 'John Doe', pickupTime: pickupDate, odometerReading: 15000, fuelLevel: '100%'
    }, adminToken);
  }

  // 13. Return
  if (orderId) {
    await runTest('Process Return', 'POST', '/returns', {
      rentalOrderId: orderId, executiveName: 'Jane Doe', returnTime: returnDate, odometerReading: 15500, fuelLevel: '80%', vehicleCondition: 'EXCELLENT'
    }, adminToken);
  }

  // 14. Penalties
  if (orderId) {
    await runTest('Calculate Penalties', 'POST', '/penalties/calculate', { rentalOrderId: orderId }, adminToken);
    await runTest('Check Rental Closure', 'POST', '/penalties/check-closure/' + orderId, {}, adminToken);
  }

  // 15. Dashboards & Reports
  await runTest('Dashboard Overview', 'GET', '/dashboard/overview', null, adminToken);
  await runTest('Reports Rentals', 'GET', '/reports/rentals', null, adminToken);

  console.log('\\n--- E2E TESTS COMPLETED ---');
}

runAllTests();
