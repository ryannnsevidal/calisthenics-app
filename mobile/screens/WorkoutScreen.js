// screens/WorkoutScreen.js
// Display list of saved workouts with details

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../App';

const WorkoutScreen = ({ navigation }) => {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setError(null);
      const userId = await AsyncStorage.getItem('userId');
      
      const response = await fetch(`${API_CONFIG.baseURL}/api/workouts/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Sort by most recent first
        const sortedWorkouts = data.workouts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setWorkouts(sortedWorkouts);
      } else {
        throw new Error(data.error || 'Failed to load workouts');
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
      setError(error.message);
      
      // Show user-friendly error
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        setError('Cannot connect to server. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadWorkouts();
  }, []);

  const handleWorkoutPress = (workout) => {
    navigation.navigate('WorkoutDetail', { workout });
  };

  const handleDeleteWorkout = (workoutId) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement delete API endpoint
            setWorkouts(prev => prev.filter(w => w.id !== workoutId));
          },
        },
      ]
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderWorkoutCard = ({ item }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => handleWorkoutPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.workoutCardHeader}>
        <View style={styles.workoutCardLeft}>
          <Icon name="fitness" size={24} color="#007AFF" />
          <View style={styles.workoutCardInfo}>
            <Text style={styles.workoutCardTitle} numberOfLines={1}>
              {item.params?.goals || 'Custom Workout Plan'}
            </Text>
            <Text style={styles.workoutCardDate}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteWorkout(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.workoutCardDetails}>
        <View style={styles.workoutCardDetail}>
          <Icon name="calendar-outline" size={16} color="#666" />
          <Text style={styles.workoutCardDetailText}>
            {item.params?.daysPerWeek || 3}x/week
          </Text>
        </View>
        <View style={styles.workoutCardDetail}>
          <Icon name="time-outline" size={16} color="#666" />
          <Text style={styles.workoutCardDetailText}>
            {item.params?.duration || '45'} min
          </Text>
        </View>
        <View style={styles.workoutCardDetail}>
          <Icon name="trending-up-outline" size={16} color="#666" />
          <Text style={styles.workoutCardDetailText}>
            {item.params?.fitnessLevel || 'Beginner'}
          </Text>
        </View>
      </View>

      <View style={styles.workoutCardFooter}>
        <Text style={styles.viewDetailsText}>Tap to view details →</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your workouts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadWorkouts}>
          <Icon name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="barbell-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Workouts Yet</Text>
          <Text style={styles.emptyText}>
            Generate your first personalized workout plan to get started!
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('Home', { screen: 'WorkoutGenerator' })}
          >
            <Icon name="add-circle" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create Workout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {workouts.length} Workout Plan{workouts.length !== 1 ? 's' : ''}
              </Text>
            </View>
          }
        />
      )}
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  listHeader: {
    marginBottom: 12,
  },
  listHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
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
  workoutCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workoutCardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  workoutCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutCardDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  workoutCardDetails: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
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
  workoutCardFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default WorkoutScreen;
