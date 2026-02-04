// screens/HomeScreen.js
// Home screen with workout overview and quick actions

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../App';

const HomeScreen = ({ navigation }) => {
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const profile = await AsyncStorage.getItem('userProfile');
      
      if (profile) {
        setUserProfile(JSON.parse(profile));
      }

      // Load recent workouts
      const response = await fetch(`${API_CONFIG.baseURL}/api/workouts/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setRecentWorkouts(data.workouts.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWorkout = () => {
    navigation.navigate('WorkoutGenerator');
  };

  const handleQuickExercise = (exerciseName) => {
    navigation.navigate('ExerciseDetail', { exercise: exerciseName });
  };

  const quickExercises = [
    { name: 'Push-ups', icon: 'fitness' },
    { name: 'Pull-ups', icon: 'barbell' },
    { name: 'Squats', icon: 'body' },
    { name: 'Plank', icon: 'time' },
  ];

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Welcome back{userProfile?.name ? `, ${userProfile.name}` : ''}! 💪
        </Text>
        <Text style={styles.subtitleText}>
          Ready to get stronger today?
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGenerateWorkout}
        >
          <Icon name="add-circle" size={24} color="#fff" />
          <Text style={styles.primaryButtonText}>Generate New Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Chat')}
        >
          <Icon name="chatbubbles" size={24} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Ask Atlas a Question</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Exercise Guide */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercise Guides</Text>
        <View style={styles.exerciseGrid}>
          {quickExercises.map((exercise, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exerciseCard}
              onPress={() => handleQuickExercise(exercise.name)}
            >
              <Icon name={exercise.icon} size={32} color="#007AFF" />
              <Text style={styles.exerciseCardText}>{exercise.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Workouts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Workouts')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentWorkouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="barbell-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>
              No workouts yet. Generate your first one!
            </Text>
          </View>
        ) : (
          recentWorkouts.map((workout, index) => (
            <WorkoutCard key={index} workout={workout} />
          ))
        )}
      </View>

      {/* Tips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Tip 💡</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            Focus on progressive overload: gradually increase reps, sets, or difficulty
            to continue making gains. Small improvements add up over time!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Workout Card Component
const WorkoutCard = ({ workout }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.workoutCard}>
      <View style={styles.workoutCardHeader}>
        <Text style={styles.workoutCardTitle}>
          {workout.params?.goals || 'Custom Workout'}
        </Text>
        <Text style={styles.workoutCardDate}>
          {formatDate(workout.createdAt)}
        </Text>
      </View>
      <View style={styles.workoutCardDetails}>
        <View style={styles.workoutCardDetail}>
          <Icon name="calendar" size={16} color="#666" />
          <Text style={styles.workoutCardDetailText}>
            {workout.params?.daysPerWeek || 3}x/week
          </Text>
        </View>
        <View style={styles.workoutCardDetail}>
          <Icon name="time" size={16} color="#666" />
          <Text style={styles.workoutCardDetailText}>
            {workout.params?.duration || '45'} min
          </Text>
        </View>
        <View style={styles.workoutCardDetail}>
          <Icon name="trending-up" size={16} color="#666" />
          <Text style={styles.workoutCardDetailText}>
            {workout.params?.fitnessLevel || 'Beginner'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    backgroundColor: '#007AFF',
    padding: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseCardText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  workoutCardDate: {
    fontSize: 12,
    color: '#999',
  },
  workoutCardDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  workoutCardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutCardDetailText: {
    fontSize: 12,
    color: '#666',
  },
  tipCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default HomeScreen;
