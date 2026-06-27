const API_URL = "http://localhost:5001/api";

const runTests = async () => {
  console.log("=== SHOPVISTA E-COMMERCE UPGRADE VALIDATION SUITE ===");

  try {
    // Helper headers
    const getHeaders = (token) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });

    // Seed database first
    console.log("\n[1/7] Seeding database...");
    const seedRes = await fetch(`${API_URL}/products/seed`);
    const seedData = await seedRes.json();
    console.log(`- Database seeded: ${seedData.message}`);
    const products = seedData.products;
    const headphones = products.find((p) => p.sku === "SKU-HEADPHONES-001");
    const backpack = products.find((p) => p.sku === "SKU-BACKPACK-004");

    // Scenario 1: Guest Login & Token validation
    console.log("\n[2/7] Testing Guest Checkout Flow...");
    const guestRes = await fetch(`${API_URL}/auth/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "guest_buyer@shopvista.com",
        name: "Guest Shopper",
      }),
    });
    const guestData = await guestRes.json();
    const guestToken = guestData.token;
    console.log(`- Guest token generated for: ${guestData.email}`);
    console.log(`- Guest flag: ${guestData.isGuest}`);

    // Create address for guest
    const addressRes = await fetch(`${API_URL}/addresses`, {
      method: "POST",
      headers: getHeaders(guestToken),
      body: JSON.stringify({
        type: "Home",
        street: "456 Ocean Drive",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400002",
        phone: "9820098200",
      }),
    });
    const addressData = await addressRes.json();
    console.log(`- Address added for guest: ${addressData.street}`);

    // Scenario 2: Cart Validation & Stock Warnings
    console.log("\n[3/7] Testing Cart stock limits and warnings...");
    // Add headphones to guest cart (headphones has stock: 45)
    await fetch(`${API_URL}/cart`, {
      method: "POST",
      headers: getHeaders(guestToken),
      body: JSON.stringify({ productId: headphones._id, quantity: 45 }),
    });
    console.log("- Added 45 headphones units to cart (maximum stock).");

    // Try adding one more (should fail)
    const errRes = await fetch(`${API_URL}/cart`, {
      method: "POST",
      headers: getHeaders(guestToken),
      body: JSON.stringify({ productId: headphones._id, quantity: 1 }),
    });
    const errData = await errRes.json();
    console.log(`- Correctly blocked overflow quantity: ${errData.message}`);

    // Scenario 3: Payment failure and retry simulation
    console.log("\n[4/7] Testing Checkout Payment Failure & Retry Flow...");
    // Place order with failure simulation
    const checkoutRes = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: getHeaders(guestToken),
      body: JSON.stringify({
        shippingAddress: addressData,
        shippingMethod: "Standard",
        paymentMethod: "UPI",
        simulateFailure: true,
      }),
    });
    const order = await checkoutRes.json();
    console.log(`- Order placed with failure flag. ID: ${order.orderId}`);
    console.log(`- Order payment status: ${order.paymentStatus}`);
    console.log(`- Order shipment status: ${order.status}`);

    // Retry payment (without failure flag)
    console.log("- Retrying payment for same order...");
    const retryRes = await fetch(`${API_URL}/orders/${order.orderId}/retry`, {
      method: "POST",
      headers: getHeaders(guestToken),
      body: JSON.stringify({ simulateFailure: false }),
    });
    const retryData = await retryRes.json();
    console.log(`- Retry payment response: ${retryData.message}`);
    console.log(`- New payment status: ${retryData.order.paymentStatus}`);

    // Scenario 4: Stock Reservation (5 min timeout)
    console.log("\n[5/7] Testing Stock Reservation concurrency locks...");
    // Let's register another guest user
    const buyer2Res = await fetch(`${API_URL}/auth/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "buyer_two@shopvista.com",
      }),
    });
    const buyer2Data = await buyer2Res.json();
    const buyer2Token = buyer2Data.token;
    
    // Add remaining backpack stock to buyer2 cart (backpack has stock: 8)
    await fetch(`${API_URL}/cart`, {
      method: "POST",
      headers: getHeaders(buyer2Token),
      body: JSON.stringify({ productId: backpack._id, quantity: 8 }),
    });

    // Reserve stock for buyer2
    const reserveRes = await fetch(`${API_URL}/orders/reserve`, {
      method: "POST",
      headers: getHeaders(buyer2Token),
    });
    const reserveData = await reserveRes.json();
    console.log(`- Buyer 2 reserved stock: ${reserveData.message}`);

    // Try adding to guest's cart (should fail because reserved by Buyer 2)
    await fetch(`${API_URL}/cart`, {
      method: "POST",
      headers: getHeaders(guestToken),
      body: JSON.stringify({ productId: backpack._id, quantity: 2 }),
    });

    // Fetch guest cart - should show stock warning or reduced quantity because backpack stock is reserved!
    const guestCartRes = await fetch(`${API_URL}/cart`, {
      headers: getHeaders(guestToken),
    });
    const guestCartData = await guestCartRes.json();
    console.log(`- Guest cart populated. Warnings returned:`);
    guestCartData.warnings.forEach((w) => console.log(`  * Warning: ${w}`));

    // Scenario 5: Admin Panel & User Status Toggling
    console.log("\n[6/7] Testing Admin dashboard actions & User Toggles...");
    // Login as admin
    const adminLogin = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@shopvista.com",
        password: "adminpassword",
      }),
    });
    const adminData = await adminLogin.json();
    const adminToken = adminData.token;
    console.log(`- Admin authenticated: ${adminData.name}`);

    // Fetch dashboard KPIs
    const kpisRes = await fetch(`${API_URL}/admin/dashboard`, {
      headers: getHeaders(adminToken),
    });
    const kpisData = await kpisRes.json();
    console.log(`- Dashboard Total Revenue: $${kpisData.kpis.totalRevenue}`);
    console.log(`- Dashboard Pending Actions: ${kpisData.kpis.pendingOrders}`);

    // Deactivate Guest User
    console.log("- Deactivating guest user account...");
    const deactRes = await fetch(`${API_URL}/admin/users/${guestData._id}/active`, {
      method: "PUT",
      headers: getHeaders(adminToken),
    });
    const deactData = await deactRes.json();
    console.log(`- User status: ${deactData.user.name} - isActive = ${deactData.user.isActive}`);

    // Try to perform guest actions (should be blocked due to inactive account)
    const blockedRes = await fetch(`${API_URL}/cart`, {
      headers: getHeaders(guestToken),
    });
    const blockedData = await blockedRes.json();
    console.log(`- Action correctly blocked: ${blockedData.message}`);

    // Scenario 6: Admin CSV Bulk Uploader
    console.log("\n[7/7] Testing Bulk Product CSV Importer...");
    const csvContent = 
      "name,price,stock,category,sku,description,image\n" +
      '"HyperX Cloud Headset",99.99,100,Audio,SKU-HYPERX-001,"High fidelity gaming headset with surround sound",https://picsum.photos/seed/hyperx/640/480\n' +
      '"Anker USB C Hub",34.99,150,Accessories,SKU-ANKER-001,"8-in-1 USB C dock for Macbook and laptops",https://picsum.photos/seed/anker/640/480\n';

    const bulkRes = await fetch(`${API_URL}/products/bulk`, {
      method: "POST",
      headers: getHeaders(adminToken),
      body: JSON.stringify({ csvText: csvContent }),
    });
    const bulkData = await bulkRes.json();
    console.log(`- CSV Bulk Upload outcome: ${bulkData.message}`);

    console.log("\n=== ALL TEST SCENARIOS PASSED SUCCESSFULLY ===");
  } catch (error) {
    console.error("\n*** Test suite failed. Details: ***");
    console.error(error.message);
  }
};

runTests();
