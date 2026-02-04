# Calisthenics AI Workout App

A comprehensive fitness application with Ollama-powered AI backend and React Native frontend for personalized calisthenics workout planning and guidance.

##  Architecture Overview

```
┌─────────────────────────────────────┐
│     React Native Frontend           │
│  (iOS/Android Mobile App)           │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
               │
┌──────────────▼──────────────────────┐
│     Node.js/Express Backend         │
│  - REST API Endpoints               │
│  - Workout Logic                    │
│  - User Management                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Ollama LLM Service          │
│  - Workout Plan Generation          │
│  - Form Guidance                    │
│  - Progress Analysis                │
└─────────────────────────────────────┘
```

##  Project Structure

```
calisthenics-ai-app/
├── backend/
│   ├── server.js
│   ├── ollama-service.js
│   ├── workout-generator.js
│   ├── prompts/
│   │   ├── system-prompt.js
│   │   ├── workout-planner.js
│   │   └── form-coach.js
│   └── package.json
├── mobile/
│   ├── App.js
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── WorkoutScreen.js
│   │   ├── ChatScreen.js
│   │   └── ProfileScreen.js
│   ├── components/
│   │   ├── WorkoutCard.js
│   │   ├── ExerciseItem.js
│   │   └── ChatMessage.js
│   └── package.json
└── README.md
```

##  Getting Started

### Prerequisites
- Node.js 18+
- Ollama installed locally
- React Native development environment
- Expo CLI (optional but recommended)

### Backend Setup
See `backend/README.md`

### Mobile App Setup
See `mobile/README.md`

##  Features

- **AI-Powered Workout Plans**: Personalized routines based on fitness level
- **Form Guidance**: Real-time coaching on proper exercise technique
- **Progress Tracking**: Monitor your gains and improvements
- **Chat Interface**: Ask questions about exercises, nutrition, recovery
- **Workout Library**: Comprehensive database of calisthenics exercises
- **Offline Support**: Local LLM means privacy and offline capability

##  Ollama Models

Recommended models:
- `llama3.1:8b` - Best balance of speed and quality
- `llama3.1:70b` - Higher quality, slower
- `mistral:7b` - Faster, good for real-time chat

##  License

MIT
