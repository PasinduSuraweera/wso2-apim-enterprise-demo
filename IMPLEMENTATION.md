# Implementation Guide

Complete step-by-step guide to set up and run the WSO2 API Manager Enterprise Demo.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Backend Service Setup](#backend-service-setup)
- [WSO2 APIM Configuration](#wso2-apim-configuration)
- [API Publishing](#api-publishing)
- [Client Application Setup](#client-application-setup)
- [Testing and Validation](#testing-and-validation)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 10GB free space
- **Network**: Internet connection for downloads

### Software Dependencies
```bash
# Required Software
- Node.js 18+ (https://nodejs.org)
- Docker Desktop (https://docker.com)
- Git (https://git-scm.com)
- cURL or Postman (API testing)

# Optional but Recommended
- VS Code (code editor)
- Postman Desktop (API testing GUI)
- Git Bash (Windows users)
```

### Version Verification
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 8.x.x or higher
docker --version  # Should show 20.x.x or higher
git --version     # Should show 2.x.x or higher
```

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/PasinduSuraweera/wso2-apim-enterprise-demo
cd wso2-apim-enterprise-demo
```

### 2. Environment Configuration
```bash
# Create environment file
cp .env.example .env

# Edit .env file with your settings
# Note: ACCESS_TOKEN will be added later
```

### 3. WSO2 API Manager Setup

**Option A: Docker (Recommended)**
```bash
# Download WSO2 APIM Docker image
docker pull wso2/wso2am:4.2.0

# Run WSO2 APIM container
docker run -it -p 8280:8280 -p 8243:8243 -p 9443:9443 \
  --name wso2am wso2/wso2am:4.2.0
```

**Option B: Direct Installation**
```bash
# Download WSO2 APIM from https://wso2.com/api-manager/
# Extract to preferred location
# Navigate to bin directory
./api-manager.sh start  # Linux/Mac
api-manager.bat start   # Windows
```

### 4. Verify WSO2 APIM Installation
```bash
# Check if services are running
curl -k https://localhost:9443/publisher
curl -k https://localhost:9443/devportal

# Default credentials: admin/admin
```

## Backend Service Setup

### 1. Navigate to Backend Directory
```bash
cd backend/
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Review Configuration
```javascript
// server.js - Key configurations
const PORT = process.env.PORT || 8081;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
```

### 4. Start Backend Service
```bash
npm start
```

**Expected Output:**
```
Server running on port 8081
Inventory service started successfully
```

### 5. Verify Backend Functionality
```bash
# Test health endpoint
curl http://localhost:8081/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2025-11-16T14:33:31.000Z",
  "service": "inventory-backend",
  "version": "1.0.0",
  "uptime": 125.45
}

# Test items endpoint
curl http://localhost:8081/items
```

## WSO2 APIM Configuration

### 1. Access Publisher Portal
```
URL: https://localhost:9443/publisher
Credentials: admin/admin
```

### 2. Create New API

**Step 1: Basic Information**
- Click "Create API" → "Design a New REST API"
- **Name**: `Inventory-API`
- **Context**: `/inventory`
- **Version**: `v1.0`
- **Endpoint**: `http://localhost:8081`

**Step 2: Resource Configuration**
Add the following resources:

| Method | URL Pattern | Description |
|--------|-------------|-------------|
| GET | /health | Service health check |
| GET | /items | Get all inventory items |
| GET | /items/{id} | Get item by ID |
| GET | /categories | Get product categories |
| POST | /items | Create new item |

**Example Resource Configuration:**
```
Resource: GET /health
- URL Pattern: /health
- Description: Health check endpoint
- Parameters: None
- Responses: 200 (Success)
```

### 3. Configure Security

**Step 1: Runtime Configurations**
- Navigate to "Runtime Configurations"
- **Application Security**: OAuth2 (enabled)
- **Transport Security**: HTTPS only

**Step 2: CORS Configuration**
```
Access Control Allow Origin: *
Access Control Allow Methods: GET, POST, PUT, DELETE, OPTIONS
Access Control Allow Headers: Authorization, Content-Type
```

### 4. Set Up Rate Limiting

**Step 1: Subscription Policies** (Admin Portal)
1. Go to Admin Portal: `https://localhost:9443/admin`
2. Navigate to "Throttle Policies" → "Subscription Policies"
3. Verify existing policies:
   - **Gold**: 5000 requests/minute
   - **Silver**: 2000 requests/minute  
   - **Bronze**: 1000 requests/minute

**Step 2: Application Policies**
1. Go to "Throttle Policies" → "Application Policies"
2. Create/verify **50PerMin** policy:
   - **Name**: 50PerMin
   - **Quota**: 50 requests
   - **Unit Time**: 1 minute

### 5. Deploy API

**Step 1: Save and Deploy**
- Click "Save" to save configurations
- Navigate to "Deployments"
- Click "Deploy New Revision"
- Select "Default" gateway
- Click "Deploy"

**Step 2: Verify Deployment**
- Status should show "Deployed"
- Gateway URL: `https://localhost:8243/inventory/v1.0`

### 6. Publish API

**Step 1: Lifecycle Management**
- Navigate to "Lifecycle"
- Click "Publish" to make API available in Developer Portal

**Step 2: Verification**
- Status should change to "Published"
- API should appear in Developer Portal

## Client Application Setup

### 1. Access Developer Portal
```
URL: https://localhost:9443/devportal
Credentials: admin/admin
```

### 2. Create Application

**Step 1: Application Details**
- Click "Applications" → "Add Application"
- **Name**: `Inventory-Client-App`
- **Quota Policy**: `50PerMin`
- **Description**: `Client application for inventory management demo`

**Step 2: Application Configuration**
- **Grant Types**: Client Credentials ✅, Password ✅
- **Callback URL**: (leave empty for Client Credentials)

### 3. Subscribe to API

**Step 1: Find API**
- Go to "APIs" tab
- Find "Inventory-API v1.0"
- Click on it

**Step 2: Create Subscription**
- Click "Subscribe"
- **Application**: Select "Inventory-Client-App"
- **Subscription Tier**: Select "Gold"
- Click "Subscribe"

### 4. Generate Access Token

**Step 1: Production Keys**
- Go to "Applications" → "Inventory-Client-App"
- Click "Production Keys"
- Ensure "Client Credentials" is checked
- Click "Generate Keys"

**Step 2: Copy Credentials**
```bash
# You'll receive:
Consumer Key: [your-consumer-key]
Consumer Secret: [your-consumer-secret]
Access Token: [your-access-token]
```

**Step 3: Update Environment File**
```bash
# Add to .env file
ACCESS_TOKEN=your-access-token-here
CONSUMER_KEY=your-consumer-key
CONSUMER_SECRET=your-consumer-secret
```

### 5. Load Environment Variables
```bash
# Load environment variables
source .env

# Verify token is set
echo "Token: ${ACCESS_TOKEN:0:20}..."
```

## Testing and Validation

### 1. Basic Authentication Test
```bash
# Test without token (should fail)
curl https://localhost:8243/inventory/v1.0/health -k

# Expected: HTTP 401 Unauthorized
{
  "code": "900902",
  "message": "Missing Credentials"
}

# Test with token (should work)
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/health \
     -k

# Expected: HTTP 200 OK
{
  "status": "healthy",
  "timestamp": "2025-11-16T14:33:31.000Z",
  "service": "inventory-backend",
  "version": "1.0.0",
  "uptime": 1250.45
}
```

### 2. API Endpoints Test
```bash
# Test all endpoints
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/items -k

curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/categories -k

curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/items/1 -k
```

### 3. Rate Limiting Test
```bash
# Make script executable
chmod +x scripts/test-throttling.sh

# Run rate limiting test
./scripts/test-throttling.sh
```

**Expected Results:**
```
✅ Requests 1-50:  HTTP 200 OK
🚫 Requests 51-60: HTTP 429 Too Many Requests
📊 Success Rate:   83.3% (50/60)
```

### 4. Postman Testing

**Step 1: Import Collection**
- Open Postman
- Import `docs/postman/inventory-api-collection.json`

**Step 2: Set Environment**
- Create new environment
- Add variable: `accessToken` = your access token
- Add variable: `baseUrl` = `https://localhost:8243/inventory/v1.0`

**Step 3: Test Endpoints**
- Run health check request
- Run get items request
- Verify responses and status codes

## Performance Validation

### 1. Response Time Test
```bash
# Test response time
curl -w "Response Time: %{time_total}s\n" \
     -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/health \
     -k -s -o /dev/null
```

### 2. Concurrent Request Test
```bash
# Run multiple requests simultaneously
for i in {1..10}; do
  curl -H "Authorization: Bearer $ACCESS_TOKEN" \
       https://localhost:8243/inventory/v1.0/health \
       -k -s &
done
wait
```

### 3. Memory and CPU Monitoring
```bash
# Monitor Docker container resources
docker stats wso2am

# Monitor Node.js process
top -p $(pgrep -f "node.*server.js")
```

## Troubleshooting

### Common Issues and Solutions

**Issue 1: WSO2 APIM won't start**
```bash
# Check if ports are available
netstat -an | grep 9443
netstat -an | grep 8243

# Free up ports if needed
sudo kill -9 $(lsof -ti:9443)
```

**Issue 2: Backend service connection refused**
```bash
# Verify backend is running
curl http://localhost:8081/health

# Check Node.js process
ps aux | grep node

# Restart if needed
cd backend && npm start
```

**Issue 3: Token validation failures**
```bash
# Check token format
echo $ACCESS_TOKEN | wc -c  # Should be 60+ characters

# Regenerate token if needed
# Go to Developer Portal → Applications → Production Keys → Generate Keys
```

**Issue 4: SSL certificate errors**
```bash
# Use -k flag to ignore SSL errors in development
curl -k https://localhost:8243/...

# Or add certificate to trusted store for production
```

**Issue 5: Rate limiting not working**
```bash
# Check application policy
# Admin Portal → Throttle Policies → Application Policies

# Verify subscription
# Developer Portal → Applications → Subscriptions
```

### Log Locations

**WSO2 APIM Logs:**
```bash
# Docker container
docker logs wso2am

# Direct installation
tail -f <WSO2_HOME>/repository/logs/wso2carbon.log
```

**Backend Service Logs:**
```bash
# Console output when running npm start
# Add file logging if needed
```

### Health Check Commands

**Complete System Health Check:**
```bash
#!/bin/bash
echo "=== System Health Check ==="

echo "1. Backend Service:"
curl -s http://localhost:8081/health | jq .status || echo "❌ Backend Down"

echo "2. WSO2 Publisher:"
curl -k -s https://localhost:9443/publisher > /dev/null && echo "✅ Publisher OK" || echo "❌ Publisher Down"

echo "3. WSO2 Gateway:"
curl -k -s https://localhost:8243/ > /dev/null && echo "✅ Gateway OK" || echo "❌ Gateway Down"

echo "4. API Authentication:"
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/health \
     -k | jq .status || echo "❌ API Auth Failed"

echo "=== Health Check Complete ==="
```

## Next Steps

After successful implementation:

1. **Documentation**: Update any custom configurations
2. **Security**: Change default passwords in production
3. **Monitoring**: Set up logging and analytics
4. **Scaling**: Consider clustering for production use
5. **CI/CD**: Integrate with deployment pipelines

---

*Implementation Guide Version: 1.0*  
*Last Updated: 2025-11-16*  
*Author: Pasindu Suraweera*