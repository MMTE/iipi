# ipii - IP Detection Service

A minimal, lightweight IP detection service with curl support. Similar to ipify.org, icanhazip.com, and other IP detection services.

## Features

- 🚀 Minimal and fast - built with Express.js
- 🔧 Multiple output formats (plain text, JSON, HTML)
- 🌐 Works with curl and web browsers
- 📡 Proxy-aware (respects X-Forwarded-For headers)
- 🎨 Beautiful web interface
- 🐳 Easy to deploy

## Quick Start

### Installation

```bash
npm install
```

### Run

```bash
npm start
```

The service will start on port 3000 (or the PORT environment variable if set).

## Usage

### Command Line (curl)

**Get your IP as plain text:**
```bash
curl http://localhost:3000
```

**Get your IP as JSON:**
```bash
curl http://localhost:3000?format=json
# or
curl http://localhost:3000/json
# or
curl -H "Accept: application/json" http://localhost:3000
```

**Plain text endpoint:**
```bash
curl http://localhost:3000/ip
```

### Browser

Simply visit `http://localhost:3000` in your web browser to see a beautiful interface showing your IP address along with usage examples.

### API Endpoints

| Endpoint | Description | Example Response |
|----------|-------------|------------------|
| `/` | Auto-detects format based on Accept header or query param | `203.0.113.1` or `{"ip":"203.0.113.1"}` |
| `/ip` | Always returns plain text | `203.0.113.1` |
| `/json` | Always returns JSON | `{"ip":"203.0.113.1"}` |
| `/?format=json` | Returns JSON | `{"ip":"203.0.113.1"}` |
| `/?format=text` | Returns plain text | `203.0.113.1` |
| `/health` | Health check | `{"status":"ok"}` |

## Environment Variables

- `PORT` - Port to run the server on (default: 3000)

## Deployment

### Using Node.js

```bash
PORT=8080 npm start
```

### Using Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t ipii .
docker run -p 3000:3000 ipii
```

### Using PM2

```bash
npm install -g pm2
pm2 start index.js --name ipii
```

## Reverse Proxy Setup

When running behind a reverse proxy (nginx, Apache, etc.), make sure to configure it to forward the real client IP:

### Nginx

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Apache

```apache
ProxyPass / http://localhost:3000/
ProxyPassReverse / http://localhost:3000/
RequestHeader set X-Forwarded-For %{REMOTE_ADDR}s
```

## Examples

### Integration with Shell Scripts

```bash
#!/bin/bash
MY_IP=$(curl -s http://localhost:3000)
echo "My IP is: $MY_IP"
```

### Using with jq

```bash
curl -s http://localhost:3000?format=json | jq -r '.ip'
```

### Checking if IP changed

```bash
OLD_IP=$(cat /tmp/last_ip 2>/dev/null || echo "")
NEW_IP=$(curl -s http://localhost:3000)

if [ "$OLD_IP" != "$NEW_IP" ]; then
    echo "IP changed from $OLD_IP to $NEW_IP"
    echo $NEW_IP > /tmp/last_ip
fi
```

## License

MIT

## Contributing

Feel free to open issues or submit pull requests!
