# Troubleshooting Guide - Common Issues & Solutions

## 🔴 Critical Issues (App Won't Run)

### 1. "Cannot find module" or Import Errors

**Symptoms:**
- App crashes on startup
- Red screen with module errors
- "Unable to resolve module"

**Solutions:**
```bash
# Solution 1: Clear cache and reinstall
cd mobile
rm -rf node_modules
npm install
npx expo start -c

# Solution 2: Clear watchman (if installed)
watchman watch-del-all

# Solution 3: Reset Metro bundler
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
npx expo start -c

# Solution 4: Check file paths
# Make sure all imports match actual file locations:
# ✅ './screens/WorkoutScreen' if file is in screens/
# ❌ './WorkoutScreen' if file is actually in screens/
```

---

### 2. "Network Request Failed" / Can't Connect to Backend

**Symptoms:**
- All API calls fail
- "Network request failed" error
- Timeout errors

**Diagnosis Steps:**
```bash
# Step 1: Is backend running?
curl http://localhost:3000/health
# Should return: {"status":"ok",...}

# Step 2: Can you reach it from your computer?
# Open browser: http://localhost:3000/health

# Step 3: Are you using correct IP?
# Run this to find your local IP:
# macOS/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows:
ipconfig | findstr IPv4
```

**Solutions:**

**For iOS Simulator:**
```javascript
// App.js
export const API_CONFIG = {
  baseURL: 'http://localhost:3000',  // ✅ This works
};
```

**For Android Emulator:**
```javascript
// App.js
export const API_CONFIG = {
  baseURL: 'http://10.0.2.2:3000',  // ✅ Special IP for Android
};
```

**For Physical Device:**
```javascript
// App.js  
export const API_CONFIG = {
  baseURL: 'http://192.168.1.XXX:3000',  // ✅ Your computer's IP
};

// Find your IP:
// Mac/Linux: ifconfig | grep "inet "
// Windows: ipconfig
// Should look like 192.168.x.x or 10.0.x.x
```

**Alternative: Use ngrok (Easiest for Physical Device)**
```bash
# Install ngrok
npm install -g ngrok

# Expose your backend
ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Update App.js:
export const API_CONFIG = {
  baseURL: 'https://abc123.ngrok.io',
};
```

**Firewall Issues:**
```bash
# macOS: Allow port 3000
# System Preferences > Security > Firewall > Firewall Options
# Allow Node to accept incoming connections

# Windows: Allow port 3000
# Windows Defender Firewall > Allow an app
# Add Node.js to allowed apps

# Linux: Open port 3000
sudo ufw allow 3000
```

---

### 3. "Ollama Not Connected" / Backend Health Check Fails

**Symptoms:**
- Backend starts but shows "Ollama disconnected"
- `/health` returns `"ollama": "disconnected"`
- Workouts/chat don't generate

**Diagnosis:**
```bash
# Step 1: Is Ollama running?
ps aux | grep ollama

# Step 2: Can you reach Ollama?
curl http://localhost:11434/api/tags

# Step 3: Is the model available?
ollama list
# Should show llama3.1:8b or your chosen model
```

**Solutions:**

**Solution 1: Start Ollama**
```bash
# Start Ollama service
ollama serve

# In another terminal, test it
ollama run llama3.1:8b
# Type "hello" and press Enter
# If it responds, Ollama is working
```

**Solution 2: Pull the Model**
```bash
# Pull the model (5GB download)
ollama pull llama3.1:8b

# Verify it's available
ollama list
```

**Solution 3: Check Ollama Port**
```bash
# Verify Ollama is on port 11434
lsof -i :11434

# If different port, update backend/server.js:
const ollama = new OllamaService({
  baseURL: 'http://localhost:XXXX',  // Your port
});
```

**Solution 4: Restart Everything**
```bash
# Kill Ollama
pkill ollama

# Kill Node
pkill node

# Restart Ollama
ollama serve

# In new terminal, restart backend
cd backend
npm start
```

---

## 🟡 Performance Issues

### 4. Slow AI Responses (30+ seconds)

**Symptoms:**
- Workout generation takes forever
- Chat responses very slow
- App feels laggy

**Solutions:**

**Option 1: Use Smaller Model**
```bash
# Pull faster model
ollama pull mistral:7b  # ~4GB, much faster

# Update backend/server.js:
const ollama = new OllamaService({
  model: 'mistral:7b',  // Instead of llama3.1:8b
});
```

**Option 2: Reduce Response Length**
```javascript
// In backend/server.js
await ollama.generate(
  prompt,
  systemPrompt,
  { 
    temperature: 0.6,
    num_predict: 512,  // Limit output tokens
  }
);
```

**Option 3: Increase RAM for Ollama**
```bash
# Check your RAM usage
# macOS:
Activity Monitor > Memory tab

# Linux:
htop

# If low on memory, close other apps
# Minimum 8GB RAM recommended for llama3.1:8b
# Minimum 6GB RAM for mistral:7b
```

---

### 5. App Crashes or Freezes

**Symptoms:**
- App closes unexpectedly
- Screen freezes
- Unresponsive buttons

**Solutions:**

**Check Console Logs:**
```bash
# In the terminal running Expo/React Native
# Look for error messages

# Common causes:
# 1. Out of memory - restart device
# 2. Infinite loop in useEffect - check dependency arrays
# 3. Unhandled promise rejection - add .catch() to all fetches
```

**Add Error Boundaries:**
```javascript
// In App.js, wrap content with error boundary
import React from 'react';
import { Text, View } from 'react-native';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong. Please restart the app.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Wrap your app
export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        {/* Your app */}
      </NavigationContainer>
    </ErrorBoundary>
  );
}
```

---

## 🟢 UI/UX Issues

### 6. Icons Not Showing

**Symptoms:**
- X or ? instead of icons
- Blank spaces where icons should be

**Solutions:**

**For Expo:**
```bash
# Reinstall vector icons
npx expo install react-native-vector-icons

# Clear cache
npx expo start -c
```

**For Bare React Native (iOS):**
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

**For Bare React Native (Android):**
```gradle
// android/app/build.gradle
// Add this at the bottom:
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

---

### 7. Text Cut Off or Overflowing

**Symptoms:**
- Text doesn't fit in containers
- Words cut off mid-sentence
- Scrolling issues

**Solutions:**
```javascript
// Add numberOfLines and ellipsizeMode
<Text numberOfLines={1} ellipsizeMode="tail">
  Long text that might overflow...
</Text>

// Make containers scrollable
<ScrollView>
  <Text>{longContent}</Text>
</ScrollView>

// Use flex properly
<View style={{ flex: 1, flexShrink: 1 }}>
  <Text style={{ flexShrink: 1 }}>Flexible text</Text>
</View>
```

---

### 8. Keyboard Covering Inputs

**Symptoms:**
- Keyboard blocks text inputs
- Can't see what you're typing

**Solutions:**
```javascript
// Use KeyboardAvoidingView
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <TextInput />
</KeyboardAvoidingView>

// Or use react-native-keyboard-aware-scroll-view
npm install react-native-keyboard-aware-scroll-view
```

---

## 🔧 Development Issues

### 9. Changes Not Reflecting

**Symptoms:**
- Code changes don't show up
- Old version keeps running

**Solutions:**
```bash
# Solution 1: Hard refresh
# iOS Simulator: Cmd+R
# Android Emulator: RR (double tap R)
# Physical device: Shake device, tap "Reload"

# Solution 2: Clear cache
npx expo start -c

# Solution 3: Reset everything
rm -rf node_modules
npm install
rm -rf .expo
npx expo start -c
```

---

### 10. Build Errors

**Symptoms:**
- "Build failed"
- Can't install on device
- Signing errors

**Solutions:**

**For Expo:**
```bash
# Clear Expo cache
rm -rf .expo

# Reinstall Expo packages
npm install expo@latest

# Try EAS build instead
npm install -g eas-cli
eas build --platform ios
```

**For iOS (Bare React Native):**
```bash
# Clean build
cd ios
xcodebuild clean
pod deintegrate
pod install
cd ..

# Rebuild
npx react-native run-ios
```

**For Android (Bare React Native):**
```bash
# Clean Gradle
cd android
./gradlew clean
cd ..

# Rebuild
npx react-native run-android
```

---

## 📱 Device-Specific Issues

### 11. Works on Simulator but Not Physical Device

**Causes:**
- Different network (not same WiFi)
- Firewall blocking connections
- Using 'localhost' instead of IP address

**Solutions:**
```bash
# 1. Verify same WiFi network
# Check on device: Settings > WiFi
# Check on computer: System Preferences/Settings > WiFi
# Must be exactly the same network!

# 2. Use ngrok (easiest solution)
ngrok http 3000
# Use the https URL in API_CONFIG

# 3. Check API_CONFIG uses IP, not localhost
# ❌ http://localhost:3000
# ✅ http://192.168.1.100:3000
```

---

### 12. Android-Specific Issues

**Issue: "Unable to load script"**
```bash
# Start Metro bundler separately
npx react-native start

# In another terminal
npx react-native run-android
```

**Issue: "Could not connect to development server"**
```bash
# Reverse the port
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3000 tcp:3000
```

---

## 🆘 Nuclear Options (Last Resort)

### When Nothing Else Works

```bash
# 1. Complete clean slate
cd mobile
rm -rf node_modules
rm -rf .expo
rm -rf ios/build
rm -rf android/build
rm package-lock.json

# 2. Reinstall everything
npm install

# 3. Clear all caches
npm start -- --reset-cache

# 4. Restart computer (seriously)
# Restart backend, Ollama, and mobile dev server

# 5. Try different device/emulator
# Sometimes it's hardware-specific
```

---

## 📊 Debugging Checklist

When something goes wrong, check these in order:

1. **Backend Health**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Ollama Status**
   ```bash
   ollama list
   curl http://localhost:11434/api/tags
   ```

3. **Network Connectivity**
   ```bash
   # From phone, can you reach computer?
   # Try opening: http://YOUR_IP:3000/health
   # in phone's browser
   ```

4. **Console Logs**
   - Check backend terminal for errors
   - Check Expo/RN terminal for errors
   - Check browser DevTools if using web

5. **File Structure**
   ```
   mobile/
   ├── App.js (✅ exists?)
   ├── HomeScreen.js (✅ exists?)
   ├── ChatScreen.js (✅ exists?)
   ├── WorkoutGeneratorScreen.js (✅ exists?)
   └── screens/
       ├── WorkoutScreen.js (✅ exists?)
       ├── WorkoutDetailScreen.js (✅ exists?)
       ├── ExerciseDetailScreen.js (✅ exists?)
       └── ProfileScreen.js (✅ exists?)
   ```

6. **Dependencies**
   ```bash
   npm list react-navigation
   npm list @react-native-async-storage/async-storage
   npm list react-native-vector-icons
   ```

---

## 💡 Prevention Tips

**To avoid issues in the future:**

1. **Always use version control (git)**
   ```bash
   git init
   git add .
   git commit -m "Working state"
   # Now you can always revert!
   ```

2. **Lock dependency versions**
   ```json
   // package.json
   // Use exact versions (no ^ or ~)
   "dependencies": {
     "react-native": "0.73.2",  // ✅ Exact
     "expo": "~50.0.6"  // ❌ Might update
   }
   ```

3. **Document your setup**
   - What IP address are you using?
   - What model did you install?
   - Any custom configurations?

4. **Test incrementally**
   - Make one change at a time
   - Test after each change
   - Don't pile up changes

5. **Keep logs**
   ```bash
   # Save backend logs
   npm start > backend.log 2>&1

   # Save mobile logs
   npx expo start > mobile.log 2>&1
   ```

---

## 🔍 Still Need Help?

1. **Check the documentation**
   - SETUP_GUIDE.md
   - API_DOCUMENTATION.md
   - MVP_SETUP_INSTRUCTIONS.md

2. **Enable verbose logging**
   ```javascript
   // In server.js
   console.log('Detailed info:', JSON.stringify(data, null, 2));
   
   // In mobile screens
   console.log('API Response:', response);
   ```

3. **Isolate the problem**
   - Does it work on a fresh device?
   - Does it work with a different model?
   - Does it work with minimal code?

4. **Google the exact error message**
   - Copy the full error
   - Search: "[error message] react native"
   - Check Stack Overflow, GitHub issues

---

**Remember:** Most issues are configuration, not code! Double-check your API URLs, network settings, and file paths first.

Good luck debugging! 🐛🔨
