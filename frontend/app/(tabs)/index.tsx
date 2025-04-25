import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import '../styles/home-styles.css';  // Import normal CSS

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [personalData, setPersonalData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
  });

  const handlePersonalDataChange = (name: string, value: string) => {
    setPersonalData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenderSelect = (gender: string) => {
    setPersonalData(prev => ({
      ...prev,
      gender,
    }));
  };

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Welcome Screen
  const WelcomeScreen = () => (
    <View className="welcome-screen">
      <View className="container">
        <View className="icon">
          <Text className="icon-text">🏃‍♂️</Text>
        </View>
        <Text className="title">Sport Match AI</Text>
        <Text className="subtitle">Discover your perfect sport match based on your body type and preferences</Text>
        <Image
          source={{
            uri: 'https://readdy.ai/api/search-image?query=3D%20illustration%20of%20diverse%20athletic%20body%20types%20in%20dynamic%20poses',
          }}
          className="image"
        />
      </View>
      <TouchableOpacity onPress={handleNextStep} className="button">
        <Text className="button-text">Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {}} className="secondary-button">
        <Text className="secondary-button-text">View Previous Results</Text>
      </TouchableOpacity>
    </View>
  );

  // Personal Information Screen
  const PersonalInfoScreen = () => (
    <ScrollView className="personal-info-screen">
      <View className="progress-bar">
        <View className="progress-bar-filled" style={{ width: '33%' }} />
      </View>
      <Text className="header">Personal Information</Text>
      <TextInput
        value={personalData.age}
        onChangeText={text => handlePersonalDataChange('age', text)}
        className="input-field"
        placeholder="Enter your age"
        keyboardType="numeric"
      />
      <View className="gender-selection">
        <TouchableOpacity
          onPress={() => handleGenderSelect('male')}
          className={`gender-button ${personalData.gender === 'male' ? 'selected' : ''}`}
        >
          <Text className="gender-text">Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleGenderSelect('female')}
          className={`gender-button ${personalData.gender === 'female' ? 'selected' : ''}`}
        >
          <Text className="gender-text">Female</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        value={personalData.height}
        onChangeText={text => handlePersonalDataChange('height', text)}
        className="input-field"
        placeholder="Enter your height"
        keyboardType="numeric"
      />
      <TextInput
        value={personalData.weight}
        onChangeText={text => handlePersonalDataChange('weight', text)}
        className="input-field"
        placeholder="Enter your weight"
        keyboardType="numeric"
      />
      <View className="button-container">
        <TouchableOpacity onPress={handlePrevStep} className="secondary-button">
          <Text className="secondary-button-text">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextStep} className="button">
          <Text className="button-text">Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Results Screen
  const ResultsScreen = () => (
    <View className="results-screen">
      <Text className="badge">Your Somatotype</Text>
      <Text className="results-header">Mesomorph</Text>
      <Text className="results-subheader">Athletic build with well-defined muscles</Text>
      <Image
        source={{
          uri: 'https://readdy.ai/api/search-image?query=3D%20illustration%20of%20mesomorph%20body%20type%2C%20athletic%20male%20figure%20with%20well-defined%20muscles',
        }}
        className="result-image"
      />
      <View className="recommendation-card">
        <Text className="recommendation-title">Recommended Sport Category</Text>
        <Text className="recommendation-description">Strength & Power Sports</Text>
      </View>
      <View className="button-container">
        <TouchableOpacity onPress={() => setCurrentStep(0)} className="button">
          <Text className="button-text">Try Another Analysis</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen />;
      case 1:
        return <PersonalInfoScreen />;
      case 2:
        return <ResultsScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <View className="container">
      {renderStep()}
    </View>
  );
};

export default App;
