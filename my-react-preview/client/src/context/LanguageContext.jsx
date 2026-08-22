import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

// Translation data
export const translations = {
  en: {
    // Navbar
    'currentExam': 'Current Exam',
    'change': 'Change',
    'selectExam': 'Select Your Exam',
    'manageProfile': 'Manage Profile',
    'dashboard': 'Dashboard',
    'subscription': 'Subscription',
    'support': 'Support',
    'settings': 'Settings',
    'signOut': 'Sign Out',
    'signIn': 'Sign In',
    'registerFree': 'Register Free 🎁',
    'signInDescription': 'Sign in to access your tests, history & analytics.',
    
    // Sidebar sections
    'studentActivity': 'Student Activity',
    'previousYearPapers': 'Previous Year Papers',
    'myTestHistory': 'My Test History',
    'bookmarkedQuestions': 'Bookmarked Questions',
    'practiceQuestionBank': 'Practice Question Bank',
    'analytics': 'Analytics',
    'scoreTrends': 'Score Trends',
    'analyticsDashboard': 'Analytics Dashboard',
    'company': 'Company',
    'aboutUs': 'About Us',
    'privacyPolicy': 'Privacy Policy',
    'refundPolicy': 'Refund Policy',
    'termsOfService': 'Terms of Service',
    'systemSettings': 'System Settings',
    'accountSettings': 'Account Settings',
    'tools': 'Tools',
    'dailyGoal': 'Daily Goal',
    'questionsCompleted': 'questions done today',
    'percentComplete': '% complete',
    'questionsLeft': 'left',
    'done': 'Done!',
    'backToDashboard': 'Back to Dashboard',
    'activePlan': 'Active Plan',
    'freeTrialTests': 'Free Trial · 2 tests',

    // Dashboard page
    'welcomeBack': 'Welcome back, {name}! 👋',
    'dashboardOverview': "Here's your SpeedMock dashboard overview",
    'activeSubscription': 'Active Subscription',
    'email': 'Email',
    'testsTaken': 'Tests Taken',
    'accuracy': 'Accuracy',
    'quickActions': 'Quick Actions',
    'dashboardFeatures': 'Dashboard Features Coming Soon',
    'dashboardFeaturesDesc': 'Take practice tests, track your progress, and analyze your performance here',
  },
  hi: {
    // Navbar
    'currentExam': 'वर्तमान परीक्षा',
    'change': 'परिवर्तन करें',
    'selectExam': 'अपनी परीक्षा चुनें',
    'manageProfile': 'प्रोफ़ाइल प्रबंधित करें',
    'dashboard': 'डैशबोर्ड',
    'subscription': 'सदस्यता',
    'support': 'समर्थन',
    'settings': 'सेटिंग्स',
    'signOut': 'साइन आउट करें',
    'signIn': 'साइन इन करें',
    'registerFree': 'निःशुल्क पंजीकरण करें 🎁',
    'signInDescription': 'अपने परीक्षा, इतिहास और विश्लेषण तक पहुँचने के लिए साइन इन करें।',
    
    // Sidebar sections
    'studentActivity': 'छात्र गतिविधि',
    'previousYearPapers': 'पिछले साल के पेपर',
    'myTestHistory': 'मेरा टेस्ट इतिहास',
    'bookmarkedQuestions': 'बुकमार्क किए गए प्रश्न',
    'practiceQuestionBank': 'प्रैक्टिस प्रश्न बैंक',
    'analytics': 'विश्लेषण',
    'scoreTrends': 'स्कोर प्रवृत्तियाँ',
    'analyticsDashboard': 'विश्लेषण डैशबोर्ड',
    'company': 'कंपनी',
    'aboutUs': 'हमारे बारे में',
    'privacyPolicy': 'गोपनीयता नीति',
    'refundPolicy': 'धन वापसी नीति',
    'termsOfService': 'सेवा की शर्तें',
    'systemSettings': 'सिस्टम सेटिंग्स',
    'accountSettings': 'खाता सेटिंग्स',
    'tools': 'उपकरण',
    'dailyGoal': 'दैनिक लक्ष्य',
    'questionsCompleted': 'आज के सवाल पूरे किए',
    'percentComplete': '% पूर्ण',
    'questionsLeft': 'बचा हुआ',
    'done': 'पूरा!',
    'backToDashboard': 'डैशबोर्ड पर वापस जाएँ',
    'activePlan': '✓ सक्रिय योजना',
    'freeTrialTests': 'निःशुल्क ट्रायल · 2 परीक्षाएं',

    // Dashboard page
    'welcomeBack': 'स्वागत है, {name}! 👋',
    'dashboardOverview': 'यहाँ आपका SpeedMock डैशबोर्ड अवलोकन है',
    'activeSubscription': 'सक्रिय सदस्यता',
    'email': 'ईमेल',
    'testsTaken': 'लिए गए परीक्षण',
    'accuracy': 'सटीकता',
    'quickActions': 'त्वरित क्रियाएं',
    'dashboardFeatures': 'डैशबोर्ड की सुविधाएं जल्द आ रही हैं',
    'dashboardFeaturesDesc': 'अभ्यास परीक्षण लें, अपनी प्रगति ट्रैक करें, और यहाँ अपने प्रदर्शन का विश्लेषण करें',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Check localStorage for saved language preference
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'en';
    }
    return 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
