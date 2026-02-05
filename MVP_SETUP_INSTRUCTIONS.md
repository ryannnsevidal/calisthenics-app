# MVP Setup Instructions - Step by Step

This guide will walk you through setting up the complete MVP with all critical components.

---

## 📋 Pre-Flight Checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] Ollama installed
- [ ] React Native development environment set up
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] A physical device OR emulator/simulator

---

## 🔴 PHASE 1: Backend Setup (15 minutes)

### Step 1: Install and Start Ollama

```bash
# Install Ollama (if not installed)
# macOS/Linux:
curl -fsSL https://ollama.ai/install.sh | sh

# Windows: Download from https://ollama.ai/download

# Pull the AI model (this takes 5-10 minutes, ~5GB download)
ollama pull llama3.1:8b

# Verify model is available
ollama list
# You should see llama3.1:8b in the list

# Start Ollama service (if not auto-started)
ollama serve
```

### Step 2: Setup Backend Server

```bash
# Navigate to backend directory
cd calisthenics-ai-app/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env if needed (optional)
# nano .env  # or use your favorite editor

# Start the server
npm start
```

**Expected Output:**
```
🚀 Server running on port 3000
📍 Ollama URL: http://localhost:11434
🤖 Model: llama3.1:8b
✅ Ollama connected successfully
```

### Step 3: Test Backend

Open a new terminal:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","ollama":"connected","model":"llama3.1:8b"}

# Test chat endpoint (optional)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "message": "Hello!",
    "conversationId": "test_conv"
  }'
```

✅ **Checkpoint:** Backend should be running on port 3000 with Ollama connected.

---

## 🔴 PHASE 2: Mobile App Setup (20 minutes)

### Step 1: Project Structure

First, organize your files:

```bash
cd calisthenics-ai-app/mobile

# Create screens directory
mkdir -p screens

# Move screen files to correct locations
# HomeScreen.js, ChatScreen.js, WorkoutGeneratorScreen.js stay in root
# WorkoutScreen.js, ProfileScreen.js, ExerciseDetailScreen.js, WorkoutDetailScreen.js go in screens/
```

**Correct File Structure:**
```
mobile/
├── App.js                          # Main app file
├── HomeScreen.js                   # Home screen (root)
├── ChatScreen.js                   # Chat screen (root)
├── WorkoutGeneratorScreen.js       # Workout generator (root)
├── config/
│   └── api.js                      # API configuration
├── screens/
│   ├── WorkoutScreen.js            # Workout list
│   ├── WorkoutDetailScreen.js      # Workout details
│   ├── ExerciseDetailScreen.js     # Exercise form guide
│   └── ProfileScreen.js            # User profile
└── package.json
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install

# Or if you're starting fresh with Expo:
npx create-expo-app .

# Then install navigation packages
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack

# Install required dependencies
npm install react-native-screens react-native-safe-area-context react-native-vector-icons @react-native-async-storage/async-storage axios

# For Expo, also run:
npx expo install react-native-screens react-native-safe-area-context
```

### Step 3: Configure API Connection

**For iOS Simulator:**
```javascript
// In App.js or config/api.js
export const API_CONFIG = {
  baseURL: 'http://localhost:3000',
};
```

**For Android Emulator:**
```javascript
// In App.js or config/api.js
export const API_CONFIG = {
  baseURL: 'http://10.0.2.2:3000',  // Special IP for host machine
};
```

**For Physical Device (RECOMMENDED FOR TESTING):**

1. Find your computer's local IP:
   ```bash
   # macOS/Linux:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows:
   ipconfig
   # Look for "IPv4 Address" under your active network
   ```

2. Update API_CONFIG:
   ```javascript
   export const API_CONFIG = {
     baseURL: 'http://192.168.1.XXX:3000',  // Replace XXX with your IP
   };
   ```

3. **IMPORTANT:** Make sure your phone and computer are on the same WiFi network!

### Step 4: Start Mobile App

```bash
# Start Expo development server
npm start

# Or
npx expo start
```

**What to do next:**
1. A QR code will appear in your terminal
2. Install **Expo Go** app on your phone (iOS App Store / Google Play Store)
3. Scan the QR code with Expo Go (Android) or Camera app (iOS)
4. The app will load on your device

✅ **Checkpoint:** App loads on your device showing the home screen.

---

## 🔴 PHASE 3: Test Critical Features (15 minutes)

### Test 1: Backend Connection

1. Open the app
2. Go to **Profile** tab
3. You should NOT see connection errors
4. If you see errors, check:
   - Backend is running (`http://localhost:3000/health`)
   - API_CONFIG uses correct IP address
   - Phone and computer on same network

### Test 2: Generate Workout

1. Go to **Home** tab
2. Tap "Generate New Workout"
3. Fill out the form:
   - Fitness Level: Beginner
   - Goals: "Build upper body strength"
   - Equipment: Check "Pull-up bar"
   - Days: 3
   - Duration: 45
4. Tap "Generate My Plan 🎯"
5. **Watch the streaming:** You should see text appearing in real-time
6. **Expected time:** 10-30 seconds for full workout

✅ **Checkpoint:** Workout generates successfully with streaming text.

### Test 3: View Workouts

1. Go to **Workouts** tab
2. You should see your generated workout in the list
3. Tap on the workout
4. You should see full workout details
5. Tap "Start Workout" (will show "coming soon" alert)

✅ **Checkpoint:** Workout appears in list and opens in detail view.

### Test 4: Chat with AI

1. Go to **Chat** tab
2. Type: "What is a good beginner workout?"
3. Send message
4. **Watch the streaming:** You should see AI response appearing word-by-word
5. **Expected time:** 5-15 seconds for response

✅ **Checkpoint:** Chat works with streaming responses.

### Test 5: Exercise Guidance

1. Go to **Home** tab
2. Tap on any exercise card (e.g., "Push-ups")
3. Wait for guidance to load
4. You should see detailed form instructions

✅ **Checkpoint:** Exercise guide loads and displays properly.

### Test 6: Profile

1. Go to **Profile** tab
2. Tap "Edit"
3. Enter your name
4. Select fitness level
5. Tap "Save"
6. Reopen app - your info should be saved

✅ **Checkpoint:** Profile saves and persists across app restarts.

---

## 🟡 PHASE 4: Common Issues & Fixes

### Issue 1: "Network request failed"

**Cause:** App can't reach backend server

**Solutions:**
```bash
# 1. Verify backend is running
curl http://localhost:3000/health

# 2. Check your local IP (for physical device)
# macOS/Linux:
ifconfig | grep "inet "

# Windows:
ipconfig

# 3. Update API_CONFIG in App.js with your IP
# Example: http://192.168.1.100:3000

# 4. Make sure phone and computer on same WiFi

# 5. Check firewall isn't blocking port 3000
```

### Issue 2: "Ollama not connected"

**Cause:** Ollama service not running or model not loaded

**Solutions:**
```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama if not running
ollama serve

# In another terminal, test it
ollama run llama3.1:8b
# Type a message to test

# Pull model if not found
ollama pull llama3.1:8b
```

### Issue 3: Slow AI Responses

**Cause:** Model is large or computer is slow

**Solutions:**
```bash
# Option 1: Use smaller, faster model
ollama pull mistral:7b

# In backend/server.js, change:
model: 'mistral:7b',  // Instead of llama3.1:8b

# Option 2: Reduce response length
# In server.js, add to options:
options: {
  num_predict: 512,  // Limit tokens
  temperature: 0.6,  // More focused
}
```

### Issue 4: Module Import Errors

**Cause:** Incorrect file paths or missing dependencies

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Clear Metro bundler cache
npx expo start -c

# Or for React Native CLI:
npx react-native start --reset-cache
```

### Issue 5: Icons Not Showing

**Cause:** react-native-vector-icons not linked properly

**Solutions:**
```bash
# For Expo (should work automatically)
npx expo install react-native-vector-icons

# For bare React Native:
# iOS:
cd ios && pod install && cd ..

# Android: Edit android/app/build.gradle
# Add: apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

---

## 🟢 PHASE 5: Optional Improvements (After MVP Works)

### 1. Add Better Error Messages

In `App.js`, enhance the connection test:

```javascript
useEffect(() => {
  testConnection();
}, []);

const testConnection = async () => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/health`);
    const data = await response.json();
    
    if (data.ollama !== 'connected') {
      Alert.alert(
        'Backend Warning',
        'AI backend is not fully connected. Some features may not work.',
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    Alert.alert(
      'Connection Error',
      `Cannot reach backend at ${API_CONFIG.baseURL}\n\n` +
      'Please check:\n' +
      '1. Backend server is running\n' +
      '2. API URL is correct\n' +
      '3. Same WiFi network\n\n' +
      'See SETUP_GUIDE.md for help',
      [{ text: 'OK' }]
    );
  }
};
```

### 2. Add Loading States

Ensure every screen shows loading indicators:
- ✅ WorkoutScreen - Has loading state
- ✅ ExerciseDetailScreen - Has loading state  
- ✅ ChatScreen - Has typing indicator
- ✅ WorkoutGeneratorScreen - Has generating state

### 3. Add Pull-to-Refresh

Already implemented in WorkoutScreen! Test it:
1. Go to Workouts tab
2. Pull down to refresh
3. List should reload

### 4. Test Error Scenarios

**Test offline behavior:**
1. Turn off WiFi on your phone
2. Try to generate workout
3. Should show friendly error message

**Test backend down:**
1. Stop backend server (`Ctrl+C`)
2. Try to use app
3. Should show connection error

---

## 📊 MVP Success Checklist

Before considering your MVP complete, verify:

### Core Functionality
- [ ] Backend starts without errors
- [ ] Ollama connects successfully
- [ ] Mobile app loads on device
- [ ] Can generate workouts (with streaming)
- [ ] Can chat with AI (with streaming)
- [ ] Can view workout list
- [ ] Can open workout details
- [ ] Can view exercise guides
- [ ] Profile saves/loads correctly
- [ ] Navigation works smoothly

### Error Handling
- [ ] Shows error when backend is down
- [ ] Shows error when Ollama not connected
- [ ] Shows loading states during API calls
- [ ] Handles empty states (no workouts)
- [ ] Timeout messages for slow responses

### User Experience
- [ ] No app crashes during normal use
- [ ] All buttons are tappable
- [ ] All icons display correctly
- [ ] Text is readable on all screens
- [ ] Safe area respected (notches, status bar)

### Performance
- [ ] App loads in < 3 seconds
- [ ] Workout generation completes in < 30 seconds
- [ ] Chat responses start streaming in < 5 seconds
- [ ] Smooth scrolling on all screens
- [ ] No memory warnings in console

---

## 🎯 Demo Script

When demonstrating your MVP:

**1. Show the value proposition (30 seconds)**
> "This is Atlas Coach - a ChatGPT-style fitness app powered by a local AI. Unlike other apps, all data stays private on your device. Let me show you..."

**2. Generate a workout (1 minute)**
> "I'll create a personalized workout. I'm a beginner, want to build strength, have a pull-up bar, and can train 3 days a week..."
> 
> [Fill form, tap generate, show streaming text appearing]
> 
> "Notice how it streams in real-time, just like ChatGPT. In 15 seconds, I have a complete, personalized program."

**3. Chat with AI (30 seconds)**
> "I can also chat directly with the AI coach..."
> 
> [Type: "How do I improve my push-ups?"]
> 
> "See how it responds immediately with detailed, helpful advice."

**4. Show exercise guides (30 seconds)**
> "For any exercise, I can get detailed form guidance..."
> 
> [Tap exercise, show detail screen]
> 
> "This breaks down the movement, common mistakes, and safety tips."

**5. Highlight privacy (15 seconds)**
> "The key differentiator: everything runs locally. Your data never leaves your device, and there are no ongoing API costs."

---

## 🚀 Next Steps After MVP

Once your MVP is working:

1. **Get Feedback**
   - Show to 3-5 potential users
   - Watch them use it (don't help!)
   - Note what confuses them

2. **Fix Critical Issues**
   - Any crashes or errors
   - Confusing UI elements
   - Performance problems

3. **Add Quick Wins**
   - Dark mode (1-2 days)
   - Rest timer (1 day)
   - Export workout to PDF (2-3 days)

4. **Prepare for Launch**
   - Take screenshots
   - Record demo video
   - Write app store description
   - Create privacy policy

5. **Deploy Backend** (if going public)
   - Set up server (DigitalOcean, AWS, etc.)
   - Install Ollama on server
   - Update API_CONFIG to production URL

---

## 📞 Need Help?

**Common Resources:**
- `SETUP_GUIDE.md` - Detailed setup info
- `API_DOCUMENTATION.md` - API endpoints reference
- `ROADMAP.md` - Future features

**Debugging:**
1. Check backend logs in terminal
2. Check Expo logs in terminal
3. Check React Native debugger (Cmd+D or Ctrl+M)
4. Add `console.log()` statements

**Still stuck?**
- Double-check all file paths match the structure above
- Verify all dependencies installed
- Try clearing caches and reinstalling
- Test on a different device/emulator

---

**Estimated Total Time: 1-2 hours**

✅ Backend setup: 15 min
✅ Mobile setup: 20 min  
✅ Testing: 15 min
✅ Fixes & polish: 30-60 min

Good luck! 🚀💪
