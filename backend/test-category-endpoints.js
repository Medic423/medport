// Test script for category endpoints
// Run with: node backend/test-category-endpoints.js

const api = require('axios').default;

const BASE_URL = process.env.API_URL || 'http://localhost:5001';
const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@tcc.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'admin123';

async function testEndpoints() {
  console.log('🧪 Testing Category Endpoints\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  try {
    // Step 1: Login to get auth token
    console.log('1️⃣  Logging in...');
    let loginRes;
    try {
      loginRes = await api.post(`${BASE_URL}/api/auth/login`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
    } catch (loginError) {
      console.error('Login error:', loginError.response?.data || loginError.message);
      throw new Error(`Login failed: ${loginError.response?.data?.error || loginError.message}`);
    }

    if (!loginRes.data.success) {
      throw new Error(`Login failed: ${loginRes.data.error || 'Unknown error'}`);
    }

    const token = loginRes.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('✅ Login successful\n');

    // Step 2: GET all categories
    console.log('2️⃣  Testing GET /api/dropdown-categories');
    const getAllRes = await api.get(`${BASE_URL}/api/dropdown-categories`, { headers });
    console.log(`✅ Success: Found ${getAllRes.data.data.length} categories`);
    console.log('   Categories:', getAllRes.data.data.map(c => c.slug).join(', '));
    console.log('');

    // Step 3: GET single category
    if (getAllRes.data.data.length > 0) {
      const firstCategory = getAllRes.data.data[0];
      console.log(`3️⃣  Testing GET /api/dropdown-categories/${firstCategory.id}`);
      const getOneRes = await api.get(`${BASE_URL}/api/dropdown-categories/${firstCategory.id}`, { headers });
      console.log(`✅ Success: Retrieved category "${getOneRes.data.data.displayName}"`);
      console.log(`   Slug: ${getOneRes.data.data.slug}`);
      console.log(`   Options: ${getOneRes.data.data.optionCount}`);
      console.log('');
    }

    // Step 4: Test GET /api/dropdown-options (should return slugs from DB)
    console.log('4️⃣  Testing GET /api/dropdown-options (categories list)');
    const getCategoriesRes = await api.get(`${BASE_URL}/api/dropdown-options`, { headers });
    console.log(`✅ Success: Found ${getCategoriesRes.data.data.length} category slugs`);
    console.log('   Slugs:', getCategoriesRes.data.data.join(', '));
    console.log('');

    // Step 5: Test GET options for a category
    if (getCategoriesRes.data.data.length > 0) {
      const testCategory = getCategoriesRes.data.data[0];
      console.log(`5️⃣  Testing GET /api/dropdown-options/${testCategory}`);
      const getOptionsRes = await api.get(`${BASE_URL}/api/dropdown-options/${encodeURIComponent(testCategory)}`, { headers });
      console.log(`✅ Success: Found ${getOptionsRes.data.data.length} options for "${testCategory}"`);
      if (getOptionsRes.data.data.length > 0) {
        console.log('   Sample options:', getOptionsRes.data.data.slice(0, 3).map(o => o.value).join(', '));
      }
      console.log('');
    }

    // Step 6: Test creating a new category (then delete it)
    console.log('6️⃣  Testing POST /api/dropdown-categories (create test category)');
    const testSlug = `test-category-${Date.now()}`;
    const createRes = await api.post(`${BASE_URL}/api/dropdown-categories`, {
      slug: testSlug,
      displayName: 'Test Category',
      displayOrder: 99
    }, { headers });
    console.log(`✅ Success: Created category "${createRes.data.data.displayName}"`);
    const newCategoryId = createRes.data.data.id;
    console.log('');

    // Step 7: Test updating the category
    console.log(`7️⃣  Testing PUT /api/dropdown-categories/${newCategoryId}`);
    const updateRes = await api.put(`${BASE_URL}/api/dropdown-categories/${newCategoryId}`, {
      displayName: 'Updated Test Category',
      displayOrder: 100
    }, { headers });
    console.log(`✅ Success: Updated category to "${updateRes.data.data.displayName}"`);
    console.log('');

    // Step 8: Test deleting the test category
    console.log(`8️⃣  Testing DELETE /api/dropdown-categories/${newCategoryId}`);
    const deleteRes = await api.delete(`${BASE_URL}/api/dropdown-categories/${newCategoryId}`, { headers });
    console.log('✅ Success: Test category deleted');
    console.log('');

    console.log('🎉 All endpoint tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
    }
    process.exit(1);
  }
}

testEndpoints();

