const axios = require('axios');

async function testHttp() {
  try {
    console.log("Sending POST to http://localhost:5000/api/auth/register...");
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: "HTTP Test User",
      phone: "98" + Math.floor(10000000 + Math.random() * 90000000),
      email: `httptest_${Date.now()}@example.com`,
      password: "password123",
      businessName: "HTTP Test Business " + Date.now(),
      businessType: "gym"
    });
    console.log("STATUS:", response.status);
    console.log("DATA:", response.data);
  } catch (error) {
    if (error.response) {
      console.log("ERROR STATUS:", error.response.status);
      console.log("ERROR DATA:", error.response.data);
    } else {
      console.error("ERROR:", error.message);
    }
  }
}

testHttp();
