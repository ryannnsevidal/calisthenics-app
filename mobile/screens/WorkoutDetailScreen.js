// screens/WorkoutDetailScreen.js
// Display full workout plan details

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const WorkoutDetailScreen = ({ route, navigation }) => {
  const { workout } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my workout plan:\n\n${workout.plan}`,
        title: 'My Workout Plan',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Save to favorites in AsyncStorage or backend
    Alert.alert(
      isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      isFavorite
        ? 'This workout has been removed from your favorites'
        : 'This workout has been added to your favorites'
    );
  };

  const handleStartWorkout = () => {
    // TODO: Navigate to active workout tracker
    Alert.alert(
      'Start Workout',
      'Active workout tracking coming soon! For now, follow the workout plan below.',
      [{ text: 'OK' }]
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {workout.params?.goals || 'Custom Workout Plan'}
            </Text>
            <Text style={styles.headerDate}>
              Created {formatDate(workout.createdAt)}
            </Text>
          </View>
          <TouchableOpacity onPress={handleFavorite}>
            <Icon
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite ? '#FF3B30' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Icon name="calendar" size={20} color="#007AFF" />
            <Text style={styles.statLabel}>Frequency</Text>
            <Text style={styles.statValue}>
              {workout.params?.daysPerWeek || 3}x/week
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="time" size={20} color="#007AFF" />
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>
              {workout.params?.duration || '45'} min
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="trending-up" size={20} color="#007AFF" />
            <Text style={styles.statLabel}>Level</Text>
            <Text style={styles.statValue}>
              {workout.params?.fitnessLevel || 'Beginner'}
            </Text>
          </View>
        </View>

        {workout.params?.equipment && workout.params.equipment.length > 0 && (
          <View style={styles.equipmentSection}>
            <Icon name="barbell" size={16} color="#666" />
            <Text style={styles.equipmentText}>
              Equipment: {workout.params.equipment.join(', ')}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStartWorkout}
        >
          <Icon name="play" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Start Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
          <Icon name="share-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Workout Plan */}
      <ScrollView style={styles.planContainer}>
        <Text style={styles.planTitle}>Workout Plan</Text>
        <View style={styles.planContent}>
          <Text style={styles.planText}>{workout.plan}</Text>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <Icon name="bulb" size={20} color="#FFB800" />
            <Text style={styles.tipText}>
              Remember to warm up properly and focus on form over reps!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 12,
    color: '#999',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  equipmentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    gap: 8,
  },
  equipmentText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  planContainer: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  planContent: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  planText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  tipsSection: {
    padding: 16,
    paddingBottom: 32,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
});

export default WorkoutDetailScreen;
