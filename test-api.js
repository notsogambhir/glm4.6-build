async function testAPI() {
  try {
    console.log('=== Testing API endpoint ===');
    
    const response = await fetch('http://127.0.0.1:3000/api/courses');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();