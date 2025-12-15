const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to enforce HTTPS
app.use((req, res, next) => {
  // Check if request is already HTTPS
  const isSecure = req.secure ||
                   req.headers['x-forwarded-proto'] === 'https' ||
                   req.protocol === 'https';

  // If not secure and not localhost, redirect to HTTPS
  if (!isSecure && req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') {
    const httpsUrl = `https://${req.hostname}${req.url}`;
    return res.redirect(301, httpsUrl);
  }

  next();
});

// Helper function to get client IP
function getClientIP(req) {
  // Check various headers for the real IP (useful when behind proxies/load balancers)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  return req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip;
}

// Helper function to clean IPv6 format
function cleanIP(ip) {
  // Remove IPv6 prefix for IPv4
  if (ip && ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  return ip;
}

// Main route - auto-detect format based on Accept header or query param
app.get('/', (req, res) => {
  const ip = cleanIP(getClientIP(req));
  const format = req.query.format || req.query.f;
  const acceptHeader = req.headers['accept'] || '';

  // Explicit format parameter
  if (format === 'json') {
    return res.json({ ip });
  }

  if (format === 'text' || format === 'plain') {
    return res.type('text/plain').send(ip);
  }

  // Auto-detect based on Accept header
  if (acceptHeader.includes('application/json')) {
    return res.json({ ip });
  }

  if (acceptHeader.includes('text/html')) {
    return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your IP Address</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            max-width: 600px;
            margin: 2rem;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        .ip {
            font-size: 3rem;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            margin: 2rem 0;
            word-break: break-all;
        }
        .usage {
            text-align: left;
            background: rgba(0, 0, 0, 0.2);
            padding: 1.5rem;
            border-radius: 10px;
            margin-top: 2rem;
        }
        .usage h2 {
            margin-top: 0;
            font-size: 1.2rem;
        }
        code {
            background: rgba(0, 0, 0, 0.3);
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            display: block;
            margin: 0.5rem 0;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your IP Address</h1>
        <div class="ip">${ip}</div>
        <div class="usage">
            <h2>API Usage</h2>
            <strong>Plain text:</strong>
            <code>curl ${req.protocol}://${req.get('host')}/</code>

            <strong>JSON format:</strong>
            <code>curl ${req.protocol}://${req.get('host')}/?format=json</code>

            <strong>With Accept header:</strong>
            <code>curl -H "Accept: application/json" ${req.protocol}://${req.get('host')}/</code>
        </div>
    </div>
</body>
</html>
    `);
  }

  // Default to plain text (for curl and other CLI tools)
  res.type('text/plain').send(ip);
});

// JSON endpoint
app.get('/json', (req, res) => {
  const ip = cleanIP(getClientIP(req));
  res.json({ ip });
});

// Plain text endpoint
app.get('/ip', (req, res) => {
  const ip = cleanIP(getClientIP(req));
  res.type('text/plain').send(ip);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🌐 IP detection service running on port ${PORT}`);
  console.log(`📍 Visit http://localhost:${PORT} to see your IP`);
});
