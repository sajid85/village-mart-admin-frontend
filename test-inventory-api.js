// Simple API test for inventory endpoint
console.log('Testing inventory API...');

const testInventoryAPI = async () => {
  try {
    // Test if the products endpoint is working
    const response = await fetch('http://localhost:4000/products');
    console.log('API Response Status:', response.status);
    
    if (!response.ok) {
      console.error('API Error:', response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    console.log('Number of products:', data.data?.length || 0);
    
    if (data.data && data.data.length > 0) {
      console.log('Sample product:', data.data[0]);
    }
  } catch (error) {
    console.error('Connection Error:', error);
  }
};

testInventoryAPI();
