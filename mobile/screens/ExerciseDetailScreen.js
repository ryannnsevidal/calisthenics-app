// screens/ExerciseDetailScreen.js
// Display detailed exercise form guidance

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_CONFIG } from '../App';

const ExerciseDetailScreen = ({ route, navigation }) => {
  const { exercise } = route.params;
  const [guidance, setGuidance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExerciseGuidance();
  }, []);

  const loadExerciseGuidance = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.baseURL}/api/exercise/form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseName: exercise,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setGuidance(data.guidance);
      } else {
        throw new Error(data.error || 'Failed to load exercise guidance');
      }
    } catch (error) {
      console.error('Error loading exercise guidance:', error);
      setError(error.message);

      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        setError('Cannot connect to server. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading exercise guide...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorTitle}>Failed to Load</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadExerciseGuidance}>
          <Icon name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Icon name="fitness" size={32} color="#007AFF" />
        </View>
        <Text style={styles.headerTitle}>{exercise}</Text>
        <Text style={styles.headerSubtitle}>Form & Technique Guide</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer}>
        <View style={styles.guidanceCard}>
          <Text style={styles.guidanceText}>{guidance}</Text>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsSectionTitle}>Quick Tips 💡</Text>
          <View style={styles.tipCard}>
            <Icon name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.tipText}>
              Focus on controlled movements - quality over quantity
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Icon name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.tipText}>
              Breathe consistently - exhale on exertion, inhale on the easier phase
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Icon name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.tipText}>
              If form breaks down, take a break or use an easier progression
            </Text>
          </View>
        </View>

        {/* Safety Warning */}
        <View style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <Icon name="warning" size={20} color="#FF9500" />
            <Text style={styles.safetyTitle}>Safety First</Text>
          </View>
          <Text style={styles.safetyText}>
            Stop immediately if you feel sharp pain. Some muscle fatigue is normal, but
            joint pain or sharp sensations are warning signs. When in doubt, consult a
            healthcare professional.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Chat')}
          >
            <Icon name="chatbubbles" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Ask Atlas</Text>
          </TouchableOpacity>
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
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#F0F8FF',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  contentContainer: {
    flex: 1,
  },
  guidanceCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  guidanceText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  tipsSection: {
    padding: 16,
    paddingTop: 8,
  },
  tipsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  safetyCard: {
    backgroundColor: '#FFF9E6',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  safetyText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  actionSection: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default ExerciseDetailScreen;
