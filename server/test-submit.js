const http = require('http');

const data = '--boundary\r\n' +
  'Content-Disposition: form-data; name="inputType"\r\n\r\n' +
  'TEXT\r\n' +
  '--boundary\r\n' +
  'Content-Disposition: form-data; name="text"\r\n\r\n' +
  'pothole near gita college\r\n' +
  '--boundary\r\n' +
  'Content-Disposition: form-data; name="location"\r\n\r\n' +
  '{"type":"Point","coordinates":[85.8437,20.2386]}\r\n' +
  '--boundary--\r\n';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/civic-inputs',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=boundary',
    'Content-Length': Buffer.byteLength(data),
    // We need a valid JWT token. But wait! The route is protected by `authenticate`.
  }
};

// Instead of hitting the actual server with JWT, let's just write a test script that tests Zod validation directly.
