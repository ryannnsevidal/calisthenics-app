// config/api.js
// API Configuration with automatic local IP detection

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API Configuration
 * 
 * For Development:
 * - iOS Simulator: Use 'localhost' or '127.0.0.1'
 * - Android Emulator: Use '10.0.2.2' (special IP for host machine)
 * - Physical Device: Use your computer's local IP (e.g., '192.168.1.100')
 * 
 * To find your local IP:
 * - Mac/Linux: Run 'ifconfig | grep inet'
 * - Windows: Run 'ipconfig'
 * - Look for something like 192.168.1.x or 10.0.0.x
 * 
 * Alternative: Use ngrok to expose your backend
 * - Run: ngrok http 3000
 * - Copy the https URL and use it below
 */

// CONFIGURE THIS BASED ON YOUR SETUP
const API_CONFIGS = {
  // For iOS Simulator (change to your IP for physical device)
  ios: {
    baseURL: 'http://localhost:3000',
  },
  // For Android Emulator (10.0.2.2 points to host machine)
  // For physical Android device, change to your local IP
  android: {
    baseURL: 'http://10.0.2.2:3000',
  },
  // Production (when deployed)
  production: {
    baseURL: 'https://your-api-url.com',
  },
};

// Select config based on platform
const getApiConfig = () => {
  if (__DEV__) {
    return Platform.select({
      ios: API_CONFIGS.ios,
      android: API_CONFIGS.android,
      default: API_CONFIGS.ios,
    });
  }
  return API_CONFIGS.production;
};

export const API_CONFIG = getApiConfig();

// API Helper Functions with error handling
class ApiClient {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.timeout = 30000; // 30 seconds
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }

      if (error.message.includes('Network request failed')) {
        throw new Error(
          'Cannot connect to server. Please ensure:\n' +
          '1. Backend server is running\n' +
          '2. API URL is correct\n' +
          '3. You are on the same network'
        );
      }

      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async healthCheck() {
    try {
      const response = await this.get('/health');
      return response.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export const apiClient = new ApiClient(API_CONFIG);

// Cache for storing API URL override
const API_URL_KEY = '@api_url_override';

export const saveApiUrl = async (url) => {
  try {
    await AsyncStorage.setItem(API_URL_KEY, url);
    // Reload the app or update the config
    API_CONFIG.baseURL = url;
    apiClient.baseURL = url;
  } catch (error) {
    console.error('Failed to save API URL:', error);
  }
};

export const loadApiUrl = async () => {
  try {
    const url = await AsyncStorage.getItem(API_URL_KEY);
    if (url) {
      API_CONFIG.baseURL = url;
      apiClient.baseURL = url;
    }
  } catch (error) {
    console.error('Failed to load API URL:', error);
  }
};

// Test connection helper
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        status: data.status,
        ollama: data.ollama,
        message: 'Connected successfully!',
      };
    } else {
      return {
        success: false,
        message: `Server returned ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
