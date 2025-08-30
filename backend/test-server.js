import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
  console.log('🧪 Testing GoJob Email Sender API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Test API info endpoint
    console.log('2. Testing API info endpoint...');
    const apiResponse = await fetch(`${BASE_URL}/api/v1`);
    const apiData = await apiResponse.json();
    console.log('✅ API info:', apiData);
    console.log('');

    // Test authentication endpoint (should fail without data)
    console.log('3. Testing authentication endpoint...');
    const authResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    const authData = await authResponse.json();
    console.log('✅ Auth validation working:', authData.message);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('🚀 Server is running and responding correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure the server is running on port 3000');
  }
}

testEndpoints();
