// Simple test to check if the products API endpoint is working
const testProductsAPI = async () => {
  try {
    console.log('Testing products API...');
    
    const response = await fetch('http://localhost:4000/products', {
      headers: {
        'Authorization': 'Bearer your-token-here',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('Error response:', errorData);
      return;
    }
    
    const result = await response.json();
    console.log('Success! Products data:', result);
    console.log('Number of products:', result.data?.length || 0);
    
  } catch (error) {
    console.error('API test failed:', error);
  }
};

// Run the test if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  testProductsAPI();
}

module.exports = testProductsAPI;
