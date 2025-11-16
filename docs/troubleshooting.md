# Troubleshooting Guide

## Common Issues and Solutions

### Backend Service Issues

**Problem:** `npm install` fails
```bash
# Solution: Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Port 8081 already in use
```bash
# Solution: Find and kill process
lsof -ti:8081 | xargs kill -9
# Or use different port
PORT=8082 npm start
```

**Problem:** Cannot reach backend from APIM
```bash
# Check if backend is accessible
curl http://localhost:8081/health

# For Docker setups, use:
http://host.docker.internal:8081
```

### WSO2 APIM Issues

**Problem:** APIM services won't start
```bash
# Check if ports are available
netstat -an | grep :9443
netstat -an | grep :8280
netstat -an | grep :8243

# Kill existing processes
ps aux | grep wso2
kill -9 [PID]
```

**Problem:** SSL certificate warnings
```bash
# For cURL, use -k flag
curl -k https://localhost:9443/publisher

# For browser, accept the certificate or add to trusted
```

**Problem:** Cannot login to Publisher/DevPortal
- Default credentials: admin/admin
- If changed, check `deployment.toml` for admin user settings
- Clear browser cache and cookies
- Try incognito/private browsing mode

### API Creation Issues

**Problem:** Backend URL unreachable during API creation
```bash
# Verify backend is running
curl http://localhost:8081/health

# Check APIM can reach backend
# From APIM server, test connectivity
telnet localhost 8081
```

**Problem:** API deployment fails
- Check Gateway is running (port 8243)
- Verify API definition is complete
- Check for resource path conflicts
- Review deployment logs in `<APIM_HOME>/repository/logs/`

### Authentication Issues

**Problem:** 401 Unauthorized responses
```bash
# Verify token format
echo $ACCESS_TOKEN | wc -c  # Should be 64+ characters

# Check token expiration
# Default lifetime: 3600 seconds (1 hour)

# Regenerate token if expired
# DevPortal → Applications → Your App → Keys → Regenerate
```

**Problem:** 403 Forbidden responses
- Check API subscription status
- Verify subscription tier allows access
- Confirm application has required scopes
- Check if API requires specific roles

### Rate Limiting Issues

**Problem:** Rate limiting not working
- Verify subscription tier has proper rate limits
- Check if multiple applications/tokens are used
- Ensure throttling policies are properly configured
- Wait for throttling window to reset (usually 1 minute)

**Problem:** Throttling too aggressive
- Check which policy is being applied (subscription vs application)
- Verify rate limit calculations (requests per minute/hour)
- Consider using different subscription tier

### Network Issues

**Problem:** Cannot access APIM URLs
```bash
# Check if services are running
curl -k https://localhost:9443/publisher
curl -k https://localhost:9443/devportal
curl -k https://localhost:8243/

# Verify port availability
netstat -an | grep LISTEN | grep 9443
netstat -an | grep LISTEN | grep 8243
```

**Problem:** CORS errors in browser
- Check if CORS is enabled in APIM configuration
- Verify allowed origins in `deployment.toml`
- Use server-side testing (cURL) instead of browser for API calls

### Performance Issues

**Problem:** Slow API responses
```bash
# Check backend response time
time curl http://localhost:8081/items

# Monitor APIM gateway logs
tail -f <APIM_HOME>/repository/logs/wso2carbon.log

# Verify resource utilization
top
htop
```

**Problem:** High memory usage
- Increase JVM heap size in `api-manager.sh` or `api-manager.bat`
- Monitor garbage collection
- Check for memory leaks in custom mediation

## Debugging Steps

### Enable Debug Logging
1. Edit `<APIM_HOME>/repository/conf/log4j2.properties`
2. Add these lines:
```properties
logger.http-access.name = org.apache.synapse.transport.http.access
logger.http-access.level = DEBUG

logger.api-gateway.name = org.apache.synapse
logger.api-gateway.level = DEBUG
```
3. Restart APIM

### Monitor API Calls
```bash
# Watch gateway access logs
tail -f <APIM_HOME>/repository/logs/http_access*.log

# Monitor error logs
tail -f <APIM_HOME>/repository/logs/wso2carbon.log | grep ERROR
```

### Test API Independently
```bash
# Bypass APIM, test backend directly
curl http://localhost:8081/items

# Test through APIM gateway
curl -H "Authorization: Bearer $TOKEN" \
     https://localhost:8243/inventory/v1.0/items -k

# Compare response times and content
```

## Getting Help

### WSO2 Community Resources
- **Documentation:** [https://apim.docs.wso2.com/](https://apim.docs.wso2.com/)
- **Stack Overflow:** Tag questions with `wso2`, `wso2-am`, `wso2-api-manager`
- **Discord:** Join WSO2 Community Discord
- **GitHub Issues:** Report bugs at [https://github.com/wso2/product-apim](https://github.com/wso2/product-apim)

### Emergency Recovery
If APIM becomes completely unresponsive:
1. Stop all WSO2 processes
2. Clear temp files: `rm -rf <APIM_HOME>/repository/deployment/server/temp/`
3. Clear cache: `rm -rf <APIM_HOME>/repository/deployment/server/work/`
4. Restart APIM services
5. Re-import APIs if necessary

### Clean Installation
For a fresh start:
1. Backup any custom configurations
2. Download fresh APIM distribution
3. Extract to new directory
4. Start with default configuration
5. Recreate APIs step by step



