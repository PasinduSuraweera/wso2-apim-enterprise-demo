# Troubleshooting Guide

Common issues, solutions, and debugging strategies for the WSO2 API Manager Enterprise Demo.

## Table of Contents
- [Quick Diagnosis](#quick-diagnosis)
- [Authentication Issues](#authentication-issues)
- [Rate Limiting Problems](#rate-limiting-problems)
- [Connection Issues](#connection-issues)
- [Performance Problems](#performance-problems)
- [Configuration Issues](#configuration-issues)
- [Logs and Monitoring](#logs-and-monitoring)
- [FAQ](#frequently-asked-questions)

## Quick Diagnosis

### System Health Check Script

Run this script to quickly identify issues:

```bash
#!/bin/bash
echo "=== WSO2 APIM System Health Check ==="

# Check backend service
echo "1. Backend Service:"
if curl -s http://localhost:8081/health > /dev/null; then
    echo "   ✅ Backend is running"
    curl -s http://localhost:8081/health | jq .status
else
    echo "   ❌ Backend is down"
fi

# Check WSO2 APIM services
echo "2. WSO2 APIM Services:"
if curl -k -s https://localhost:9443/publisher > /dev/null; then
    echo "   ✅ Publisher is accessible"
else
    echo "   ❌ Publisher is down"
fi

if curl -k -s https://localhost:8243/ > /dev/null; then
    echo "   ✅ Gateway is accessible"
else
    echo "   ❌ Gateway is down"
fi

# Check API authentication
echo "3. API Authentication:"
if [ -n "$ACCESS_TOKEN" ]; then
    if curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
       https://localhost:8243/inventory/v1.0/health -k > /dev/null; then
        echo "   ✅ API authentication working"
    else
        echo "   ❌ API authentication failed"
    fi
else
    echo "   ⚠️  ACCESS_TOKEN not set"
fi

echo "=== Health Check Complete ==="
```

### Common Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| **401 Unauthorized** | Regenerate access token |
| **Connection refused** | Start WSO2 APIM/Backend service |
| **SSL certificate error** | Add `-k` flag to curl |
| **Rate limit exceeded** | Wait 1 minute for reset |
| **Token not found** | Check `.env` file and reload |

## Authentication Issues

### Issue: HTTP 401 Unauthorized

**Symptoms:**
```json
{
  "code": "900902",
  "message": "Missing Credentials",
  "description": "Invalid Credentials. Make sure your API invocation call has a header: 'Authorization : Bearer ACCESS_TOKEN'"
}
```

**Possible Causes:**
1. Access token is missing
2. Token has expired (default: 1 hour)
3. Token format is incorrect
4. Environment variable not loaded

**Solutions:**

**Step 1: Check Token Existence**
```bash
echo "Token: ${ACCESS_TOKEN:0:20}..."
echo "Token length: ${#ACCESS_TOKEN}"
```

**Step 2: Regenerate Token**
1. Go to Developer Portal: `https://localhost:9443/devportal`
2. Applications → Inventory-Client-App → Production Keys
3. Click "Generate Access Token" or "Regenerate"
4. Copy new token to `.env` file

**Step 3: Reload Environment**
```bash
source .env
export $(cat .env | grep -v '^#' | xargs)
```

**Step 4: Test Authentication**
```bash
curl -v -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/health -k
```

### Issue: HTTP 403 Forbidden

**Symptoms:**
```json
{
  "code": "900901",
  "message": "Invalid Credentials",
  "description": "Invalid Credentials"
}
```

**Possible Causes:**
1. Token is malformed
2. Token has expired
3. Application subscription is inactive
4. API has been unpublished

**Solutions:**

**Check Subscription Status:**
1. Developer Portal → Applications → Inventory-Client-App
2. Verify subscription to Inventory-API is "UNBLOCKED"

**Verify API Status:**
1. Publisher Portal → APIs → Inventory-API
2. Check lifecycle status is "PUBLISHED"

## Rate Limiting Problems

### Issue: Rate Limiting Not Working

**Symptoms:**
- All requests return 200 OK
- No 429 (Too Many Requests) responses
- Rate limiting test passes unexpectedly

**Possible Causes:**
1. Application policy limit is too high
2. Subscription policy is more restrictive
3. Time window has reset
4. Policy configuration is incorrect

**Solutions:**

**Step 1: Verify Effective Policy**
```bash
# Check current policies in Admin Portal
# https://localhost:9443/admin
# Navigate to Throttle Policies → Application Policies
```

**Step 2: Create Stricter Policy for Testing**
1. Admin Portal → Throttle Policies → Application Policies
2. Create new policy:
   - Name: `Test-10PerMin`
   - Quota: 10
   - Unit Time: 1 minute
3. Update application to use new policy

**Step 3: Test with Rapid Requests**
```bash
# Send requests with minimal delay
for i in {1..20}; do
  curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
       https://localhost:8243/inventory/v1.0/health -k
  sleep 0.1
done
```

### Issue: Rate Limiting Too Strict

**Symptoms:**
- Getting 429 responses too quickly
- Unable to complete normal operations

**Solutions:**

**Increase Application Policy:**
1. Admin Portal → Throttle Policies → Application Policies
2. Edit current policy or create new one with higher limit
3. Update application to use new policy

**Check Policy Hierarchy:**
```
Effective Limit = MIN(Application Policy, Subscription Policy)
```

## Connection Issues

### Issue: Connection Refused

**Symptoms:**
```
curl: (7) Failed to connect to localhost port 8081: Connection refused
curl: (7) Failed to connect to localhost port 9443: Connection refused
```

**Solutions:**

**For Backend Service (Port 8081):**
```bash
# Check if Node.js process is running
ps aux | grep node

# Check port availability
netstat -an | grep 8081

# Start backend service
cd backend && npm start
```

**For WSO2 APIM (Port 9443):**
```bash
# Check Docker container
docker ps | grep wso2

# Start container if stopped
docker start wso2am

# Check logs for errors
docker logs wso2am
```

### Issue: SSL Certificate Errors

**Symptoms:**
```
curl: (60) SSL certificate problem: self signed certificate
```

**Solutions:**

**Option 1: Ignore SSL (Development Only)**
```bash
curl -k https://localhost:8243/...
```

**Option 2: Add Certificate to Trust Store**
```bash
# Get certificate
openssl s_client -connect localhost:8243 -showcerts < /dev/null 2>/dev/null | \
  openssl x509 -outform PEM > wso2-cert.pem

# Add to system trust store (varies by OS)
```

### Issue: Port Conflicts

**Symptoms:**
```
Error: listen EADDRINUSE :::8081
```

**Solutions:**

**Find Process Using Port:**
```bash
# Linux/Mac
lsof -i :8081
netstat -tulpn | grep 8081

# Windows
netstat -ano | findstr 8081
```

**Kill Process:**
```bash
# Kill by PID
kill -9 <PID>

# Kill by port (Linux/Mac)
sudo kill -9 $(lsof -ti:8081)
```

## Performance Problems

### Issue: Slow Response Times

**Symptoms:**
- API responses taking >5 seconds
- Timeouts in client applications

**Diagnostic Commands:**
```bash
# Test response time
curl -w "Response Time: %{time_total}s\n" \
     -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/health -k

# Check system resources
top
htop
docker stats wso2am
```

**Solutions:**

**Increase Memory Allocation:**
```bash
# For Docker container
docker run --memory="4g" wso2/wso2am:4.2.0

# For Node.js backend
node --max-old-space-size=4096 server.js
```

**Optimize Backend Code:**
```javascript
// Add response caching
app.use('/items', cache('5 minutes'), itemsRouter);

// Add compression
app.use(compression());
```

### Issue: High Memory Usage

**Diagnostic Commands:**
```bash
# Monitor memory usage
free -h
docker stats
ps aux --sort=-%mem | head
```

**Solutions:**
1. Restart services periodically
2. Implement proper garbage collection
3. Add memory limits to containers
4. Optimize database queries

## Configuration Issues

### Issue: API Not Found (404)

**Symptoms:**
```json
{
  "fault": {
    "code": "404",
    "message": "Not Found"
  }
}
```

**Check API Configuration:**
1. Publisher Portal → APIs → Inventory-API
2. Verify context is `/inventory`
3. Check deployment status
4. Verify gateway URL: `https://localhost:8243/inventory/v1.0`

### Issue: CORS Errors (Browser)

**Symptoms:**
```
Access to fetch at 'https://localhost:8243/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solutions:**

**Update CORS Configuration:**
1. Publisher Portal → APIs → Inventory-API → Runtime Configurations
2. Set CORS configuration:
   ```
   Access Control Allow Origin: *
   Access Control Allow Methods: GET, POST, PUT, DELETE, OPTIONS
   Access Control Allow Headers: Authorization, Content-Type
   ```

### Issue: Backend URL Configuration

**Symptoms:**
- Gateway returns 500 errors
- Backend not receiving requests

**Solutions:**

**Verify Endpoint Configuration:**
1. Publisher Portal → APIs → Inventory-API → Endpoints
2. Check production endpoint: `http://localhost:8081`
3. Test endpoint connectivity from gateway

## Logs and Monitoring

### WSO2 APIM Logs

**Docker Container Logs:**
```bash
# View recent logs
docker logs wso2am

# Follow logs in real-time
docker logs -f wso2am

# Filter for errors
docker logs wso2am 2>&1 | grep ERROR
```

**Direct Installation Logs:**
```bash
# Main log file
tail -f <WSO2_HOME>/repository/logs/wso2carbon.log

# HTTP access logs
tail -f <WSO2_HOME>/repository/logs/http_access_*.log

# Error logs
grep ERROR <WSO2_HOME>/repository/logs/wso2carbon.log
```

### Backend Service Logs

**Console Output:**
```bash
# Start with verbose logging
DEBUG=* npm start

# View specific module logs
DEBUG=express:* npm start
```

**Enable File Logging:**
```javascript
// Add to server.js
const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'app.log' }),
    new winston.transports.Console()
  ]
});
```

### Monitoring Commands

**Real-time Monitoring:**
```bash
# Monitor API requests
tail -f /path/to/access.log | grep "/inventory"

# Monitor system resources
watch -n 1 'docker stats --no-stream'

# Monitor network connections
netstat -an | grep :8243
```

### Debug Mode

**Enable Debug Logging:**

**WSO2 APIM Debug:**
1. Admin Portal → Configure → Logging
2. Set logger levels to DEBUG

**Backend Debug:**
```bash
# Start with debug mode
NODE_ENV=development DEBUG=* npm start
```

## Frequently Asked Questions

### Q: How do I reset everything and start fresh?

**A: Complete Reset Procedure:**
```bash
# Stop all services
docker stop wso2am
pkill -f "node.*server.js"

# Remove containers and volumes
docker rm wso2am
docker volume prune

# Clean environment
rm .env
rm -rf node_modules

# Start fresh
# Follow implementation guide from beginning
```

### Q: Why do I get different rate limiting behavior?

**A: Rate Limiting Factors:**
1. **Policy Hierarchy**: Most restrictive policy wins
2. **Time Windows**: Policies reset every minute
3. **Token Sharing**: Multiple clients with same token share limits
4. **Gateway Clustering**: Limits may be distributed across nodes

### Q: How do I test in production environment?

**A: Production Testing:**
1. **Use valid SSL certificates**
2. **Configure proper domain names**
3. **Set up monitoring and alerting**
4. **Use environment-specific configuration**
5. **Implement health checks**

### Q: Can I use this with different backend services?

**A: Backend Integration:**
1. **Change endpoint URL** in API configuration
2. **Update authentication** if required
3. **Modify resource definitions** to match new backend
4. **Test connectivity** and response formats

### Q: How do I scale this for production?

**A: Scaling Recommendations:**
1. **Use WSO2 APIM clustering**
2. **Implement load balancing**
3. **Add monitoring and alerting**
4. **Use external databases**
5. **Implement caching strategies**

### Q: What if I see "Internal Server Error" (500)?

**A: 500 Error Debugging:**
1. **Check backend service** is running
2. **Verify network connectivity** between gateway and backend
3. **Review logs** for detailed error messages
4. **Test backend directly** to isolate issues
5. **Check resource definitions** match backend endpoints

---

*Troubleshooting Guide Version: 1.0*  
*Last Updated: 2025-11-16*  
*Author: Pasindu Suraweera*