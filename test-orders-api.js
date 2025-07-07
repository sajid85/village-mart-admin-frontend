// Test script to check orders API response
const token = 'your-jwt-token-here'; // Replace with actual token

fetch('http://localhost:4000/orders', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Orders Response:');
  console.log(JSON.stringify(data, null, 2));
  
  if (data.data && data.data.length > 0) {
    const firstOrder = data.data[0];
    console.log('\nFirst Order Items:');
    console.log(firstOrder.items || 'No items found');
  }
})
.catch(error => {
  console.error('Error:', error);
});
