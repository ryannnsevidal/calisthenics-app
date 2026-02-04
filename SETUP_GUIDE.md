# Complete Setup Guide - Calisthenics AI App

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Mobile App Setup](#mobile-app-setup)
4. [Ollama Configuration](#ollama-configuration)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Ollama** ([Download](https://ollama.ai/download))
- **React Native Development Environment**:
  - For iOS: Xcode (Mac only)
  - For Android: Android Studio
  - Or use **Expo Go** app for quick testing

### Recommended Models
- `llama3.1:8b` (8GB RAM minimum)
- `llama3.1:70b` (16GB+ RAM for better quality)
- `mistral:7b` (6GB RAM, faster responses)

---

## Backend Setup

### 1. Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from https://ollama.ai/download

### 2. Pull the Model

```bash
# Recommended for most users (requires ~5GB)
ollama pull llama3.1:8b

# For better quality (requires ~40GB)
ollama pull llama3.1:70b

# For faster responses (requires ~4GB)
ollama pull mistral:7b
```

### 3. Verify Ollama is Running

```bash
# Start Ollama service (if not auto-started)
ollama serve

# In another terminal, test it
ollama run llama3.1:8b
```

### 4. Setup Backend Server

```bash
# Create project directory
mkdir calisthenics-ai-backend
cd calisthenics-ai-backend

# Copy backend files
# - server.js
# - ollama-service.js
# - prompts.js
# - package.json (use backend-package.json contents)

# Install dependencies
npm install

# Create .env file (optional)
echo "PORT=3000" > .env
echo "OLLAMA_URL=http://localhost:11434" >> .env
echo "OLLAMA_MODEL=llama3.1:8b" >> .env

# Start the server
npm start
```

You should see:
```
🚀 Server running on port 3000
📍 Ollama URL: http://localhost:11434
🤖 Model: llama3.1:8b
✅ Ollama connected successfully
```

### 5. Test Backend API

```bash
# Health check
curl http://localhost:3000/health

# Test chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "message": "What is a good beginner workout?",
    "conversationId": "conv_test"
  }'
```

---

## Mobile App Setup

### Option A: Using Expo (Recommended for Beginners)

```bash
# Create new Expo project
npx create-expo-app calisthenics-ai-mobile
cd calisthenics-ai-mobile

# Install dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-vector-icons
npm install @react-native-async-storage/async-storage
npm install axios

# Copy mobile app files
# - App.js
# - screens/HomeScreen.js
# - screens/ChatScreen.js
# - screens/WorkoutGeneratorScreen.js
# (and other screen files)

# Start Expo
npm start
```

Then:
1. Install **Expo Go** app on your phone
2. Scan the QR code shown in terminal
3. App will load on your device

### Option B: React Native CLI (For Production)

```bash
# Initialize React Native project
npx react-native init CalisthenicsAI
cd CalisthenicsAI

# Install dependencies (same as above)

# For iOS
cd ios
pod install
cd ..
npx react-native run-ios

# For Android
npx react-native run-android
```

### Configure API Connection

**For Expo/Testing on Device:**

The backend runs on `localhost:3000` which your phone can't access directly.

**Solution 1: Use ngrok (Easiest)**
```bash
# Install ngrok
npm install -g ngrok

# Expose backend
ngrok http 3000

# Update App.js API_CONFIG with ngrok URL
# e.g., https://abc123.ngrok.io
```

**Solution 2: Use Your Computer's Local IP**
```bash
# Find your local IP
# Mac/Linux: ifconfig | grep inet
# Windows: ipconfig

# Update App.js API_CONFIG
# e.g., http://192.168.1.100:3000
```

---

## Ollama Configuration

### Customizing the Model

Edit `server.js`:
```javascript
const ollama = new OllamaService({
  baseURL: process.env.OLLAMA_URL || 'http://localhost:11434',
  model: 'llama3.1:8b', // Change model here
  temperature: 0.7, // Adjust creativity (0-1)
});
```

### Model Comparison

| Model | Size | Speed | Quality | RAM Needed |
|-------|------|-------|---------|------------|
| mistral:7b | 4GB | ⚡⚡⚡ | ⭐⭐ | 6GB |
| llama3.1:8b | 5GB | ⚡⚡ | ⭐⭐⭐ | 8GB |
| llama3.1:70b | 40GB | ⚡ | ⭐⭐⭐⭐⭐ | 48GB |

### Optimizing Performance

**For Faster Responses:**
```javascript
// In server.js, reduce context and increase speed
options: {
  temperature: 0.6,
  top_p: 0.9,
  num_predict: 512, // Limit response length
}
```

**For Better Quality:**
```javascript
options: {
  temperature: 0.8,
  top_p: 0.95,
  num_ctx: 4096, // Larger context window
}
```

---

## Testing

### Backend Tests

```bash
# Test workout generation
curl -X POST http://localhost:3000/api/workout/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "fitnessLevel": "beginner",
    "goals": "Build upper body strength",
    "equipment": ["Pull-up bar"],
    "daysPerWeek": "3",
    "duration": "45",
    "limitations": "None"
  }'

# Test exercise form guidance
curl -X POST http://localhost:3000/api/exercise/form \
  -H "Content-Type: application/json" \
  -d '{"exerciseName": "Push-up"}'
```

### Mobile App Tests

1. **Chat Functionality**: Ask "What is a push-up?"
2. **Workout Generation**: Fill out the form and generate
3. **Streaming**: Verify real-time responses appear
4. **Navigation**: Test all tabs and screens

---

## Deployment

### Backend Deployment (Production)

**Option 1: DigitalOcean/AWS/GCP**

```bash
# Install Ollama on server
curl -fsSL https://ollama.ai/install.sh | sh

# Pull model
ollama pull llama3.1:8b

# Setup backend with PM2
npm install -g pm2
pm2 start server.js
pm2 save
pm2 startup
```

**Option 2: Docker**

```dockerfile
# Dockerfile
FROM node:18

# Install Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Copy backend files
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Expose ports
EXPOSE 3000
EXPOSE 11434

# Start services
CMD ollama serve & npm start
```

### Mobile App Deployment

**iOS (App Store):**
```bash
# Build production app
expo build:ios

# Or with EAS
eas build --platform ios
```

**Android (Google Play):**
```bash
# Build APK/AAB
expo build:android

# Or with EAS
eas build --platform android
```

---

## Troubleshooting

### Backend Issues

**"Ollama not connected"**
```bash
# Check if Ollama is running
ps aux | grep ollama

# Restart Ollama
pkill ollama
ollama serve
```

**"Model not found"**
```bash
# List available models
ollama list

# Pull the model
ollama pull llama3.1:8b
```

**"Connection refused"**
```bash
# Check if backend is running
lsof -i :3000

# Check Ollama is listening
lsof -i :11434
```

### Mobile App Issues

**"Network request failed"**
- Check backend is running: `curl http://localhost:3000/health`
- Verify API URL in `App.js` is correct
- Check firewall settings
- Use ngrok if testing on device

**"Unable to resolve module"**
```bash
# Clear cache
npm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules
npm install
```

**Slow AI responses**
- Use smaller model (mistral:7b)
- Reduce `num_predict` in options
- Upgrade server hardware

### Performance Optimization

**Backend:**
- Use caching for common queries
- Implement response streaming (already done)
- Add load balancing for multiple users
- Use Redis for session storage

**Mobile:**
- Implement pagination for workout history
- Cache responses locally
- Optimize image sizes
- Use React.memo for expensive components

---

## Advanced Configuration

### Custom System Prompts

Edit `prompts.js` to customize Atlas's personality:

```javascript
export const CALISTHENICS_SYSTEM_PROMPT = `
You are [YOUR CUSTOM PERSONALITY]...
`;
```

### Database Integration

Replace in-memory storage with MongoDB/PostgreSQL:

```javascript
// server.js
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/calisthenics');

const WorkoutSchema = new mongoose.Schema({
  userId: String,
  plan: String,
  createdAt: Date,
  // ...
});
```

### Authentication

Add JWT authentication:

```bash
npm install jsonwebtoken bcrypt
```

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  // Verify token...
};
```

---

## Support & Resources

- **Ollama Docs**: https://github.com/ollama/ollama
- **React Native**: https://reactnative.dev/
- **Expo**: https://docs.expo.dev/
- **Express**: https://expressjs.com/

For issues, check the GitHub repository or contact support.

---

**Ready to build!** 🚀 Start with the backend, verify Ollama is working, then launch the mobile app!
