// screens/WorkoutGeneratorScreen.js
// Screen for generating personalized workout plans

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../App';

const WorkoutGeneratorScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fitnessLevel: 'beginner',
    goals: '',
    equipment: [],
    daysPerWeek: '3',
    duration: '45',
    limitations: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState('');

  const fitnessLevels = ['beginner', 'intermediate', 'advanced'];
  const equipmentOptions = [
    'Pull-up bar',
    'Dip bars',
    'Resistance bands',
    'Gymnastics rings',
    'None (bodyweight only)',
  ];

  const handleEquipmentToggle = (item) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter(e => e !== item)
        : [...prev.equipment, item],
    }));
  };

  const validateForm = () => {
    if (!formData.goals.trim()) {
      Alert.alert('Missing Information', 'Please enter your fitness goals');
      return false;
    }
    if (formData.equipment.length === 0) {
      Alert.alert('Missing Information', 'Please select available equipment');
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setGeneratedPlan('');

    try {
      const userId = await AsyncStorage.getItem('userId');

      // Use streaming endpoint for real-time generation
      const response = await fetch(`${API_CONFIG.baseURL}/api/workout/generate-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...formData,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedPlan = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.chunk) {
                accumulatedPlan += data.chunk;
                setGeneratedPlan(accumulatedPlan);
              }
              
              if (data.done) {
                Alert.alert(
                  'Success!',
                  'Your personalized workout plan has been generated!',
                  [
                    {
                      text: 'View in Workouts',
                      onPress: () => navigation.navigate('Workouts'),
                    },
                    { text: 'OK' },
                  ]
                );
              }
              
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      Alert.alert(
        'Error',
        'Failed to generate workout plan. Please ensure the backend is running.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Your Workout Plan</Text>
        <Text style={styles.subtitle}>
          Let's build a personalized calisthenics program for you
        </Text>

        {/* Fitness Level */}
        <View style={styles.section}>
          <Text style={styles.label}>Fitness Level</Text>
          <View style={styles.buttonGroup}>
            {fitnessLevels.map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  formData.fitnessLevel === level && styles.optionButtonActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, fitnessLevel: level }))}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    formData.fitnessLevel === level && styles.optionButtonTextActive,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.label}>Your Goals</Text>
          <TextInput
            style={styles.textArea}
            value={formData.goals}
            onChangeText={text => setFormData(prev => ({ ...prev, goals: text }))}
            placeholder="e.g., Build muscle, learn handstand, improve pull-ups"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <Text style={styles.label}>Available Equipment</Text>
          {equipmentOptions.map(item => (
            <TouchableOpacity
              key={item}
              style={styles.checkboxContainer}
              onPress={() => handleEquipmentToggle(item)}
            >
              <View
                style={[
                  styles.checkbox,
                  formData.equipment.includes(item) && styles.checkboxChecked,
                ]}
              >
                {formData.equipment.includes(item) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Training Frequency */}
        <View style={styles.section}>
          <Text style={styles.label}>Days per Week</Text>
          <View style={styles.buttonGroup}>
            {['2', '3', '4', '5', '6'].map(days => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.smallOptionButton,
                  formData.daysPerWeek === days && styles.optionButtonActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, daysPerWeek: days }))}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    formData.daysPerWeek === days && styles.optionButtonTextActive,
                  ]}
                >
                  {days}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Session Duration */}
        <View style={styles.section}>
          <Text style={styles.label}>Session Duration (minutes)</Text>
          <View style={styles.buttonGroup}>
            {['30', '45', '60', '90'].map(mins => (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.smallOptionButton,
                  formData.duration === mins && styles.optionButtonActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, duration: mins }))}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    formData.duration === mins && styles.optionButtonTextActive,
                  ]}
                >
                  {mins}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Limitations */}
        <View style={styles.section}>
          <Text style={styles.label}>Injuries or Limitations (Optional)</Text>
          <TextInput
            style={styles.textArea}
            value={formData.limitations}
            onChangeText={text => setFormData(prev => ({ ...prev, limitations: text }))}
            placeholder="e.g., Shoulder injury, wrist pain"
            placeholderTextColor="#999"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generate My Plan 🎯</Text>
          )}
        </TouchableOpacity>

        {/* Generated Plan Preview */}
        {generatedPlan && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Your Workout Plan</Text>
            <ScrollView style={styles.previewContainer} nestedScrollEnabled>
              <Text style={styles.previewText}>{generatedPlan}</Text>
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  smallOptionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewSection: {
    marginTop: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: 400,
  },
  previewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default WorkoutGeneratorScreen;
