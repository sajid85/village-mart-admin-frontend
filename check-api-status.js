// Quick utility to check if the API server is running
const testConnection = async () => {
  try {
    console.log('🔍 Checking API server status...');
    
    // Test basic connection to server
    const response = await fetch('http://localhost:4000/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ API server is running and healthy!');
      return true;
    } else {
      console.log('⚠️ API server responded with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ API server is not running or not accessible');
    console.log('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solution: Start your API server with:');
      console.log('   npm start (in your backend directory)');
      console.log('   or');
      console.log('   node server.js (in your backend directory)');
    }
    
    return false;
  }
};

// Also test products endpoint specifically
const testProductsEndpoint = async () => {
  try {
    console.log('\n🔍 Testing products endpoint...');
    
    const response = await fetch('http://localhost:4000/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In production, you'd need a valid token
        'Authorization': 'Bearer test-token'
      },
    });
    
    if (response.ok) {
      console.log('✅ Products endpoint is accessible!');
      const data = await response.json();
      console.log('📦 Found', data.data?.length || 0, 'products');
    } else if (response.status === 401) {
      console.log('🔐 Products endpoint requires authentication (this is expected)');
    } else {
      console.log('⚠️ Products endpoint responded with status:', response.status);
    }
  } catch (error) {
    console.log('❌ Products endpoint test failed:', error.message);
  }
};

const runTests = async () => {
  await testConnection();
  await testProductsEndpoint();
  
  console.log('\n📝 Note: If the API server is not running, the frontend will use sample data.');
  console.log('🚀 The admin panel should still work perfectly for development!');
};

runTests();
