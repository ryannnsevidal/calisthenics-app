# 🏋️ Calisthenics AI App - QUICK START

Welcome! You've got a complete ChatGPT-style calisthenics coaching app with Ollama backend and React Native frontend.

## 📁 What's Inside

```
calisthenics-ai-app/
├── backend/          ← Ollama + Express server
├── mobile/           ← React Native app
└── docs/             ← Complete documentation
```

## ⚡ 5-Minute Setup

### 1. Install Ollama (if not installed)

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from https://ollama.ai/download

### 2. Pull the AI Model

```bash
ollama pull llama3.1:8b
```

This downloads ~5GB. Wait for it to complete.

### 3. Start Backend

```bash
cd backend
npm install
npm start
```

You should see: ✅ Ollama connected successfully

### 4. Start Mobile App

```bash
cd mobile
npm install
npm start
```

Then:
- Install **Expo Go** on your phone
- Scan the QR code
- App loads on your device!

### 5. Update API Connection

For mobile to connect to backend:

**Edit `mobile/App.js`:**
```javascript
export const API_CONFIG = {
  baseURL: 'http://YOUR_COMPUTER_IP:3000', // Replace with your IP
};
```

Find your IP:
- Mac/Linux: `ifconfig | grep inet`
- Windows: `ipconfig`

Example: `http://192.168.1.100:3000`

---

## 🎯 Quick Test

1. Open the app
2. Go to "Chat" tab
3. Ask: "What is a good beginner workout?"
4. See real-time AI response!

---

## 📚 Full Documentation

- **SETUP_GUIDE.md** - Complete installation guide
- **API_DOCUMENTATION.md** - All API endpoints
- **PROJECT_SUMMARY.md** - Architecture & features
- **ROADMAP.md** - Future enhancements

All in the `docs/` folder.

---

## 🆘 Troubleshooting

**Backend won't start?**
```bash
# Check Ollama is running
ollama serve

# Verify model is downloaded
ollama list
```

**Mobile can't connect?**
```bash
# Use ngrok to expose backend
ngrok http 3000

# Update App.js with ngrok URL
```

**Need help?**
Read `docs/SETUP_GUIDE.md` for detailed troubleshooting.

---

## 🚀 What You Can Do

✅ **Chat with AI coach** - Ask any fitness question
✅ **Generate workouts** - Personalized programs
✅ **Learn exercises** - Detailed form guidance
✅ **Track progress** - Analyze your gains

---

## 🎨 Customization

**Change AI Model:**
Edit `backend/server.js`:
```javascript
model: 'mistral:7b', // Faster
// OR
model: 'llama3.1:70b', // Better quality
```

**Customize Coach:**
Edit `backend/prompts.js` - change personality, style, expertise

**Style the App:**
Edit screen files in `mobile/` - colors, fonts, layout

---

## 📦 What's Included

### Backend (`backend/`)
- ✅ Express API server
- ✅ Ollama integration
- ✅ Streaming responses
- ✅ Workout generation
- ✅ Chat interface
- ✅ Form coaching

### Mobile (`mobile/`)
- ✅ Home screen
- ✅ AI chat (real-time streaming)
- ✅ Workout generator
- ✅ Exercise guides
- ✅ Profile management
- ✅ Navigation

### Documentation (`docs/`)
- ✅ Complete setup guide
- ✅ API reference
- ✅ Architecture docs
- ✅ Feature roadmap
- ✅ Best practices

---

## 💡 Next Steps

1. **Add a database** - MongoDB or PostgreSQL
2. **Implement auth** - User login/signup
3. **Dark mode** - Better UX
4. **Rest timer** - Between sets
5. **Progress graphs** - Visualize gains

See `docs/ROADMAP.md` for complete feature list!

---

## 🌟 Key Features

- **Privacy-First**: All data stays local
- **Free to Run**: No API costs
- **Offline Capable**: Works without internet
- **Customizable**: Full source code access
- **Production-Ready**: Not a demo, real app

---

## 🤖 Tech Stack

**Backend:** Node.js + Express + Ollama
**Mobile:** React Native + Expo
**AI:** Llama 3.1 (local LLM)

---

## 📞 Need Help?

1. Check `docs/SETUP_GUIDE.md`
2. Review `docs/API_DOCUMENTATION.md`
3. Read `docs/PROJECT_SUMMARY.md`

---

**Ready to build something amazing? Let's go! 💪**

Start with the backend, get it running, then launch the mobile app. You'll be chatting with your AI coach in minutes!
