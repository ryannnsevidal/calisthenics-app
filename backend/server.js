// server.js
// Express backend server for calisthenics app

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OllamaService = require('./ollama-service');
const {
  CALISTHENICS_SYSTEM_PROMPT,
  WORKOUT_GENERATOR_PROMPT,
  FORM_COACHING_PROMPT,
  PROGRESS_ANALYSIS_PROMPT,
  GENERAL_COACHING_PROMPT,
} = require('./prompts');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Ollama service
const ollama = new OllamaService({
  baseURL: process.env.OLLAMA_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
  temperature: 0.7,
});

// In-memory storage (replace with database in production)
const users = new Map();
const conversations = new Map();
const workouts = new Map();

// Health check
app.get('/health', async (req, res) => {
  const ollamaHealthy = await ollama.healthCheck();
  res.json({
    status: 'ok',
    ollama: ollamaHealthy ? 'connected' : 'disconnected',
    model: ollama.model,
  });
});

// Generate workout plan
app.post('/api/workout/generate', async (req, res) => {
  try {
    const {
      userId,
      fitnessLevel,
      goals,
      equipment,
      daysPerWeek,
      duration,
      limitations,
    } = req.body;

    // Build prompt with user data
    const prompt = WORKOUT_GENERATOR_PROMPT
      .replace('{fitness_level}', fitnessLevel)
      .replace('{goals}', goals)
      .replace('{equipment}', equipment.join(', '))
      .replace('{days_per_week}', daysPerWeek)
      .replace('{duration}', duration)
      .replace('{limitations}', limitations || 'None');

    // Generate workout plan
    const workoutPlan = await ollama.generate(
      prompt,
      CALISTHENICS_SYSTEM_PROMPT,
      { temperature: 0.8 }
    );

    // Store workout plan
    const workoutId = Date.now().toString();
    workouts.set(workoutId, {
      id: workoutId,
      userId,
      plan: workoutPlan,
      createdAt: new Date(),
      params: { fitnessLevel, goals, equipment, daysPerWeek, duration },
    });

    res.json({
      success: true,
      workoutId,
      plan: workoutPlan,
    });
  } catch (error) {
    console.error('Workout generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Stream workout plan generation
app.post('/api/workout/generate-stream', async (req, res) => {
  try {
    const {
      userId,
      fitnessLevel,
      goals,
      equipment,
      daysPerWeek,
      duration,
      limitations,
    } = req.body;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const prompt = WORKOUT_GENERATOR_PROMPT
      .replace('{fitness_level}', fitnessLevel)
      .replace('{goals}', goals)
      .replace('{equipment}', equipment.join(', '))
      .replace('{days_per_week}', daysPerWeek)
      .replace('{duration}', duration)
      .replace('{limitations}', limitations || 'None');

    let fullResponse = '';

    await ollama.streamGenerate(
      prompt,
      CALISTHENICS_SYSTEM_PROMPT,
      (chunk) => {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      },
      { temperature: 0.8 }
    );

    // Store completed workout
    const workoutId = Date.now().toString();
    workouts.set(workoutId, {
      id: workoutId,
      userId,
      plan: fullResponse,
      createdAt: new Date(),
      params: { fitnessLevel, goals, equipment, daysPerWeek, duration },
    });

    res.write(`data: ${JSON.stringify({ done: true, workoutId })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Get exercise form coaching
app.post('/api/exercise/form', async (req, res) => {
  try {
    const { exerciseName } = req.body;

    const prompt = FORM_COACHING_PROMPT.replace('{exercise_name}', exerciseName);

    const formGuidance = await ollama.generate(
      prompt,
      CALISTHENICS_SYSTEM_PROMPT,
      { temperature: 0.6 }
    );

    res.json({
      success: true,
      exercise: exerciseName,
      guidance: formGuidance,
    });
  } catch (error) {
    console.error('Form coaching error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Chat endpoint (streaming)
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { userId, message, conversationId } = req.body;

    // Get or create conversation
    let conversation = conversations.get(conversationId) || {
      id: conversationId,
      userId,
      messages: [],
      createdAt: new Date(),
    };

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Build messages for chat API
    const messages = [
      { role: 'system', content: CALISTHENICS_SYSTEM_PROMPT },
      ...conversation.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    ];

    let assistantResponse = '';

    await ollama.streamChat(
      messages,
      (chunk) => {
        assistantResponse += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      },
      { temperature: 0.7 }
    );

    // Save assistant response
    conversation.messages.push({
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date(),
    });

    conversations.set(conversationId, conversation);

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Chat endpoint (non-streaming)
app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message, conversationId } = req.body;

    let conversation = conversations.get(conversationId) || {
      id: conversationId,
      userId,
      messages: [],
      createdAt: new Date(),
    };

    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    const messages = [
      { role: 'system', content: CALISTHENICS_SYSTEM_PROMPT },
      ...conversation.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await ollama.chat(messages, { temperature: 0.7 });

    conversation.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    });

    conversations.set(conversationId, conversation);

    res.json({
      success: true,
      response,
      conversationId,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get conversation history
app.get('/api/chat/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const conversation = conversations.get(conversationId);

  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found',
    });
  }

  res.json({
    success: true,
    conversation,
  });
});

// Analyze progress
app.post('/api/progress/analyze', async (req, res) => {
  try {
    const { userId, workoutHistory, currentStats } = req.body;

    const prompt = PROGRESS_ANALYSIS_PROMPT
      .replace('{workout_history}', JSON.stringify(workoutHistory, null, 2))
      .replace('{current_stats}', JSON.stringify(currentStats, null, 2));

    const analysis = await ollama.generate(
      prompt,
      CALISTHENICS_SYSTEM_PROMPT,
      { temperature: 0.6 }
    );

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Progress analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get user's workouts
app.get('/api/workouts/:userId', (req, res) => {
  const { userId } = req.params;
  const userWorkouts = Array.from(workouts.values()).filter(
    w => w.userId === userId
  );

  res.json({
    success: true,
    workouts: userWorkouts,
  });
});

// Get specific workout
app.get('/api/workout/:workoutId', (req, res) => {
  const { workoutId } = req.params;
  const workout = workouts.get(workoutId);

  if (!workout) {
    return res.status(404).json({
      success: false,
      error: 'Workout not found',
    });
  }

  res.json({
    success: true,
    workout,
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Ollama URL: ${ollama.baseURL}`);
  console.log(`🤖 Model: ${ollama.model}`);
  
  const healthy = await ollama.healthCheck();
  if (healthy) {
    console.log('✅ Ollama connected successfully');
  } else {
    console.log('⚠️  Ollama not available - please start Ollama and ensure model is pulled');
  }
});

module.exports = app;
