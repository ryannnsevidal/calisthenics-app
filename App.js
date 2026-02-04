// App.js
// Main React Native application

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  View,
  Text,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens (we'll create these)
import HomeScreen from './screens/HomeScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import WorkoutGeneratorScreen from './screens/WorkoutGeneratorScreen';
import ExerciseDetailScreen from './screens/ExerciseDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// API Configuration
export const API_CONFIG = {
  baseURL: __DEV__ ? 'http://localhost:3000' : 'https://your-api-url.com',
};

// Home Stack Navigator
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'Atlas Coach' }}
      />
      <Stack.Screen
        name="WorkoutGenerator"
        component={WorkoutGeneratorScreen}
        options={{ title: 'Generate Workout' }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: 'Exercise Guide' }}
      />
    </Stack.Navigator>
  );
}

// Workout Stack Navigator
function WorkoutStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="WorkoutMain"
        component={WorkoutScreen}
        options={{ title: 'My Workouts' }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: 'Exercise Guide' }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Workouts') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Workouts" component={WorkoutStack} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check for existing user ID or create new one
      let storedUserId = await AsyncStorage.getItem('userId');
      
      if (!storedUserId) {
        storedUserId = `user_${Date.now()}`;
        await AsyncStorage.setItem('userId', storedUserId);
      }
      
      setUserId(storedUserId);
      
      // Check API health
      const response = await fetch(`${API_CONFIG.baseURL}/health`);
      const health = await response.json();
      
      if (health.ollama !== 'connected') {
        Alert.alert(
          'Backend Notice',
          'AI backend is not fully connected. Some features may be limited.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert(
        'Connection Error',
        'Could not connect to backend. Please ensure the server is running.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Atlas Coach...</Text>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <MainTabs />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});
