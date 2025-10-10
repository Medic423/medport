const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testEMSAuthAPI() {
  try {
    console.log('Testing EMS authentication via API...');
    
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const data = {
      email: 'fferguson@movalleyems.com',
      password: 'movalley123'
    };
    
    const response = await makeRequest(options, data);
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    if (response.status === 200 && response.body.success) {
      console.log('✅ EMS authentication successful!');
      console.log('User type:', response.body.user.userType);
      console.log('Agency name:', response.body.user.agencyName);
    } else {
      console.log('❌ EMS authentication failed');
      console.log('Error:', response.body.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing EMS API:', error.message);
  }
}

testEMSAuthAPI();
