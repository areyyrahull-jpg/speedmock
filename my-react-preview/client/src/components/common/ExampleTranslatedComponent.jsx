import { useLanguage } from '../../context/LanguageContext';

/**
 * Example Component - Demonstrates how to use the useLanguage hook
 * This component shows best practices for implementing translations
 */
export default function ExampleTranslatedComponent() {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <div style={{ padding: '20px', borderRadius: '8px', background: 'var(--bg2)' }}>
      <h2>{t('dashboard')}</h2>
      
      {/* Example 1: Simple translation */}
      <p>{t('studentActivity')}</p>

      {/* Example 2: Translation in list items */}
      <ul>
        <li>{t('previousYearPapers')}</li>
        <li>{t('myTestHistory')}</li>
        <li>{t('bookmarkedQuestions')}</li>
      </ul>

      {/* Example 3: Conditional content based on language */}
      <div>
        {language === 'hi' ? (
          <p>वर्तमान भाषा: हिंदी</p>
        ) : (
          <p>Current Language: English</p>
        )}
      </div>

      {/* Example 4: Dynamic text composition */}
      <p>
        {20} {t('questionsCompleted')} {t('of')} {100}
      </p>

      {/* Example 5: Using translations with React components */}
      <button onClick={toggleLanguage} style={{ padding: '8px 16px' }}>
        {language === 'en' ? 'Switch to हिंदी' : 'Switch to English'}
      </button>
    </div>
  );
}

/**
 * Integration Checklist for Adding Translations to a New Component:
 * 
 * 1. Import the hook at the top of your component:
 *    import { useLanguage } from '../../context/LanguageContext';
 * 
 * 2. Call the hook inside your component:
 *    const { t, language } = useLanguage();
 * 
 * 3. Add translation keys to LanguageContext.jsx:
 *    - Add English translation in translations.en object
 *    - Add Hindi translation in translations.hi object
 * 
 * 4. Replace hardcoded strings with t() function:
 *    OLD: <h1>Dashboard</h1>
 *    NEW: <h1>{t('dashboard')}</h1>
 * 
 * 5. Test:
 *    - Toggle language and verify text changes
 *    - Refresh page and verify language persists
 *    - Check console for any translation key errors
 */

/**
 * Example: Converting a component to support translations
 * 
 * BEFORE (without translations):
 * ─────────────────────────────
 * export default function Header() {
 *   return (
 *     <header>
 *       <h1>Dashboard</h1>
 *       <nav>
 *         <a href="/tests">My Tests</a>
 *         <a href="/history">Test History</a>
 *       </nav>
 *     </header>
 *   );
 * }
 * 
 * AFTER (with translations):
 * ──────────────────────────
 * import { useLanguage } from '../../context/LanguageContext';
 * 
 * export default function Header() {
 *   const { t } = useLanguage();
 *   
 *   return (
 *     <header>
 *       <h1>{t('dashboard')}</h1>
 *       <nav>
 *         <a href="/tests">{t('myTests')}</a>
 *         <a href="/history">{t('testHistory')}</a>
 *       </nav>
 *     </header>
 *   );
 * }
 * 
 * DON'T FORGET: Add the new translation keys to LanguageContext.jsx!
 * translations = {
 *   en: {
 *     'myTests': 'My Tests',
 *     'testHistory': 'Test History',
 *   },
 *   hi: {
 *     'myTests': 'मेरे परीक्षण',
 *     'testHistory': 'परीक्षण इतिहास',
 *   }
 * }
 */
