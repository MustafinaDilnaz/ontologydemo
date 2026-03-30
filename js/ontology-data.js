
const ontologyData = {
  learners: {
    "alice": {
      id: "alice",
      name: "Alice Chen",
      age: 24,
      educationLevel: "Bachelor",
      
      // Competency status
      masteredCompetencies: ["python_basics", "statistics_fundamentals"],
      competencyStatus: {
        masteredCompetencies: ["python_basics", "statistics_fundamentals"],
        inProgressCompetencies: ["data_cleaning"],
        strugglingWith: []
      },
      
      // Goals
      goal: "Become a Machine Learning Engineer",
      goals: {
        primaryGoal: "Machine Learning Engineer",
        targetCompetencies: ["machine_learning_basics"],
        careerObjectives: ["Data Scientist", "ML Engineer"],
        timelineGoal: "6 months"
      },
      targetCompetency: "machine_learning_basics",
      
      // Learning preferences
      learningPreferences: {
        primaryLearningStyle: "Visual",
        secondaryLearningStyle: "Kinesthetic",
        preferredPace: "Fast",
        interactivityPreference: "High"
      },
      
      // Cognitive profile
      cognitiveProfile: {
        processingSpeed: "Fast",
        attentionSpan: 45,
        metacognitiveSkill: "Medium"
      },
      
      // Affective profile
      affectiveProfile: {
        motivationLevel: 0.85,
        selfEfficacy: 0.75,
        persistenceLevel: "High"
      },
      
      // Performance metrics
      performanceMetrics: {
        overallScore: 0.75,
        learningVelocity: "Medium",
        retentionRate: 0.85,
        commonStruggingPoints: ["Complex algorithms", "Abstract math"],
        supportNeeded: ["Code examples", "Step-by-step guidance"]
      },
      
      // Constraints
      constraints: {
        timeAvailabilityPerWeek: 15,
        budgetLimit: 500,
        accessibilityNeeds: ["Closed captions"]
      }
    },
    
    "bob": {
      id: "bob",
      name: "Bob Martinez",
      age: 32,
      educationLevel: "Master",
      
      masteredCompetencies: ["statistics_fundamentals"],
      competencyStatus: {
        masteredCompetencies: ["statistics_fundamentals"],
        inProgressCompetencies: [],
        strugglingWith: []
      },
      
      goal: "Become a Data Analyst",
      goals: {
        primaryGoal: "Data Analyst",
        targetCompetencies: ["data_analysis"],
        careerObjectives: ["Data Analyst", "Business Intelligence Analyst"],
        timelineGoal: "9 months"
      },
      targetCompetency: "data_analysis",
      
      learningPreferences: {
        primaryLearningStyle: "Reading/Writing",
        secondaryLearningStyle: "Visual",
        preferredPace: "Moderate",
        interactivityPreference: "Medium"
      },
      
      cognitiveProfile: {
        processingSpeed: "Average",
        attentionSpan: 60,
        metacognitiveSkill: "High"
      },
      
      affectiveProfile: {
        motivationLevel: 0.70,
        selfEfficacy: 0.65,
        persistenceLevel: "High"
      },
      
      performanceMetrics: {
        overallScore: 0.82,
        learningVelocity: "Slow-but-thorough",
        retentionRate: 0.92,
        commonStruggingPoints: ["Programming syntax", "Debugging"],
        supportNeeded: ["Conceptual explanations", "Practice problems"]
      },
      
      constraints: {
        timeAvailabilityPerWeek: 10,
        budgetLimit: 300,
        accessibilityNeeds: []
      }
    },
    
    "carol": {
      id: "carol",
      name: "Carol Williams",
      age: 28,
      educationLevel: "Bachelor",
      
      masteredCompetencies: ["python_basics", "statistics_fundamentals", "data_cleaning", "machine_learning_basics"],
      competencyStatus: {
        masteredCompetencies: ["python_basics", "statistics_fundamentals", "data_cleaning", "machine_learning_basics"],
        inProgressCompetencies: ["deep_learning"],
        strugglingWith: []
      },
      
      goal: "Master Deep Learning",
      goals: {
        primaryGoal: "Deep Learning Engineer",
        targetCompetencies: ["deep_learning"],
        careerObjectives: ["ML Engineer", "AI Researcher"],
        timelineGoal: "4 months"
      },
      targetCompetency: "deep_learning",
      
      learningPreferences: {
        primaryLearningStyle: "Kinesthetic",
        secondaryLearningStyle: "Visual",
        preferredPace: "Fast",
        interactivityPreference: "High"
      },
      
      cognitiveProfile: {
        processingSpeed: "Fast",
        attentionSpan: 90,
        metacognitiveSkill: "High"
      },
      
      affectiveProfile: {
        motivationLevel: 0.95,
        selfEfficacy: 0.90,
        persistenceLevel: "Very High"
      },
      
      performanceMetrics: {
        overallScore: 0.90,
        learningVelocity: "Fast",
        retentionRate: 0.88,
        commonStruggingPoints: [],
        supportNeeded: []
      },
      
      constraints: {
        timeAvailabilityPerWeek: 20,
        budgetLimit: 1000,
        accessibilityNeeds: []
      }
    },
    
    "david": {
      id: "david",
      name: "David Kumar",
      age: 35,
      educationLevel: "Bachelor",
      
      masteredCompetencies: [],
      competencyStatus: {
        masteredCompetencies: [],
        inProgressCompetencies: ["python_basics"],
        strugglingWith: []
      },
      
      goal: "Transition to Data Analysis",
      goals: {
        primaryGoal: "Data Analyst",
        targetCompetencies: ["data_analysis"],
        careerObjectives: ["Data Analyst"],
        timelineGoal: "12 months"
      },
      targetCompetency: "data_analysis",
      
      learningPreferences: {
        primaryLearningStyle: "Visual",
        secondaryLearningStyle: "Reading/Writing",
        preferredPace: "Slow",
        interactivityPreference: "Medium"
      },
      
      cognitiveProfile: {
        processingSpeed: "Slow",
        attentionSpan: 30,
        metacognitiveSkill: "Low"
      },
      
      affectiveProfile: {
        motivationLevel: 0.60,
        selfEfficacy: 0.45,
        persistenceLevel: "Medium"
      },
      
      performanceMetrics: {
        overallScore: 0.50,
        learningVelocity: "Slow-but-thorough",
        retentionRate: 0.75,
        commonStruggingPoints: ["Programming concepts", "Technical terminology"],
        supportNeeded: ["Extensive examples", "Mentorship", "Step-by-step tutorials"]
      },
      
      constraints: {
        timeAvailabilityPerWeek: 12,
        budgetLimit: 200,
        accessibilityNeeds: ["High contrast"]
      }
    }
  },
  
  // ============================================================================
  // COMPETENCIES
  // ============================================================================
  competencies: {
    "python_basics": {
      id: "python_basics",
      name: "Python Programming Fundamentals",
      shortName: "Python Basics",
      description: "Master fundamental Python programming including variables, data types, control structures, functions, and basic data structures.",
      
      prerequisites: [],
      
      taxonomies: {
        bloomLevel: "Apply",
        eqfLevel: 4,
        knowledgeDimension: "Procedural"
      },
      
      bloomLevel: "Apply",
      eqfLevel: 4,
      difficultyLevel: "Beginner",
      
      estimatedHours: 50,
      
      learningOutcomes: [
        {
          outcome: "Write syntactically correct Python programs",
          bloomLevel: "Apply"
        },
        {
          outcome: "Implement control structures to solve problems",
          bloomLevel: "Apply"
        }
      ],
      
      industryContext: {
        jobRoles: ["Python Developer", "Data Analyst", "Software Engineer"],
        marketDemand: "Very High"
      }
    },
    
    "statistics_fundamentals": {
      id: "statistics_fundamentals",
      name: "Statistics Fundamentals",
      shortName: "Statistics",
      description: "Understand fundamental statistical concepts including descriptive statistics, probability theory, distributions, and hypothesis testing.",
      
      prerequisites: [],
      
      taxonomies: {
        bloomLevel: "Understand",
        eqfLevel: 4,
        knowledgeDimension: "Conceptual"
      },
      
      bloomLevel: "Understand",
      eqfLevel: 4,
      difficultyLevel: "Intermediate",
      
      estimatedHours: 60,
      
      learningOutcomes: [
        {
          outcome: "Calculate and interpret descriptive statistics",
          bloomLevel: "Understand"
        },
        {
          outcome: "Conduct hypothesis tests correctly",
          bloomLevel: "Analyze"
        }
      ],
      
      industryContext: {
        jobRoles: ["Data Analyst", "Statistician", "Data Scientist"],
        marketDemand: "High"
      }
    },
    
    "data_cleaning": {
      id: "data_cleaning",
      name: "Data Cleaning and Preprocessing",
      shortName: "Data Cleaning",
      description: "Learn to clean, transform, and prepare data for analysis using pandas and other tools.",
      
      prerequisites: ["python_basics"],
      
      taxonomies: {
        bloomLevel: "Apply",
        eqfLevel: 5,
        knowledgeDimension: "Procedural"
      },
      
      bloomLevel: "Apply",
      eqfLevel: 5,
      difficultyLevel: "Intermediate",
      
      estimatedHours: 40,
      
      learningOutcomes: [
        {
          outcome: "Handle missing data appropriately",
          bloomLevel: "Apply"
        },
        {
          outcome: "Transform and normalize data",
          bloomLevel: "Apply"
        }
      ],
      
      industryContext: {
        jobRoles: ["Data Analyst", "Data Engineer", "Data Scientist"],
        marketDemand: "Very High"
      }
    },
    
    "data_visualization": {
      id: "data_visualization",
      name: "Data Visualization",
      shortName: "Visualization",
      description: "Create effective data visualizations using matplotlib, seaborn, and other libraries.",
      
      prerequisites: ["python_basics", "statistics_fundamentals"],
      
      taxonomies: {
        bloomLevel: "Apply",
        eqfLevel: 5,
        knowledgeDimension: "Procedural"
      },
      
      bloomLevel: "Apply",
      eqfLevel: 5,
      difficultyLevel: "Intermediate",
      
      estimatedHours: 35,
      
      learningOutcomes: [
        {
          outcome: "Create appropriate charts for different data types",
          bloomLevel: "Apply"
        }
      ],
      
      industryContext: {
        jobRoles: ["Data Analyst", "Data Scientist", "Business Analyst"],
        marketDemand: "High"
      }
    },
    
    "machine_learning_basics": {
      id: "machine_learning_basics",
      name: "Machine Learning Basics",
      shortName: "ML Basics",
      description: "Introduction to machine learning algorithms, supervised and unsupervised learning, model evaluation.",
      
      prerequisites: ["python_basics", "statistics_fundamentals", "data_cleaning"],
      
      taxonomies: {
        bloomLevel: "Apply",
        eqfLevel: 6,
        knowledgeDimension: "Procedural"
      },
      
      bloomLevel: "Apply",
      eqfLevel: 6,
      difficultyLevel: "Advanced",
      
      estimatedHours: 80,
      
      learningOutcomes: [
        {
          outcome: "Implement basic ML algorithms",
          bloomLevel: "Apply"
        },
        {
          outcome: "Evaluate model performance",
          bloomLevel: "Analyze"
        }
      ],
      
      industryContext: {
        jobRoles: ["ML Engineer", "Data Scientist", "AI Developer"],
        marketDemand: "Very High"
      }
    },
    
    "deep_learning": {
      id: "deep_learning",
      name: "Deep Learning",
      shortName: "Deep Learning",
      description: "Neural networks, CNNs, RNNs, and modern deep learning architectures.",
      
      prerequisites: ["machine_learning_basics"],
      
      taxonomies: {
        bloomLevel: "Analyze",
        eqfLevel: 7,
        knowledgeDimension: "Procedural"
      },
      
      bloomLevel: "Analyze",
      eqfLevel: 7,
      difficultyLevel: "Advanced",
      
      estimatedHours: 100,
      
      learningOutcomes: [
        {
          outcome: "Build and train neural networks",
          bloomLevel: "Create"
        }
      ],
      
      industryContext: {
        jobRoles: ["Deep Learning Engineer", "AI Researcher", "ML Engineer"],
        marketDemand: "Very High"
      }
    },
    
    "data_analysis": {
      id: "data_analysis",
      name: "Data Analysis",
      shortName: "Data Analysis",
      description: "Comprehensive data analysis using statistical methods and visualization.",
      
      prerequisites: ["python_basics", "statistics_fundamentals", "data_cleaning", "data_visualization"],
      
      taxonomies: {
        bloomLevel: "Analyze",
        eqfLevel: 6,
        knowledgeDimension: "Procedural"
      },
      
      bloomLevel: "Analyze",
      eqfLevel: 6,
      difficultyLevel: "Advanced",
      
      estimatedHours: 70,
      
      learningOutcomes: [
        {
          outcome: "Conduct end-to-end data analysis",
          bloomLevel: "Analyze"
        }
      ],
      
      industryContext: {
        jobRoles: ["Data Analyst", "Business Analyst", "Data Scientist"],
        marketDemand: "Very High"
      }
    },
    
    "sql_databases": {
      id: "sql_databases",
      name: "SQL and Databases",
      shortName: "SQL",
      description: "Database design, SQL queries, and data management.",
      
      prerequisites: [],
      
      taxonomies: {
        bloomLevel: "Apply",
        eqfLevel: 5,
        knowledgeDimension: "Procedural"
      },
      
      bloomLevel: "Apply",
      eqfLevel: 5,
      difficultyLevel: "Intermediate",
      
      estimatedHours: 45,
      
      learningOutcomes: [
        {
          outcome: "Write complex SQL queries",
          bloomLevel: "Apply"
        }
      ],
      
      industryContext: {
        jobRoles: ["Data Analyst", "Database Administrator", "Data Engineer"],
        marketDemand: "Very High"
      }
    }
  },
  
  learningResources: {
    "resource_python_1": {
      id: "resource_python_1",
      title: "Python Programming: From Zero to Hero",
      type: "Course",
      provider: "DataCamp",
      
      teachesCompetencies: [{
        competencyId: "python_basics",
        coverageLevel: 1.0
      }],
      
      duration: 420,
      difficultyLevel: "Beginner",
      rating: 4.7,
      cost: 29.99,
      
      learningStyleSuitability: {
        visual: 0.95,
        auditory: 0.80,
        readingWriting: 0.60,
        kinesthetic: 0.90
      },
      
      quality: {
        accuracyScore: 0.95,
        relevanceScore: 0.92,
        engagementScore: 0.88,
        completenessScore: 0.90
      },
      
      accessibilityFeatures: {
        closedCaptions: true,
        transcript: true,
        screenReaderCompatible: true,
        adjustableSpeed: true
      }
    },
    
    "resource_stats_1": {
      id: "resource_stats_1",
      title: "Statistics 101: Foundation Course",
      type: "Course",
      provider: "Khan Academy",
      
      teachesCompetencies: [{
        competencyId: "statistics_fundamentals",
        coverageLevel: 0.95
      }],
      
      duration: 480,
      difficultyLevel: "Beginner",
      rating: 4.8,
      cost: 0,
      
      learningStyleSuitability: {
        visual: 0.90,
        auditory: 0.75,
        readingWriting: 0.95,
        kinesthetic: 0.50
      },
      
      quality: {
        accuracyScore: 0.97,
        relevanceScore: 0.94,
        engagementScore: 0.85,
        completenessScore: 0.93
      },
      
      accessibilityFeatures: {
        closedCaptions: true,
        transcript: true,
        screenReaderCompatible: true,
        adjustableSpeed: true
      }
    }
  }
};

// Make sure it's available globally
if (typeof window !== 'undefined') {
  window.ontologyData = ontologyData;
}

// Also support module exports for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ontologyData };
}