import { useEffect } from "react";
import { AuthProvider } from "../client/src/context/AuthContext";
import { Routes, Route, useNavigate } from "react-router-dom";
import { LanguageProvider } from "../client/src/context/LanguageContext";
import { ThemeProvider } from "../client/src/context/ThemeContext";
import { ExamProvider, useExam } from "../client/src/context/ExamContext";
import { GoalProvider } from "../client/src/context/GoalContext"
import ForgotPassword from "../client/src/pages/auth/forgotpassword";
import SpeedMockLogin from "../client/src/pages/auth/speedmocklogin";
import SpeedMockSignup from "../client/src/pages/auth/SpeedMocksignup";
import ContactUs from "../client/src/pages/contact/ContactUs";
import Dashboard from "../client/src/pages/dashboard/dashboard";
import SpeedMockHero from "../client/src/components/common/hero";
import SpeedMockFooter from "../client/src/components/common/footer";
import PublicNavbar from "../client/src/components/common/publicNavbar";
import RefunPolicy from "../client/src/pages/refundpolicy";
import Subscription from "../client/src/components/subscription/subscription";
import {EnglishTyping} from "../client/src/pages/typing/englishhome";
import EnglishPracticeHub from "../client/src/pages/typing/EnglishPracticeHub";
import {EnglishTest} from "../client/src/pages/typing/englishtest";
import EnglishTypingTips from "../client/src/pages/typing/englishtypingtips";
import HindiTyping from "../client/src/pages/typing/hindihome";
import HindiPracticeHub from "../client/src/pages/typing/HindiPracticeHub";
import HindiTest from "../client/src/pages/typing/hinditest";
import HindiTypingTips from "../client/src/pages/typing/hinditypingtips";
import PrivacyPolicy from "../client/src/pages/privacypolicy";
import AboutUs from "../client/src/pages/aboutus";
import LegalTerms from "../client/src/pages/legalterms";
import Analytics from "../client/src/components/analytics/analytics";
import SyllabusPage from "../client/src/components/home/syllabus/syllabuspage";
import ExamPatternPage from "../client/src/components/home/syllabus/exampatternpage";
import Bookmarks from "../client/src/pages/typing/bookmark/bookmark";
import ProtectedRoute from "../client/src/components/common/protectedroute";
import Settings from "../client/src/components/home/settings/setting";
import PYQPapers from "../client/src/components/home/test/pyqpapers";
import TestRunner from "../client/src/components/home/test/testrunner";
import { useAuth } from "../client/src/context/AuthContext";
import { useSubscription } from "../client/src/components/subscription/usesubscription";
import { useParams, useSearchParams } from "react-router-dom";
import SubjectWiseTests from "../client/src/components/home/test/SubjectWiseTest";
import TopicWiseTests from "../client/src/components/home/test/TopicwiseTest";
import SubjectsPage from "../client/src/pages/practice/SubjectsPage";
import TopicsPage from "../client/src/pages/practice/TopicsPage";
import PracticeSession from "../client/src/pages/practice/PracticeSession";
import ReferralCard from "../client/src/pages/dashboard/refferal";
import ProgressTracker from "../client/src/components/analytics/progress";
import TestHistoryPage from "../client/src/components/home/test/testhistory";
import { PapersPage } from "../client/src/components/home/test/paperspage";
import AdminPanel from "../client/src/components/Admin/AdminPanel";
import ScrollToTop from "./components/ScrollToTop";



function HomePage() {
  const navigate = useNavigate();
  const handleNavigate = (page) => {
    if (page === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (page === "login") return navigate("/login");
    if (page === "signup") return navigate("/signup");
    if (page === "contact") return navigate("/contact");
    if (page === "pricing") {
      const element = document.getElementById("pricing");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0e0e12" }}>
      <PublicNavbar
        activePage="home"
        onNavigate={handleNavigate}
        onLogin={() => navigate("/login")}
        onSignUp={() => navigate("/signup")}
      />

      <main style={{ flex: 1 }}>
        <SpeedMockHero />
      </main>

      <SpeedMockFooter />
    </div>
  );
}

//admin 
function AdminGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login", { replace: true });
    else if (!user.is_admin) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",
      justifyContent:"center",background:"#0b0b10",color:"#7a7a90",
      fontFamily:"Outfit,sans-serif",fontSize:13}}>
      Loading...
    </div>
  );

  if (!user || !user.is_admin) return null;
  return <AdminPanel />;
}
// SyllabusPage and ExamPatternPage need the CURRENTLY selected exam
// from the navbar, not a hardcoded "cgl" — these wrappers read it
// from ExamContext (the same context DashboardNavbar writes to) so
// the route always shows whatever exam the user actually picked.
function SyllabusPageRoute() {
  const navigate = useNavigate();
  const { selectedExam } = useExam();
  return <SyllabusPage examId={selectedExam} onBack={() => navigate("/dashboard")} />;
}

function ExamPatternPageRoute() {
  const navigate = useNavigate();
  const { selectedExam } = useExam();
  return <ExamPatternPage examId={selectedExam} onBack={() => navigate("/dashboard")} />;
}

// PYQ papers listing — needs the signed-in user (to load attempt status
// from user_test_attempts) and the current exam. Start/Resume/Review
// navigate into the test runner.
function PYQPapersRoute() {
  const navigate = useNavigate();
  const { selectedExam } = useExam();
  const { user } = useAuth();
  const { dashboardStatus } = useSubscription(user?.id);
  const isSubscribed = dashboardStatus
    ? dashboardStatus.status === "active" || dashboardStatus.status === "trial"
    : false;

  return (
    <PYQPapers
      examId={selectedExam}
      userId={user?.id}
      isSubscribed={isSubscribed}
      onBack={() => navigate("/dashboard")}
      onStart={(test) => navigate(`/test/pyq/${test.id}`)}
      onResume={(test) => navigate(`/test/pyq/${test.id}`)}
      onReview={(test) => navigate(`/test/pyq/${test.id}?reviewAttempt=${test.attemptId}`)}
    />
  );
}




// Shared subscription gate for the test-listing wrappers.
function useIsSubscribed() {
  const { user } = useAuth();
  const { dashboardStatus } = useSubscription(user?.id);
  return dashboardStatus
    ? dashboardStatus.status === "active" || dashboardStatus.status === "trial"
    : false;
}

// Typing feature's premium gate — deliberately stricter than
// useIsSubscribed() above. A free trial (from free_credits) should
// NOT remove ads or unlock every lesson in typing; only a genuinely
// paid, currently-active plan should. PYQ/Subject/Topic tests keep
// their existing trial-inclusive behavior via useIsSubscribed().
function useIsTypingPremium() {
  const { user } = useAuth();
  const { dashboardStatus } = useSubscription(user?.id);
  return dashboardStatus ? dashboardStatus.status === "active" : false;
}

function SubjectWiseRoute() {
  const navigate = useNavigate();
  const { selectedExam } = useExam();
  const { user } = useAuth();
  const isSubscribed = useIsSubscribed();
  return (
    <SubjectWiseTests
      examId={selectedExam}
      userId={user?.id}
      isSubscribed={isSubscribed}
      onBack={() => navigate("/dashboard")}
      onStart={(test) => navigate(`/test/subject/${test.id}`)}
      onResume={(test) => navigate(`/test/subject/${test.id}`)}
      onReview={(test) => navigate(`/test/subject/${test.id}?reviewAttempt=${test.attemptId}`)}
    />
  );
}

function TopicWiseRoute() {
  const navigate = useNavigate();
  const { selectedExam } = useExam();
  const { user } = useAuth();
  const isSubscribed = useIsSubscribed();
  return (
    <TopicWiseTests
      examId={selectedExam}
      userId={user?.id}
      isSubscribed={isSubscribed}
      onBack={() => navigate("/dashboard")}
      onStart={(test) => navigate(`/test/topic/${test.id}`)}
      onResume={(test) => navigate(`/test/topic/${test.id}`)}
      onReview={(test) => navigate(`/test/topic/${test.id}?reviewAttempt=${test.attemptId}`)}
    />
  );
}

// Typing feature routes — free content for everyone, but the lesson
// course's sequential unlock and the ad slots (lesson course + exam
// paper list) are gated on subscription status via useIsSubscribed().
function EnglishPracticeRoute() {
  const isSubscribed = useIsTypingPremium();
  return <EnglishPracticeHub isSubscribed={isSubscribed} />;
}
function HindiPracticeRoute() {
  const isSubscribed = useIsTypingPremium();
  return <HindiPracticeHub isSubscribed={isSubscribed} />;
}
function EnglishTestRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSubscribed = useIsTypingPremium();
  return <EnglishTest isSubscribed={isSubscribed} userId={user?.id} onBack={() => navigate("/englishhome")} />;
}
function HindiTestRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSubscribed = useIsTypingPremium();
  return <HindiTest isSubscribed={isSubscribed} userId={user?.id} onBack={() => navigate("/hindihome")} />;
}

// Test runner — reads :testType/:testId from the URL and pulls
// questions/metadata from the new schema via useTestQuestions.
function TestRunnerRoute() {
  const navigate = useNavigate();
  const { testType, testId } = useParams();
  const [searchParams] = useSearchParams();
  const reviewAttemptId = searchParams.get("reviewAttempt") || null;
  const { user } = useAuth();
  return (
    <TestRunner
      testId={testId}
      testType={testType}
      userId={user?.id}
      candidate={{ name: user?.name || user?.full_name || "Candidate", id: user?.id }}
      onExit={() => navigate(-1)}
      reviewAttemptId={reviewAttemptId}
    />
  );
}



export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ExamProvider>
            <GoalProvider>
              <ScrollToTop>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<SpeedMockLogin />} />
                <Route path="/signup" element={<SpeedMockSignup />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/refund" element={<RefunPolicy />} />
                <Route path="/englishhome" element={<EnglishTyping />} />
                <Route path="/englishpractice" element={<EnglishPracticeRoute />} />
                <Route path="/englishtest" element={<EnglishTestRoute />} />
                <Route path="/englishtypingtips" element={<EnglishTypingTips />} />
                <Route path="/hindihome" element={<HindiTyping />} />
                <Route path="/hindipractice" element={<HindiPracticeRoute />} />
                <Route path="/hinditest" element={<HindiTestRoute />} />
                <Route path="/hinditypingtips" element={<HindiTypingTips />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/legal" element={<LegalTerms />} />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } />

                <Route path="/subscription" element={
                  <ProtectedRoute>
                    <Subscription />
                  </ProtectedRoute>
                } />
                <Route path="/forgotpassword" element={<ForgotPasswordWrapper />} />
                <Route path="/syllabuspage" element={<SyllabusPageRoute />} />
                <Route path="/exampatternpage" element={<ExamPatternPageRoute />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/setting" element={<Settings />} />
                <Route path="/pyqpapers" element={<ProtectedRoute><PYQPapersRoute /></ProtectedRoute>} />
                <Route path="/test/:testType/:testId" element={<ProtectedRoute><TestRunnerRoute /></ProtectedRoute>} />
                <Route path="/subject" element={<ProtectedRoute><SubjectWiseRoute /></ProtectedRoute>} />
                <Route path="/topic" element={<ProtectedRoute><TopicWiseRoute /></ProtectedRoute>} />
                <Route path="/practice/:examId" element={<SubjectsPage />} />
                <Route path="/practice/:examId/:subjectCode" element={<TopicsPage />} />
                <Route path="/practice/:examId/:subjectCode/:topicId" element={<PracticeSession />} />
                <Route path="/referral" element={<ReferralCard />} />
                <Route path="/progress" element={<ProgressTracker />} />
                <Route path="/testhistory" element={<TestHistoryPage />} />
                <Route path="/paperspage" element={<PapersPage />} />
                <Route path="/admin" element={<AdminGuard />} />
              </Routes
              <ScrollToTop />
            </GoalProvider>
          </ExamProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function ForgotPasswordWrapper() {
  const navigate = useNavigate();
  return (
    <ForgotPassword
      onBack={() => navigate("/login")}
      onRecovered={() => navigate("/dashboard", { replace: true })}
    />
  );
}
