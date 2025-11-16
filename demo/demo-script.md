# Demo Video Script (3-5 minutes)

## Intro (30 seconds)
"Hi! I'm PasinduSuraweera, and this is my WSO2 API Manager project for the WSO2 Engineering Internship Program. I'll demonstrate a complete API lifecycle including publishing, security, and rate limiting."

**Show on screen:** Project README and architecture diagram

## Backend Demo (30 seconds)
"First, let me show you the backend service I built:"

**Terminal commands:**
```bash
cd backend
npm start
curl http://localhost:8081/health
curl http://localhost:8081/items | jq
```

**Show:** JSON responses with inventory data

## APIM Publisher (60 seconds)
"Now I'll publish this API through WSO2 API Manager:"

**Browser - Publisher (https://localhost:9443/publisher):**
1. Login as admin/admin
2. Show existing "Inventory API v1.0"
3. Click on API → Show overview
4. Go to Resources tab → Show configured endpoints
5. Go to Deployments → Show gateway deployment

**Narration:** "I've configured REST resources for health, items, and categories, and deployed to the default gateway."

## Security Setup (60 seconds)  
"Next, I'll set up OAuth2 security in the Developer Portal:"

**Browser - Dev Portal (https://localhost:9443/devportal):**
1. Show "Inventory Client App" application
2. Go to Production Keys tab
3. Show existing access token (partially obscured)
4. Go to Subscriptions → Show API subscription with Gold tier (20 req/min)

**Narration:** "I've created an application, subscribed to the API with a Gold tier policy allowing 20 requests per minute, and generated OAuth2 credentials."

## API Testing (60 seconds)
"Let me test the secured API:"

**Terminal commands:**
```bash
export ACCESS_TOKEN="your-actual-token"

# Successful request
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/health -k

# Show JSON response
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://localhost:8243/inventory/v1.0/items -k | jq

# Test without token (should fail)
curl https://localhost:8243/inventory/v1.0/items -k
```

**Show:** 
- 200 OK responses with token
- 401 Unauthorized without token

## Rate Limiting Demo (60 seconds)
"Finally, let me demonstrate the rate limiting:"

**Terminal script:**
```bash
echo "Sending 25 requests to trigger rate limiting..."
for i in {1..25}; do
  echo "Request $i:"
  curl -s -w " HTTP %{http_code}\n" \
       -H "Authorization: Bearer $ACCESS_TOKEN" \
       https://localhost:8243/inventory/v1.0/items \
       -k
  sleep 0.5
done
```

**Show:** Transition from 200 OK to 429 Too Many Requests after hitting the limit

## Wrap-up (30 seconds)
"This project demonstrates a production-ready API management setup with WSO2 APIM, including:"

**Show on screen:** Bullet points:
- ✅ Complete API lifecycle
- ✅ OAuth2 security
- ✅ Rate limiting enforcement  
- ✅ Real-world usage patterns

"Thank you for watching! The complete source code and documentation are available in the GitHub repository."

**Show:** GitHub repo URL

## Technical Notes for Recording
- **Screen resolution:** 1920x1080 minimum
- **Audio:** Clear narration, no background noise
- **Recording tools:** OBS Studio, Loom, or QuickTime
- **File format:** MP4 (H.264)
- **Duration:** 3-5 minutes maximum
- **Upload:** YouTube (unlisted) or GitHub release

## Pre-recording Checklist
- [ ] Backend service running and tested
- [ ] APIM services running (Publisher, DevPortal, Gateway)
- [ ] API published and deployed
- [ ] Application created and subscribed
- [ ] Access token generated and tested
- [ ] Rate limiting script prepared
- [ ] Browser windows sized appropriately
- [ ] Terminal font large enough to read
- [ ] Demo script rehearsed