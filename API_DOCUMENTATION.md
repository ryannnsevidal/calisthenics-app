# API Documentation

Base URL: `http://localhost:3000`

## Authentication
Currently no authentication required for development. Add JWT tokens for production.

---

## Endpoints

### Health Check

**GET** `/health`

Check if server and Ollama are running.

**Response:**
```json
{
  "status": "ok",
  "ollama": "connected",
  "model": "llama3.1:8b"
}
```

---

### Generate Workout Plan

**POST** `/api/workout/generate`

Generate a personalized workout plan.

**Request Body:**
```json
{
  "userId": "user_123",
  "fitnessLevel": "beginner",
  "goals": "Build upper body strength and learn handstand",
  "equipment": ["Pull-up bar", "Dip bars"],
  "daysPerWeek": "3",
  "duration": "45",
  "limitations": "Slight shoulder pain"
}
```

**Parameters:**
- `userId` (string, required): User identifier
- `fitnessLevel` (string, required): "beginner", "intermediate", or "advanced"
- `goals` (string, required): User's fitness goals
- `equipment` (array, required): Available equipment
- `daysPerWeek` (string, required): Training frequency
- `duration` (string, required): Session duration in minutes
- `limitations` (string, optional): Injuries or limitations

**Response:**
```json
{
  "success": true,
  "workoutId": "1234567890",
  "plan": "# Your Personalized Workout Plan\n\n## Program Overview..."
}
```

---

### Stream Workout Generation

**POST** `/api/workout/generate-stream`

Stream workout plan generation in real-time (Server-Sent Events).

**Request Body:** Same as `/api/workout/generate`

**Response (SSE):**
```
data: {"chunk": "# Your"}
data: {"chunk": " Personalized"}
data: {"chunk": " Workout"}
...
data: {"done": true, "workoutId": "1234567890"}
```

---

### Get Exercise Form Guidance

**POST** `/api/exercise/form`

Get detailed form coaching for a specific exercise.

**Request Body:**
```json
{
  "exerciseName": "Pull-up"
}
```

**Response:**
```json
{
  "success": true,
  "exercise": "Pull-up",
  "guidance": "## SETUP\n- Grip the bar shoulder-width apart..."
}
```

---

### Chat (Standard)

**POST** `/api/chat`

Send a message to the AI coach and get a response.

**Request Body:**
```json
{
  "userId": "user_123",
  "message": "How do I improve my pull-ups?",
  "conversationId": "conv_456"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Great question! To improve your pull-ups...",
  "conversationId": "conv_456"
}
```

---

### Chat (Streaming)

**POST** `/api/chat/stream`

Chat with real-time streaming responses (SSE).

**Request Body:** Same as `/api/chat`

**Response (SSE):**
```
data: {"chunk": "Great"}
data: {"chunk": " question!"}
...
data: {"done": true}
```

---

### Get Conversation

**GET** `/api/chat/:conversationId`

Retrieve full conversation history.

**Response:**
```json
{
  "success": true,
  "conversation": {
    "id": "conv_456",
    "userId": "user_123",
    "messages": [
      {
        "role": "user",
        "content": "Hello",
        "timestamp": "2024-02-03T10:00:00Z"
      },
      {
        "role": "assistant",
        "content": "Hi! How can I help?",
        "timestamp": "2024-02-03T10:00:01Z"
      }
    ],
    "createdAt": "2024-02-03T10:00:00Z"
  }
}
```

---

### Analyze Progress

**POST** `/api/progress/analyze`

Get AI analysis of workout progress.

**Request Body:**
```json
{
  "userId": "user_123",
  "workoutHistory": [
    {
      "date": "2024-01-01",
      "exercises": [
        {"name": "Pull-ups", "sets": 3, "reps": 8}
      ]
    }
  ],
  "currentStats": {
    "pullUps": 10,
    "pushUps": 30,
    "bodyweight": 75
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "## ACHIEVEMENTS\nYou've improved your pull-ups by 25%..."
}
```

---

### Get User Workouts

**GET** `/api/workouts/:userId`

Get all workout plans for a user.

**Response:**
```json
{
  "success": true,
  "workouts": [
    {
      "id": "123",
      "userId": "user_123",
      "plan": "...",
      "createdAt": "2024-02-03T10:00:00Z",
      "params": {
        "fitnessLevel": "beginner",
        "goals": "Build strength"
      }
    }
  ]
}
```

---

### Get Specific Workout

**GET** `/api/workout/:workoutId`

Get a specific workout plan by ID.

**Response:**
```json
{
  "success": true,
  "workout": {
    "id": "123",
    "userId": "user_123",
    "plan": "...",
    "createdAt": "2024-02-03T10:00:00Z"
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found
- `500`: Server Error (Ollama not running, etc.)

---

## Rate Limiting

In production, implement rate limiting:
- 100 requests per 15 minutes per IP
- Streaming endpoints: 10 concurrent streams per user

---

## Best Practices

### Streaming Responses

When using streaming endpoints, handle the SSE stream properly:

```javascript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(data)
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const {done, value} = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.chunk) {
        // Handle chunk
      }
    }
  }
}
```

### Error Handling

Always wrap API calls in try-catch:

```javascript
try {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result;
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
}
```

### Conversation Management

Store `conversationId` locally to maintain chat history:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save conversation ID
await AsyncStorage.setItem('currentConversation', conversationId);

// Retrieve conversation ID
const conversationId = await AsyncStorage.getItem('currentConversation');
```

---

## Testing with cURL

### Chat Example
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "message": "What is progressive overload?",
    "conversationId": "test_conv"
  }'
```

### Workout Generation Example
```bash
curl -X POST http://localhost:3000/api/workout/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "fitnessLevel": "intermediate",
    "goals": "Build muscle and improve flexibility",
    "equipment": ["Pull-up bar", "Resistance bands"],
    "daysPerWeek": "4",
    "duration": "60",
    "limitations": "None"
  }'
```

---

## WebSocket Alternative (Optional)

For production, consider WebSockets instead of SSE:

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    
    await ollama.streamChat(
      data.messages,
      (chunk) => {
        ws.send(JSON.stringify({ type: 'chunk', data: chunk }));
      }
    );
    
    ws.send(JSON.stringify({ type: 'done' }));
  });
});
```
