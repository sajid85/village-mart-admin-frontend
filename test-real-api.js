// Test actual API endpoints to see what data is available
const testAPI = async () => {
  console.log('🔍 Testing API endpoints for actual data...\n');
  
  const endpoints = [
    'http://localhost:4000/products',
    'http://localhost:4000/inventory',
    'http://localhost:4000/categories',
    'http://localhost:4000/health',
    'http://localhost:4000/api/products',
    'http://localhost:4000/api/inventory'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if token exists
          ...(typeof localStorage !== 'undefined' && localStorage.getItem('token') 
            ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            : {})
        }
      });

      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success! Data structure:');
        console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
        
        if (data.data && Array.isArray(data.data)) {
          console.log(`📦 Found ${data.data.length} items`);
          if (data.data.length > 0) {
            console.log('Sample item:', JSON.stringify(data.data[0], null, 2));
          }
        }
      } else if (response.status === 401) {
        console.log('🔐 Requires authentication');
      } else {
        console.log('❌ Error response');
      }
      
      console.log('---');
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      console.log('---');
    }
  }

  console.log('\n💡 If you see connection errors, make sure your API server is running on port 4000');
  console.log('💡 If you see 401 errors, you need to login first to get an authentication token');
};

// Check if running in Node.js or browser
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testAPI();
} else {
  // Browser environment
  testAPI();
}
