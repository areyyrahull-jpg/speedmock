# Hindi/English Language Toggle - Implementation Guide

## Overview
The SpeedMock application now includes a Hindi/English language toggle feature that allows users to switch between languages seamlessly. The toggle button appears in the navbar next to the theme toggle.

## Features
- 🌐 Toggle between English (EN) and Hindi (हि)
- 💾 Language preference is saved to localStorage
- 🔄 Real-time translation across the application
- 📱 Responsive design that works on all devices

## Setup Instructions

### 1. Wrap Your App with LanguageProvider
In your main `App.jsx` or `main.jsx`, wrap your application with the `LanguageProvider`:

```jsx
import { LanguageProvider } from './context/LanguageContext';
import YourApp from './App';

function Main() {
  return (
    <LanguageProvider>
      <YourApp />
    </LanguageProvider>
  );
}

export default Main;
```

### 2. Using Translations in Components
Use the `useLanguage` hook to access translations in any component:

```jsx
import { useLanguage } from '../context/LanguageContext';

export default function MyComponent() {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <div>
      <h1>{t('dashboard')}</h1>
      <p>Current language: {language}</p>
      <button onClick={toggleLanguage}>Toggle Language</button>
    </div>
  );
}
```

## Available Translations
The following keys are currently available for translation:

### Navbar & Navigation
- `currentExam` - Current Exam
- `change` - Change
- `manageProfile` - Manage Profile
- `dashboard` - Dashboard
- `subscription` - Subscription
- `support` - Support
- `settings` - Settings
- `signOut` - Sign Out
- `signIn` - Sign In
- `registerFree` - Register Free 🎁
- `signInDescription` - Sign in description text

### Sidebar Sections
- `studentActivity` - Student Activity
- `previousYearPapers` - Previous Year Papers
- `myTestHistory` - My Test History
- `bookmarkedQuestions` - Bookmarked Questions
- `practiceQuestionBank` - Practice Question Bank
- `analytics` - Analytics
- `scoreTrends` - Score Trends
- `analyticsDashboard` - Analytics Dashboard
- `company` - Company
- `aboutUs` - About Us
- `privacyPolicy` - Privacy Policy
- `refundPolicy` - Refund Policy
- `termsOfService` - Terms of Service
- `systemSettings` - System Settings
- `accountSettings` - Account Settings
- `tools` - Tools
- `dailyGoal` - Daily Goal
- `questionsCompleted` - Questions completed today
- `percentComplete` - % complete
- `questionsLeft` - Questions left
- `done` - Done!
- `backToDashboard` - Back to Dashboard
- `activePlan` - Active Plan
- `freeTrialTests` - Free Trial · 2 tests

## Adding New Translations

### Step 1: Add Translation Keys to LanguageContext
Edit [LanguageContext.jsx](./my-react-preview/client/src/context/LanguageContext.jsx) and add your new keys:

```jsx
export const translations = {
  en: {
    'newKey': 'English text here',
  },
  hi: {
    'newKey': 'हिंदी पाठ यहाँ',
  }
};
```

### Step 2: Use in Your Component
```jsx
import { useLanguage } from '../context/LanguageContext';

export default function MyComponent() {
  const { t } = useLanguage();
  return <p>{t('newKey')}</p>;
}
```

## Language Context API

### Properties & Methods
```jsx
const { language, toggleLanguage, t } = useLanguage();

// language (string) - Current language: 'en' or 'hi'
// toggleLanguage (function) - Toggle between English and Hindi
// t (function) - Translate a key: t('keyName')
```

## How Language Preference is Stored
- Language preference is stored in `localStorage` under the key `'language'`
- The value can be either `'en'` or `'hi'`
- Preference persists across browser sessions

## Files Modified/Created
- ✅ Created: [LanguageContext.jsx](./my-react-preview/client/src/context/LanguageContext.jsx)
- ✅ Updated: [dashboardNavbar.jsx](./my-react-preview/client/src/components/common/dashboardNavbar.jsx)

## Testing the Feature
1. Open the dashboard navbar
2. Look for the language toggle button (EN/हि) in the top-right corner next to the theme toggle
3. Click to toggle between English and Hindi
4. All navbar text should update instantly
5. Refresh the page - the language preference should persist

## Browser Compatibility
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Common Use Cases

### Translating Exam Categories
```jsx
<h3>{t('selectExam')}</h3>
```

### Translating Sidebar Menu Items
```jsx
{ icon:"📊", label: t('analytics'), page:"analytics" }
```

### Conditional Translation Display
```jsx
const { t, language } = useLanguage();

return (
  <p>
    {language === 'hi' 
      ? 'यह हिंदी में है' 
      : 'This is in English'}
  </p>
);
```

## Future Enhancements
- Add more languages (Regional Indian languages)
- Implement RTL (Right-to-Left) support for better Hindi typography
- Add language selector in settings
- Create translation management dashboard
- Integrate with backend for server-side translations

## Troubleshooting

### Translation key not showing
- Ensure the key exists in the `translations` object
- Check for typos in the key name
- Make sure component is wrapped with `LanguageProvider`

### Language not persisting
- Check if localStorage is enabled in browser
- Check browser console for errors
- Clear localStorage and try again

### useLanguage hook error
- Verify component is inside `LanguageProvider`
- Check that the context import path is correct

## Support
For issues or questions about the language feature, refer to the implementation in:
- [LanguageContext.jsx](./my-react-preview/client/src/context/LanguageContext.jsx)
- [dashboardNavbar.jsx](./my-react-preview/client/src/components/common/dashboardNavbar.jsx)
