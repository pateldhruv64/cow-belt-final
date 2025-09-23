// Advanced Disease Prediction System with ML Algorithms
class DiseasePredictor {
  constructor() {
    // Historical data patterns for training
    this.trainingData = [
      // Normal patterns
      { temp: 37.5, motion: 25, disease: 'Normal', confidence: 0.95 },
      { temp: 38.0, motion: 30, disease: 'Normal', confidence: 0.90 },
      { temp: 38.5, motion: 35, disease: 'Normal', confidence: 0.85 },
      { temp: 39.0, motion: 40, disease: 'Normal', confidence: 0.80 },
      
      // Fever patterns
      { temp: 39.5, motion: 45, disease: 'Fever', confidence: 0.75 },
      { temp: 40.0, motion: 50, disease: 'Heat / High Fever', confidence: 0.85 },
      { temp: 40.5, motion: 55, disease: 'Heat / High Fever', confidence: 0.90 },
      { temp: 41.0, motion: 60, disease: 'Heat / High Fever', confidence: 0.95 },
      
      // Hypothermia patterns
      { temp: 37.0, motion: 15, disease: 'Low Fever / Hypothermia', confidence: 0.70 },
      { temp: 36.5, motion: 10, disease: 'Low Fever / Hypothermia', confidence: 0.80 },
      { temp: 36.0, motion: 5, disease: 'Low Fever / Hypothermia', confidence: 0.90 },
      { temp: 35.5, motion: 2, disease: 'Low Fever / Hypothermia', confidence: 0.95 },
      
      // Stress patterns
      { temp: 38.0, motion: 80, disease: 'Stress / Unusual Movement', confidence: 0.75 },
      { temp: 38.5, motion: 100, disease: 'Stress / Unusual Movement', confidence: 0.85 },
      { temp: 39.0, motion: 150, disease: 'Stress / Unusual Movement', confidence: 0.90 },
      { temp: 39.5, motion: 200, disease: 'Stress / Unusual Movement', confidence: 0.95 }
    ];
  }
  
  // Main prediction function with enhanced algorithm
  predictDisease(temperature, motionChange, humidity = null, pitch = null, roll = null) {
    try {
      // Input validation
      if (typeof temperature !== 'number' || typeof motionChange !== 'number') {
        throw new Error('Invalid input parameters');
      }
      
      // Extreme value detection
      if (temperature < 30 || temperature > 45) {
        return {
          disease: 'Unknown',
          confidence: 0.0,
          reason: 'Temperature reading outside valid range',
          riskLevel: 'Critical'
        };
      }
      
      // Multi-algorithm approach
      const ruleBasedResult = this.ruleBasedPrediction(temperature, motionChange);
      const mlBasedResult = this.machineLearningPrediction(temperature, motionChange);
      const patternBasedResult = this.patternBasedPrediction(temperature, motionChange, pitch, roll);
      
      // Ensemble method - combine results
      const finalResult = this.ensemblePrediction([ruleBasedResult, mlBasedResult, patternBasedResult]);
      
      return {
        disease: finalResult.disease,
        confidence: finalResult.confidence,
        riskLevel: finalResult.riskLevel,
        timestamp: new Date().toISOString(),
        algorithm: 'Ensemble ML + Rules + Patterns'
      };
      
    } catch (error) {
      return {
        disease: 'Unknown',
        confidence: 0.0,
        reason: error.message,
        riskLevel: 'Critical'
      };
    }
  }
  
  // Rule-based prediction (enhanced)
  ruleBasedPrediction(temperature, motionChange) {
    let disease = 'Normal';
    let confidence = 0.8;
    let riskLevel = 'Low';
    
    // Temperature-based rules
    if (temperature >= 41.5) {
      disease = 'Heat / High Fever';
      confidence = 0.95;
      riskLevel = 'Critical';
    } else if (temperature >= 40.5) {
      disease = 'Heat / High Fever';
      confidence = 0.90;
      riskLevel = 'High';
    } else if (temperature >= 39.5) {
      disease = 'Fever';
      confidence = 0.80;
      riskLevel = 'Medium';
    } else if (temperature <= 35.0) {
      disease = 'Low Fever / Hypothermia';
      confidence = 0.95;
      riskLevel = 'Critical';
    } else if (temperature <= 36.5) {
      disease = 'Low Fever / Hypothermia';
      confidence = 0.85;
      riskLevel = 'High';
    }
    
    // Motion-based rules
    if (motionChange > 200) {
      if (disease === 'Normal') {
        disease = 'Stress / Unusual Movement';
        confidence = 0.85;
        riskLevel = 'Medium';
      } else {
        confidence = Math.min(confidence + 0.1, 0.95);
      }
    } else if (motionChange < 5) {
      if (disease === 'Normal') {
        disease = 'Low Fever / Hypothermia';
        confidence = 0.75;
        riskLevel = 'Medium';
      } else {
        confidence = Math.min(confidence + 0.05, 0.95);
      }
    }
    
    return { disease, confidence, riskLevel };
  }
  
  // Machine Learning based prediction
  machineLearningPrediction(temperature, motionChange) {
    // Find similar patterns in training data
    const similarities = this.trainingData.map(data => ({
      ...data,
      similarity: this.calculateSimilarity(temperature, motionChange, data)
    }));
    
    // Sort by similarity
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // Get top 3 most similar patterns
    const topMatches = similarities.slice(0, 3);
    
    // Weighted voting
    const diseaseVotes = {};
    let totalWeight = 0;
    
    topMatches.forEach(match => {
      const weight = match.similarity * match.confidence;
      diseaseVotes[match.disease] = (diseaseVotes[match.disease] || 0) + weight;
      totalWeight += weight;
    });
    
    // Find disease with highest vote
    let bestDisease = 'Normal';
    let bestScore = 0;
    
    Object.entries(diseaseVotes).forEach(([disease, score]) => {
      if (score > bestScore) {
        bestDisease = disease;
        bestScore = score;
      }
    });
    
    const confidence = totalWeight > 0 ? bestScore / totalWeight : 0.5;
    
    // Determine risk level
    let riskLevel = 'Low';
    if (confidence > 0.8) riskLevel = 'High';
    else if (confidence > 0.6) riskLevel = 'Medium';
    
    return { disease: bestDisease, confidence, riskLevel };
  }
  
  // Pattern-based prediction using sensor fusion
  patternBasedPrediction(temperature, motionChange, pitch = null, roll = null) {
    let disease = 'Normal';
    let confidence = 0.7;
    let riskLevel = 'Low';
    
    // Temperature pattern analysis
    const tempPattern = this.analyzeTemperaturePattern(temperature);
    const motionPattern = this.analyzeMotionPattern(motionChange);
    
    // Sensor fusion with orientation data
    if (pitch !== null && roll !== null) {
      const orientationPattern = this.analyzeOrientationPattern(pitch, roll);
      
      // Combine patterns
      if (tempPattern.severity === 'high' && motionPattern.severity === 'high') {
        disease = 'Heat / High Fever';
        confidence = 0.9;
        riskLevel = 'Critical';
      } else if (tempPattern.severity === 'medium' && motionPattern.severity === 'high') {
        disease = 'Stress / Unusual Movement';
        confidence = 0.85;
        riskLevel = 'High';
      } else if (tempPattern.severity === 'low' && motionPattern.severity === 'low') {
        disease = 'Low Fever / Hypothermia';
        confidence = 0.8;
        riskLevel = 'Medium';
      }
    } else {
      // Fallback to temperature and motion only
      if (tempPattern.severity === 'high') {
        disease = 'Heat / High Fever';
        confidence = 0.85;
        riskLevel = 'High';
      } else if (motionPattern.severity === 'high') {
        disease = 'Stress / Unusual Movement';
        confidence = 0.8;
        riskLevel = 'Medium';
      }
    }
    
    return { disease, confidence, riskLevel };
  }
  
  // Calculate similarity between current data and training data
  calculateSimilarity(temp, motion, trainingData) {
    const tempDiff = Math.abs(temp - trainingData.temp);
    const motionDiff = Math.abs(motion - trainingData.motion);
    
    // Normalize differences
    const normalizedTempDiff = tempDiff / 7; // 7 degree range
    const normalizedMotionDiff = motionDiff / 300; // 300 motion range
    
    // Calculate similarity (higher is more similar)
    const similarity = 1 - (normalizedTempDiff + normalizedMotionDiff) / 2;
    return Math.max(0, similarity);
  }
  
  // Analyze temperature patterns
  analyzeTemperaturePattern(temperature) {
    if (temperature >= 41.0) return { severity: 'high', pattern: 'critical_fever' };
    if (temperature >= 40.0) return { severity: 'high', pattern: 'high_fever' };
    if (temperature >= 39.0) return { severity: 'medium', pattern: 'fever' };
    if (temperature <= 36.0) return { severity: 'medium', pattern: 'hypothermia' };
    if (temperature <= 35.0) return { severity: 'high', pattern: 'severe_hypothermia' };
    return { severity: 'low', pattern: 'normal' };
  }
  
  // Analyze motion patterns
  analyzeMotionPattern(motionChange) {
    if (motionChange >= 200) return { severity: 'high', pattern: 'hyperactive' };
    if (motionChange >= 100) return { severity: 'medium', pattern: 'active' };
    if (motionChange <= 5) return { severity: 'high', pattern: 'lethargic' };
    if (motionChange <= 15) return { severity: 'medium', pattern: 'low_activity' };
    return { severity: 'low', pattern: 'normal' };
  }
  
  // Analyze orientation patterns
  analyzeOrientationPattern(pitch, roll) {
    const pitchAbs = Math.abs(pitch);
    const rollAbs = Math.abs(roll);
    
    if (pitchAbs > 45 || rollAbs > 45) {
      return { severity: 'high', pattern: 'unusual_position' };
    } else if (pitchAbs > 30 || rollAbs > 30) {
      return { severity: 'medium', pattern: 'tilted_position' };
    }
    return { severity: 'low', pattern: 'normal_position' };
  }
  
  // Ensemble prediction combining multiple algorithms
  ensemblePrediction(results) {
    const diseaseVotes = {};
    let totalConfidence = 0;
    let riskLevels = [];
    
    results.forEach(result => {
      const weight = result.confidence;
      diseaseVotes[result.disease] = (diseaseVotes[result.disease] || 0) + weight;
      totalConfidence += weight;
      riskLevels.push(result.riskLevel);
    });
    
    // Find most voted disease
    let bestDisease = 'Normal';
    let bestScore = 0;
    
    Object.entries(diseaseVotes).forEach(([disease, score]) => {
      if (score > bestScore) {
        bestDisease = disease;
        bestScore = score;
      }
    });
    
    // Calculate ensemble confidence
    const ensembleConfidence = totalConfidence > 0 ? bestScore / totalConfidence : 0.5;
    
    // Determine ensemble risk level
    const riskLevelCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    riskLevels.forEach(level => riskLevelCounts[level]++);
    
    let ensembleRiskLevel = 'Low';
    if (riskLevelCounts.Critical > 0) ensembleRiskLevel = 'Critical';
    else if (riskLevelCounts.High > 0) ensembleRiskLevel = 'High';
    else if (riskLevelCounts.Medium > 0) ensembleRiskLevel = 'Medium';
    
    return {
      disease: bestDisease,
      confidence: ensembleConfidence,
      riskLevel: ensembleRiskLevel
    };
  }
}

// Create singleton instance
const diseasePredictor = new DiseasePredictor();

// Main prediction function (backward compatibility)
function predictDisease(temperature, motionChange, humidity = null, pitch = null, roll = null) {
  const result = diseasePredictor.predictDisease(temperature, motionChange, humidity, pitch, roll);
  return result.disease; // Return just the disease name for backward compatibility
}

// Enhanced prediction function
function predictDiseaseAdvanced(temperature, motionChange, humidity = null, pitch = null, roll = null) {
  return diseasePredictor.predictDisease(temperature, motionChange, humidity, pitch, roll);
}

// Export functions
module.exports = { 
  predictDisease, 
  predictDiseaseAdvanced,
  DiseasePredictor,
  diseasePredictor
};


