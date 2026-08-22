import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/common/publicNavbar";
import Footer from "../../components/common/footer";

export default function ContactUs() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I get started with SpeedMock?",
      answer: "Sign up with your email, select a subscription plan, and get instant access to all mock tests, PYQ papers, and practice materials. No credit card required for the 3-day free trial."
    },
    {
      id: 2,
      question: "Can I access SpeedMock on multiple devices?",
      answer: "Yes! Depending on your plan: Sprint (1 device), Surge (2 devices), and Storm (3 devices). You can login on multiple devices simultaneously within your device limit."
    },
    {
      id: 3,
      question: "What exams does SpeedMock cover?",
      answer: "SpeedMock covers SSC (CGL, CPO, CHSL, GD, MTS), Railway (NTPC, ALP, Group D, JE), and Typing Tests. We're constantly adding more exams based on user demand."
    },
    {
      id: 4,
      question: "How are the mock tests created?",
      answer: "All our mock tests are based on official PYQ papers (2014-2024) and follow the exact exam pattern. They're reviewed by exam experts to ensure accuracy and relevance."
    },
    {
      id: 5,
      question: "Can I download the tests or study materials?",
      answer: "Currently, all materials are available on our platform for online access. You can take tests anytime, and we provide detailed solutions and performance analysis after each test."
    },
    {
      id: 6,
      question: "What if I face technical issues?",
      answer: "Contact our support team at support@speedmock.com with details about the issue. We typically respond within 24-48 hours. For urgent issues, please email with 'URGENT' in the subject line."
    },
    {
      id: 7,
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel anytime. Once cancelled, you'll lose access at the end of your subscription period. No refunds are provided for partial months."
    },
    
    {
      id: 9,
      question: "How often are new tests and materials added?",
      answer: "We add new mock tests and practice questions weekly. Current affairs and seasonal exams are updated regularly to match the latest syllabus changes."
    }
    
  ];

  const handleNavigate = (page) => {
    if (page === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (page === "pricing") {
      const element = document.getElementById("pricing");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', 'Outfit', sans-serif; background: #0e0e12; }

        :root {
          --f: #d946ef;
          --fl: #e879f9;
          --fd: #a21caf;
          --t: #f0f0f0;
          --m: #999;
          --b: rgba(217,70,239,0.18);
          --grey-900: #0e0e12;
          --grey-800: #18181f;
          --grey-750: #1f1f28;
          --grey-700: #252530;
          --grey-600: #32323f;
          --grey-400: #7a7a90;
          --grey-300: #aaaabd;
          --grey-200: #c8c8d8;
          --grey-100: #ebebf2;
          --white: #ffffff;
        }

        .contact-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--grey-900);
          padding-top: 120px;
          padding-bottom: 60px;
        }

        .contact-content {
          flex: 1;
          max-width: 900px;
          width: 100%;
          margin: 0 auto;
          padding: 0 20px;
        }

        .contact-header {
          text-align: center;
          margin-bottom: 50px;
          margin-top: 30px;
          animation: fadeUp 0.6s ease both;
        }

        .contact-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3rem, 10vw, 5rem);
          letter-spacing: 3px;
          font-weight: 900;
          margin-bottom: 12px;
          background: linear-gradient(135deg, var(--fl) 0%, var(--f) 50%, var(--fd) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 2px 8px rgba(217,70,239,0.4));
          line-height: 1.1;
        }

        .contact-subtitle {
          font-size: 1.15rem;
          color: var(--grey-300);
          line-height: 1.7;
          max-width: 600px;
          margin: 0 auto;
          font-weight: 500;
        }

        .contact-divider {
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, var(--f), var(--fd));
          border-radius: 2px;
          margin: 24px auto 0;
        }

        .contact-form-wrapper {
          background: rgba(217,70,239,0.04);
          border: 1.5px solid rgba(217,70,239,0.2);
          border-radius: 20px;
          padding: 40px;
          animation: fadeUp 0.6s 0.1s ease both;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--t);
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }

        input[type="text"],
        input[type="email"],
        textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid rgba(217,70,239,0.25);
          border-radius: 10px;
          background: rgba(30,30,40,0.6);
          color: var(--t);
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          transition: all 0.3s;
          resize: vertical;
          min-height: 44px;
        }

        input[type="text"]::placeholder,
        input[type="email"]::placeholder,
        textarea::placeholder {
          color: var(--grey-400);
        }

        input[type="text"]:focus,
        input[type="email"]:focus,
        textarea:focus {
          outline: none;
          border-color: var(--f);
          background: rgba(30,30,40,0.8);
          box-shadow: 0 0 0 3px rgba(217,70,239,0.1);
        }

        textarea {
          min-height: 140px;
          font-family: 'Outfit', sans-serif;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          .contact-form-wrapper {
            padding: 24px;
          }
        }

        .submit-btn {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, var(--f), var(--fd));
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.4px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(217,70,239,0.35);
          margin-top: 24px;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(217,70,239,0.5);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .success-message {
          margin-bottom: 24px;
          padding: 16px 20px;
          background: rgba(34,197,94,0.1);
          border: 1.5px solid rgba(34,197,94,0.3);
          border-radius: 10px;
          color: #22c55e;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideDown 0.4s ease both;
        }

        .contact-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-top: 50px;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        .info-card {
          background: rgba(217,70,239,0.06);
          border: 1.5px solid rgba(217,70,239,0.15);
          border-radius: 15px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s;
        }

        .info-card:hover {
          border-color: var(--f);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(217,70,239,0.15);
        }

        .info-icon {
          font-size: 2rem;
          margin-bottom: 12px;
        }

        .info-title {
          font-weight: 700;
          color: var(--t);
          margin-bottom: 8px;
          font-size: 0.95rem;
        }

        .info-content {
          font-size: 0.85rem;
          color: var(--grey-400);
          line-height: 1.5;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ═══════════════════════════════════ FAQ SECTION ═══════════════════════════════════ */
        .faq-section {
          margin-top: 60px;
          animation: fadeUp 0.6s 0.3s ease both;
        }

        .faq-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .faq-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.2rem;
          letter-spacing: 2px;
          color: var(--white);
          margin-bottom: 12px;
        }

        .faq-subtitle {
          font-size: 0.95rem;
          color: var(--grey-400);
        }

        .faq-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-item {
          background: rgba(217,70,239,0.04);
          border: 1.5px solid rgba(217,70,239,0.15);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .faq-item:hover {
          border-color: rgba(217,70,239,0.3);
          background: rgba(217,70,239,0.06);
        }

        .faq-question {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          cursor: pointer;
          user-select: none;
        }

        .faq-question-text {
          font-size: 0.98rem;
          font-weight: 600;
          color: var(--t);
          flex: 1;
        }

        .faq-toggle-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--f);
          font-size: 1.2rem;
          transition: transform 0.3s;
          flex-shrink: 0;
        }

        .faq-item.expanded .faq-toggle-icon {
          transform: rotate(180deg);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
        }

        .faq-item.expanded .faq-answer {
          max-height: 300px;
          padding: 0 20px 18px 20px;
        }

        .faq-answer-text {
          font-size: 0.9rem;
          color: var(--grey-200);
          line-height: 1.6;
        }

        /* ═══════════════════════════════════ EMAIL SECTION ═══════════════════════════════════ */
        .email-section {
          margin-top: 60px;
          animation: fadeUp 0.6s 0.4s ease both;
        }

        .email-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .email-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          letter-spacing: 2px;
          color: var(--white);
          margin-bottom: 12px;
        }

        .email-card {
          background: linear-gradient(135deg, rgba(217,70,239,0.1), rgba(217,70,239,0.04));
          border: 2px solid var(--f);
          border-radius: 18px;
          padding: 40px;
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .email-label {
          font-size: 0.9rem;
          color: var(--grey-400);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .email-address {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--fl);
          margin-bottom: 8px;
          word-break: break-all;
        }

        .email-link {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 28px;
          background: linear-gradient(135deg, var(--f), var(--fd));
          color: #fff;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.3s;
          box-shadow: 0 4px 16px rgba(217,70,239,0.3);
        }

        .email-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(217,70,239,0.5);
        }

        .support-info {
          margin-top: 30px;
          padding-top: 30px;
          border-top: 1px solid rgba(217,70,239,0.2);
          font-size: 0.85rem;
          color: var(--grey-400);
          line-height: 1.6;
        }

        .support-info strong {
          color: var(--t);
        }

      `}</style>

      <div className="contact-wrapper">
        <PublicNavbar
          activePage="contact"
          onNavigate={handleNavigate}
          onLogin={() => navigate("/login")}
          onSignUp={() => navigate("/signup")}
        />

        <div className="contact-content">
          {/* Header */}
          <div className="contact-header">
            <h1 className="contact-title">Get in Touch</h1>
            <div className="contact-divider"></div>
            <p className="contact-subtitle">
              Have questions? We're here to help! Reach out to our support team via email.
            </p>
          </div>

          {/* Email Contact Section */}
          <div className="email-section">
            <div className="email-header">
              <h2 className="email-title">Contact Us</h2>
            </div>
            
            <div className="email-card">
              <div className="email-label">📧 Email Us At</div>
              <div className="email-address">speedmockplatform@.com</div>
              <p className="faq-answer-text" style={{marginTop: "12px"}}>
                We typically respond within <strong>24-48 hours</strong>
              </p>
              
              <a href="mailto:speedmockplatform@.com" className="email-link">
                Send Email Now
              </a>
              
              <div className="support-info">
                <strong>⏰ Support Hours:</strong> Monday - Friday, 9 AM - 6 PM IST<br/>
                <strong>🚨 Urgent Issues:</strong> Include "URGENT" in your subject line for faster response<br/>
                <strong>💡 Pro Tip:</strong> Include your subscription ID in your email for quicker resolution
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <div className="faq-header">
              <h2 className="faq-title">Frequently Asked Questions</h2>
              <p className="faq-subtitle">Find answers to common questions about SpeedMock</p>
            </div>

            <div className="faq-grid">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className={`faq-item${expandedFaq === faq.id ? " expanded" : ""}`}
                  onClick={() => toggleFaq(faq.id)}
                >
                  <div className="faq-question">
                    <span className="faq-question-text">{faq.question}</span>
                    <span className="faq-toggle-icon">▼</span>
                  </div>
                  <div className="faq-answer">
                    <div className="faq-answer-text">{faq.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info Cards */}
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">📞</div>
              <div className="info-title">Quick Response</div>
              <div className="info-content">
                Email us and get a response within 24-48 hours
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">🌐</div>
              <div className="info-title">Multiple Channels</div>
              <div className="info-content">
                Check FAQs first, then reach out to speedmockplatform@.com
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">✅</div>
              <div className="info-title">Expert Support</div>
              <div className="info-content">
                Our team is trained to help with all your queries
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
