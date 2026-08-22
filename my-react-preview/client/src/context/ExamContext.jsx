import React, { createContext, useState, useContext, useEffect } from 'react';

const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [selectedExam, setSelectedExam] = useState(() => {
    // Check localStorage for saved exam preference
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedExam') || 'cgl';
    }
    return 'cgl';
  });

  // Save exam selection to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedExam', selectedExam);
    }
  }, [selectedExam]);

  const changeExam = (examId) => {
    setSelectedExam(examId);
  };

  return (
    <ExamContext.Provider value={{ selectedExam, changeExam }}>
      {children}
    </ExamContext.Provider>
  );
};

// Hook to use exam context
export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within ExamProvider');
  }
  return context;
};
