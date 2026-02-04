// ollama-service.js
// Service for interacting with Ollama LLM

const axios = require('axios');

class OllamaService {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'http://localhost:11434';
    this.model = config.model || 'llama3.1:8b';
    this.defaultOptions = {
      temperature: config.temperature || 0.7,
      top_p: config.top_p || 0.9,
      top_k: config.top_k || 40,
    };
  }

  /**
   * Generate a completion from Ollama
   * @param {string} prompt - The user's prompt
   * @param {string} systemPrompt - System instructions for the model
   * @param {object} options - Additional options
   * @returns {Promise<string>} - The generated response
   */
  async generate(prompt, systemPrompt = '', options = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: this.buildFullPrompt(systemPrompt, prompt),
        stream: false,
        options: {
          ...this.defaultOptions,
          ...options,
        },
      });

      return response.data.response;
    } catch (error) {
      console.error('Ollama generation error:', error.message);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Stream a response from Ollama
   * @param {string} prompt - The user's prompt
   * @param {string} systemPrompt - System instructions
   * @param {function} onChunk - Callback for each chunk
   * @param {object} options - Additional options
   */
  async streamGenerate(prompt, systemPrompt = '', onChunk, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        {
          model: this.model,
          prompt: this.buildFullPrompt(systemPrompt, prompt),
          stream: true,
          options: {
            ...this.defaultOptions,
            ...options,
          },
        },
        {
          responseType: 'stream',
        }
      );

      return new Promise((resolve, reject) => {
        let fullResponse = '';

        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.response) {
                fullResponse += json.response;
                onChunk(json.response);
              }
              if (json.done) {
                resolve(fullResponse);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        });

        response.data.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Ollama streaming error:', error.message);
      throw new Error(`Failed to stream response: ${error.message}`);
    }
  }

  /**
   * Chat-style completion with conversation history
   * @param {Array} messages - Array of {role, content} messages
   * @param {object} options - Additional options
   * @returns {Promise<string>} - The generated response
   */
  async chat(messages, options = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/api/chat`, {
        model: this.model,
        messages: messages,
        stream: false,
        options: {
          ...this.defaultOptions,
          ...options,
        },
      });

      return response.data.message.content;
    } catch (error) {
      console.error('Ollama chat error:', error.message);
      throw new Error(`Failed to generate chat response: ${error.message}`);
    }
  }

  /**
   * Stream chat-style completion
   * @param {Array} messages - Array of {role, content} messages
   * @param {function} onChunk - Callback for each chunk
   * @param {object} options - Additional options
   */
  async streamChat(messages, onChunk, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/chat`,
        {
          model: this.model,
          messages: messages,
          stream: true,
          options: {
            ...this.defaultOptions,
            ...options,
          },
        },
        {
          responseType: 'stream',
        }
      );

      return new Promise((resolve, reject) => {
        let fullResponse = '';

        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.message && json.message.content) {
                fullResponse += json.message.content;
                onChunk(json.message.content);
              }
              if (json.done) {
                resolve(fullResponse);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        });

        response.data.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Ollama streaming chat error:', error.message);
      throw new Error(`Failed to stream chat response: ${error.message}`);
    }
  }

  /**
   * Check if Ollama is running and model is available
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      const models = response.data.models || [];
      const modelExists = models.some(m => m.name === this.model);
      
      if (!modelExists) {
        console.warn(`Model ${this.model} not found. Available models:`, models.map(m => m.name));
      }
      
      return modelExists;
    } catch (error) {
      console.error('Ollama health check failed:', error.message);
      return false;
    }
  }

  /**
   * Pull a model from Ollama library
   * @param {string} modelName - Name of model to pull
   * @returns {Promise<boolean>}
   */
  async pullModel(modelName = this.model) {
    try {
      console.log(`Pulling model: ${modelName}...`);
      await axios.post(`${this.baseURL}/api/pull`, {
        name: modelName,
      });
      console.log(`Model ${modelName} pulled successfully`);
      return true;
    } catch (error) {
      console.error('Failed to pull model:', error.message);
      return false;
    }
  }

  /**
   * Build full prompt with system instructions
   * @private
   */
  buildFullPrompt(systemPrompt, userPrompt) {
    if (!systemPrompt) return userPrompt;
    return `${systemPrompt}\n\n${userPrompt}`;
  }

  /**
   * Extract structured data from response
   * @param {string} response - LLM response
   * @param {string} format - Expected format (json, markdown, etc.)
   */
  parseResponse(response, format = 'text') {
    switch (format) {
      case 'json':
        try {
          // Extract JSON from markdown code blocks if present
          const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
          }
          return JSON.parse(response);
        } catch (e) {
          console.error('Failed to parse JSON response:', e);
          return null;
        }
      
      case 'markdown':
        return response.trim();
      
      default:
        return response.trim();
    }
  }
}

module.exports = OllamaService;
