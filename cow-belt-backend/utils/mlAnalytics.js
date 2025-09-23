// Machine Learning Analytics for Cow Health Monitoring
class MLAnalytics {
  constructor() {
    this.models = {
      temperature: new TemperatureModel(),
      motion: new MotionModel(),
      health: new HealthModel()
    };
  }
  
  // Analyze temperature trends and predict future values
  analyzeTemperatureTrends(data) {
    try {
      const trends = this.models.temperature.analyzeTrends(data);
      return {
        currentTrend: trends.current,
        prediction: trends.prediction,
        anomaly: trends.anomaly,
        confidence: trends.confidence
      };
    } catch (error) {
      return { error: error.message };
    }
  }
  
  // Analyze motion patterns and activity levels
  analyzeMotionPatterns(data) {
    try {
      const patterns = this.models.motion.analyzePatterns(data);
      return {
        activityLevel: patterns.activity,
        behavior: patterns.behavior,
        anomalies: patterns.anomalies,
        prediction: patterns.prediction
      };
    } catch (error) {
      return { error: error.message };
    }
  }
  
  // Comprehensive health analysis
  analyzeHealth(data) {
    try {
      const health = this.models.health.comprehensiveAnalysis(data);
      return {
        overallHealth: health.overall,
        riskFactors: health.risks,
        recommendations: health.recommendations,
        prediction: health.prediction
      };
    } catch (error) {
      return { error: error.message };
    }
  }
  
  // Detect anomalies in sensor data
  detectAnomalies(data) {
    const anomalies = [];
    
    // Temperature anomalies
    if (data.temperature) {
      const tempAnomalies = this.detectTemperatureAnomalies(data.temperature);
      anomalies.push(...tempAnomalies);
    }
    
    // Motion anomalies
    if (data.motionChange) {
      const motionAnomalies = this.detectMotionAnomalies(data.motionChange);
      anomalies.push(...motionAnomalies);
    }
    
    // Combined anomalies
    const combinedAnomalies = this.detectCombinedAnomalies(data);
    anomalies.push(...combinedAnomalies);
    
    return anomalies;
  }
  
  // Detect temperature anomalies
  detectTemperatureAnomalies(temperature) {
    const anomalies = [];
    
    // Spike detection
    if (temperature > 41.0) {
      anomalies.push({
        type: 'Temperature Spike',
        severity: 'critical',
        message: 'Critical temperature spike detected',
        value: temperature
      });
    }
    
    // Sudden drop detection
    if (temperature < 35.0) {
      anomalies.push({
        type: 'Temperature Drop',
        severity: 'critical',
        message: 'Critical temperature drop detected',
        value: temperature
      });
    }
    
    // Gradual increase detection (would need historical data)
    if (temperature > 39.5) {
      anomalies.push({
        type: 'Temperature Spike',
        severity: 'medium',
        message: 'Elevated temperature detected',
        value: temperature
      });
    }
    
    return anomalies;
  }
  
  // Detect motion anomalies
  detectMotionAnomalies(motionChange) {
    const anomalies = [];
    
    // Excessive activity
    if (motionChange > 250) {
      anomalies.push({
        type: 'Motion Anomaly',
        severity: 'high',
        message: 'Excessive activity detected',
        value: motionChange
      });
    }
    
    // Lethargy detection
    if (motionChange < 3) {
      anomalies.push({
        type: 'Motion Anomaly',
        severity: 'high',
        message: 'Lethargy detected',
        value: motionChange
      });
    }
    
    // Unusual patterns
    if (motionChange > 150 && motionChange < 250) {
      anomalies.push({
        type: 'Motion Anomaly',
        severity: 'medium',
        message: 'Unusual activity pattern detected',
        value: motionChange
      });
    }
    
    return anomalies;
  }
  
  // Detect combined anomalies
  detectCombinedAnomalies(data) {
    const anomalies = [];
    
    // High temp + low motion = potential illness
    if (data.temperature > 39.0 && data.motionChange < 10) {
      anomalies.push({
        type: 'Data Inconsistency',
        severity: 'high',
        message: 'Potential illness: High temperature with low activity',
        values: { temperature: data.temperature, motion: data.motionChange }
      });
    }
    
    // Low temp + high motion = potential stress
    if (data.temperature < 37.0 && data.motionChange > 100) {
      anomalies.push({
        type: 'Data Inconsistency',
        severity: 'medium',
        message: 'Potential stress: Low temperature with high activity',
        values: { temperature: data.temperature, motion: data.motionChange }
      });
    }
    
    // Extreme values combination
    if (data.temperature > 40.0 && data.motionChange > 200) {
      anomalies.push({
        type: 'Data Inconsistency',
        severity: 'critical',
        message: 'Critical condition: Extreme temperature and activity',
        values: { temperature: data.temperature, motion: data.motionChange }
      });
    }
    
    return anomalies;
  }
  
  // Generate health insights
  generateHealthInsights(data) {
    const insights = [];
    
    // Temperature insights
    if (data.temperature >= 39.5) {
      insights.push({
        category: 'temperature',
        insight: 'Elevated body temperature indicates potential fever or heat stress',
        recommendation: 'Monitor closely and consider veterinary consultation',
        priority: 'high'
      });
    }
    
    // Motion insights
    if (data.motionChange < 10) {
      insights.push({
        category: 'activity',
        insight: 'Low activity level may indicate lethargy or illness',
        recommendation: 'Check for signs of illness or injury',
        priority: 'medium'
      });
    }
    
    // Combined insights
    if (data.temperature > 39.0 && data.motionChange < 15) {
      insights.push({
        category: 'health',
        insight: 'Combination of elevated temperature and low activity suggests potential illness',
        recommendation: 'Immediate veterinary attention recommended',
        priority: 'critical'
      });
    }
    
    return insights;
  }
}

// Temperature Model for ML analysis
class TemperatureModel {
  constructor() {
    this.normalRange = { min: 37.5, max: 39.5 };
    this.criticalThresholds = {
      hypothermia: 35.0,
      fever: 39.5,
      highFever: 40.5,
      critical: 41.5
    };
  }
  
  analyzeTrends(data) {
    // Simplified trend analysis
    const currentTrend = this.calculateCurrentTrend(data);
    const prediction = this.predictFutureTemperature(data);
    const anomaly = this.detectTemperatureAnomaly(data);
    
    return {
      current: currentTrend,
      prediction: prediction,
      anomaly: anomaly,
      confidence: 0.85
    };
  }
  
  calculateCurrentTrend(data) {
    if (data.temperature > this.criticalThresholds.critical) {
      return { direction: 'critical', severity: 'high' };
    } else if (data.temperature > this.criticalThresholds.highFever) {
      return { direction: 'rising', severity: 'high' };
    } else if (data.temperature > this.criticalThresholds.fever) {
      return { direction: 'rising', severity: 'medium' };
    } else if (data.temperature < this.criticalThresholds.hypothermia) {
      return { direction: 'falling', severity: 'high' };
    } else if (data.temperature < this.normalRange.min) {
      return { direction: 'falling', severity: 'medium' };
    }
    return { direction: 'stable', severity: 'low' };
  }
  
  predictFutureTemperature(data) {
    // Simplified prediction based on current values
    const current = data.temperature;
    let prediction = current;
    
    if (current > this.criticalThresholds.fever) {
      prediction = current + 0.5; // Likely to increase
    } else if (current < this.normalRange.min) {
      prediction = current - 0.3; // Likely to decrease
    }
    
    return {
      nextHour: prediction,
      nextDay: prediction + (Math.random() - 0.5) * 0.5,
      confidence: 0.7
    };
  }
  
  detectTemperatureAnomaly(data) {
    if (data.temperature > this.criticalThresholds.critical) {
      return { type: 'critical_fever', severity: 'critical' };
    } else if (data.temperature < this.criticalThresholds.hypothermia) {
      return { type: 'hypothermia', severity: 'critical' };
    } else if (data.temperature > this.criticalThresholds.highFever) {
      return { type: 'high_fever', severity: 'high' };
    }
    return { type: 'normal', severity: 'low' };
  }
}

// Motion Model for ML analysis
class MotionModel {
  constructor() {
    this.activityLevels = {
      lethargic: { min: 0, max: 10 },
      low: { min: 10, max: 30 },
      normal: { min: 30, max: 80 },
      high: { min: 80, max: 150 },
      excessive: { min: 150, max: 300 }
    };
  }
  
  analyzePatterns(data) {
    const activity = this.classifyActivity(data.motionChange);
    const behavior = this.analyzeBehavior(data);
    const anomalies = this.detectMotionAnomalies(data);
    const prediction = this.predictActivity(data);
    
    return {
      activity: activity,
      behavior: behavior,
      anomalies: anomalies,
      prediction: prediction
    };
  }
  
  classifyActivity(motionChange) {
    if (motionChange <= this.activityLevels.lethargic.max) {
      return { level: 'lethargic', score: motionChange / 10 };
    } else if (motionChange <= this.activityLevels.low.max) {
      return { level: 'low', score: motionChange / 30 };
    } else if (motionChange <= this.activityLevels.normal.max) {
      return { level: 'normal', score: motionChange / 80 };
    } else if (motionChange <= this.activityLevels.high.max) {
      return { level: 'high', score: motionChange / 150 };
    } else {
      return { level: 'excessive', score: motionChange / 300 };
    }
  }
  
  analyzeBehavior(data) {
    // Simplified behavior analysis
    if (data.motionChange > 150) {
      return { type: 'agitated', description: 'High activity suggesting stress or agitation' };
    } else if (data.motionChange < 10) {
      return { type: 'lethargic', description: 'Low activity suggesting illness or fatigue' };
    } else if (data.motionChange > 100) {
      return { type: 'active', description: 'High normal activity' };
    }
    return { type: 'normal', description: 'Normal activity level' };
  }
  
  detectMotionAnomalies(data) {
    const anomalies = [];
    
    if (data.motionChange > 200) {
      anomalies.push({
        type: 'Motion Anomaly',
        severity: 'high',
        message: 'Excessive activity detected'
      });
    }
    
    if (data.motionChange < 5) {
      anomalies.push({
        type: 'Motion Anomaly',
        severity: 'high',
        message: 'Severe lethargy detected'
      });
    }
    
    return anomalies;
  }
  
  predictActivity(data) {
    // Simplified activity prediction
    const current = data.motionChange;
    let prediction = current;
    
    if (current > 150) {
      prediction = current - 20; // Activity likely to decrease
    } else if (current < 20) {
      prediction = current + 10; // Activity likely to increase
    }
    
    return {
      nextHour: Math.max(0, prediction),
      nextDay: Math.max(0, prediction + (Math.random() - 0.5) * 30),
      confidence: 0.6
    };
  }
}

// Health Model for comprehensive analysis
class HealthModel {
  constructor() {
    this.healthFactors = {
      temperature: 0.4,
      motion: 0.3,
      consistency: 0.2,
      trends: 0.1
    };
  }
  
  comprehensiveAnalysis(data) {
    const overall = this.calculateOverallHealth(data);
    const risks = this.identifyRiskFactors(data);
    const recommendations = this.generateRecommendations(data);
    const prediction = this.predictHealthTrend(data);
    
    return {
      overall: overall,
      risks: risks,
      recommendations: recommendations,
      prediction: prediction
    };
  }
  
  calculateOverallHealth(data) {
    let score = 100;
    
    // Temperature scoring
    if (data.temperature > 40.5) score -= 40;
    else if (data.temperature > 39.5) score -= 25;
    else if (data.temperature < 36.0) score -= 35;
    else if (data.temperature < 37.0) score -= 20;
    
    // Motion scoring
    if (data.motionChange > 200) score -= 20;
    else if (data.motionChange < 10) score -= 30;
    else if (data.motionChange < 20) score -= 15;
    
    // Disease scoring
    if (data.disease && data.disease !== 'Normal') {
      switch (data.disease) {
        case 'Heat / High Fever': score -= 40; break;
        case 'Fever': score -= 25; break;
        case 'Low Fever / Hypothermia': score -= 30; break;
        case 'Stress / Unusual Movement': score -= 20; break;
      }
    }
    
    const finalScore = Math.max(0, score);
    
    return {
      score: finalScore,
      status: finalScore >= 80 ? 'healthy' : finalScore >= 60 ? 'moderate' : finalScore >= 40 ? 'poor' : 'critical',
      confidence: 0.85
    };
  }
  
  identifyRiskFactors(data) {
    const risks = [];
    
    if (data.temperature > 40.0) {
      risks.push({
        factor: 'High Temperature',
        severity: 'high',
        impact: 'Heat stress, dehydration, organ damage'
      });
    }
    
    if (data.motionChange < 10) {
      risks.push({
        factor: 'Low Activity',
        severity: 'medium',
        impact: 'Potential illness, weakness, depression'
      });
    }
    
    if (data.temperature > 39.0 && data.motionChange < 20) {
      risks.push({
        factor: 'Fever with Lethargy',
        severity: 'high',
        impact: 'Serious illness, infection, systemic problems'
      });
    }
    
    return risks;
  }
  
  generateRecommendations(data) {
    const recommendations = [];
    
    if (data.temperature > 40.0) {
      recommendations.push({
        priority: 'high',
        action: 'Immediate cooling measures',
        description: 'Provide shade, water, and ventilation. Contact veterinarian if temperature persists.'
      });
    }
    
    if (data.motionChange < 15) {
      recommendations.push({
        priority: 'medium',
        action: 'Monitor closely',
        description: 'Check for signs of illness, injury, or depression. Ensure adequate nutrition.'
      });
    }
    
    if (data.temperature > 39.0 && data.motionChange < 20) {
      recommendations.push({
        priority: 'critical',
        action: 'Veterinary consultation',
        description: 'Immediate veterinary attention required. Monitor vital signs continuously.'
      });
    }
    
    return recommendations;
  }
  
  predictHealthTrend(data) {
    const currentHealth = this.calculateOverallHealth(data);
    
    // Simplified trend prediction
    let trend = 'stable';
    let confidence = 0.7;
    
    if (data.temperature > 40.0 || data.motionChange < 10) {
      trend = 'declining';
      confidence = 0.8;
    } else if (data.temperature < 38.0 && data.motionChange > 50) {
      trend = 'improving';
      confidence = 0.6;
    }
    
    return {
      trend: trend,
      confidence: confidence,
      nextDay: currentHealth.score + (Math.random() - 0.5) * 10,
      nextWeek: currentHealth.score + (Math.random() - 0.5) * 20
    };
  }
}

// Create singleton instance
const mlAnalytics = new MLAnalytics();

// Export functions
module.exports = { 
  MLAnalytics,
  mlAnalytics
};
