require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing');
}

// Generate a valid JWT for testing
const token = jwt.sign({ userId: 'test-user-id' }, JWT_SECRET, { expiresIn: '1h' });


async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        category: 'Transport',
        activityDesc: 'Test ride',
        co2e: 1.5
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();

test();
