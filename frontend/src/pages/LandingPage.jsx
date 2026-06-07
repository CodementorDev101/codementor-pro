import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [typedText, setTypedText] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [codeText, setCodeText] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouseTrail, setMouseTrail] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [logoVisible, setLogoVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codeParticles, setCodeParticles] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionStage, setExecutionStage] = useState('idle');
  const [outputText, setOutputText] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [liveStats, setLiveStats] = useState({ successRate: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const res = await fetch('https://codementor-pro-production.up.railway.app/api/analytics/public-stats');
        const json = await res.json();
        if (json.success) {
          setLiveStats({ successRate: json.data.successRate });
        }
      } catch (err) {
        console.error('Could not fetch live stats:', err);
      }
    };
    fetchPublicStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setLogoVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    const codeSnippets = [
      'def hello():', 'return True', 'if x > 0:', 'for i in range(10):',
      'while True:', 'import sys', 'class Node:', 'print("Hello")',
      'const x = 10;', 'function(){}', 'let array = [];', 'return null;',
      'public static', 'private int', 'void main()', 'String text',
      '#include <stdio.h>', 'int main()', 'printf("%d")', 'return 0;'
    ];
    const particles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
      left: Math.random() * 100,
      animationDuration: 15 + Math.random() * 10,
      animationDelay: Math.random() * 5,
      fontSize: 12 + Math.random() * 6,
      opacity: 0.1 + Math.random() * 0.2
    }));
    setCodeParticles(particles);
  }, []);

  useEffect(() => {
    const text = 'Master Programming';
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) { setTypedText(text.substring(0, index)); index++; }
      else clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll('.reveal-section').forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8 && !section.classList.contains('revealed'))
          section.classList.add('revealed');
      });
      setShowBackToTop(window.scrollY > 300);
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((window.scrollY / windowHeight) * 100);
      document.querySelectorAll('.parallax-orb').forEach((orb, index) => {
        orb.style.transform = `translateY(${-(window.scrollY * (index + 1) * 0.5)}px)`;
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseTrail(prev => [...prev, { x: e.clientX, y: e.clientY, id: Date.now() }].slice(-15));
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setMouseTrail(prev => prev.slice(-10)), 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTestimonial(prev => (prev + 1) % 3), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const code = `def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(10))`;
    let index = 0;
    const timer = setInterval(() => {
      if (index <= code.length) { setCodeText(code.substring(0, index)); index++; }
      else setTimeout(() => { setCodeText(''); index = 0; }, 2000);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const handleRunCode = async () => {
    setIsRunning(true); setExecutionStage('compiling'); setOutputText(''); setTestResults([]);
    await new Promise(r => setTimeout(r, 800));
    setExecutionStage('running');
    await new Promise(r => setTimeout(r, 1000));
    setOutputText('55');
    await new Promise(r => setTimeout(r, 500));
    const tests = [
      { id: 1, name: 'Test Case 1: fibonacci(5) == 5', passed: true },
      { id: 2, name: 'Test Case 2: fibonacci(10) == 55', passed: true },
      { id: 3, name: 'Test Case 3: fibonacci(0) == 0', passed: true }
    ];
    for (let i = 0; i < tests.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setTestResults(prev => [...prev, tests[i]]);
    }
    await new Promise(r => setTimeout(r, 500));
    setExecutionStage('completed'); setIsRunning(false);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const testimonials = [
    { name: "Jeff Enguas", role: "Information Technology Student", text: "The automated grading system made it very easy to check my code instantly. I liked how each test case result was shown clearly after submission.", avatar: "👩‍💻" },
    { name: "Yabut Amara", role: "Information Technology Student", text: "CodeMentor+ Pro is straightforward to use. I could submit my solutions and immediately see which test cases passed or failed, which helped me improve my code.", avatar: "👨‍💻" },
    { name: "Venz Belonio", role: "Information Technology Student", text: "Having exercises in multiple programming languages in one platform is very convenient. The code editor works well and the feedback is instant.", avatar: "👩‍🎓" },
    { name: "Malic Tula", role: "Information Technology Student", text: "The platform is very intuitive and the exercises are well-structured. Being able to see detailed feedback on each submission really helped me learn faster.", avatar: "👨‍🎓" },
    { name: "Monique Roa", role: "Information Technology Student", text: "I appreciate how CodeMentor+ Pro supports multiple programming languages. It made practicing different languages in one place very efficient.", avatar: "👩‍💻" }
  ];

  const languageInfo = {
    Python: 'Beginner-friendly syntax, great for starting out',
    Java: 'Object-oriented programming fundamentals',
    'C++': 'Performance-focused systems programming',
    JavaScript: 'Web scripting and dynamic applications',
    C: 'Low-level programming and memory management',
  };

  const faqs = [
    { question: "What programming languages are supported?", answer: "CodeMentor+ Pro supports Python, Java, C++, JavaScript, and C. Each language uses Judge0 CE for real code execution, so your code is compiled and run just like a real development environment." },
    { question: "How does the automated grading system work?", answer: "When you submit code, it is sent to Judge0 CE for execution. The system runs your code against predefined test cases and compares the output. You instantly see which test cases passed or failed." },
    { question: "Who can use CodeMentor+ Pro?", answer: "The platform has three roles: Students can browse and solve exercises; Instructors can create and manage their own exercises with custom test cases; Admins manage all users and approve instructor registrations." },
    { question: "Can I track my progress over time?", answer: "Yes! Your dashboard shows your submission history, pass/fail results per exercise, and overall performance. Instructors have a dedicated analytics dashboard with charts showing student activity." }
  ];

  const techStack = [
    { name: 'React + Vite', icon: '⚛️', desc: 'Frontend framework' },
    { name: 'Node.js + Express', icon: '🟢', desc: 'Backend API' },
    { name: 'MySQL', icon: '🗄️', desc: 'Database' },
    { name: 'Judge0 CE', icon: '⚡', desc: 'Code execution engine' },
    { name: 'JWT Auth', icon: '🔐', desc: 'Secure authentication' },
    { name: 'Sequelize ORM', icon: '🔗', desc: 'Database modeling' },
    { name: 'Monaco Editor', icon: '📝', desc: 'VS Code-powered editor' },
    { name: 'Railway', icon: '🚀', desc: 'Cloud deployment' },
  ];

  const teamMembers = [
    { name: 'Raphael Nival', role: 'Developer', avatar: '👨‍💻' },
    { name: 'Gemalyn Bilos', role: 'Researcher', avatar: '👩‍💻' },
    { name: 'Jerome Hernaez', role: 'Developer', avatar: '👨‍💻' },
    { name: 'Hannah Goze', role: 'Researcher', avatar: '👩‍🎓' },
  ];

  const comparisonFeatures = [
    { feature: "Real-time Code Execution", codementor: true, generic: false },
    { feature: "Automated Test Cases", codementor: true, generic: true },
    { feature: "Multiple Languages Support", codementor: true, generic: true },
    { feature: "Instructor Analytics Dashboard", codementor: true, generic: false },
    { feature: "Progress Tracking", codementor: true, generic: true },
    { feature: "Admin User Management", codementor: true, generic: false },
    { feature: "Instructor Approval Flow", codementor: true, generic: false },
    { feature: "Instant Feedback", codementor: true, generic: true }
  ];

  const theme = {
    background: 'linear-gradient(135deg, #0f172a 0%, #1a2744 40%, #2a1a4e 100%)',
    cardBg: 'rgba(15, 23, 42, 0.6)',
    textPrimary: '#e2e8f0',
    textSecondary: 'rgba(226, 232, 240, 0.8)',
  };

  const LanguageIconsStrip = () => {
    const languages = [
      { name: 'Python', svg: (<svg viewBox="0 0 128 128" width="60" height="60"><linearGradient id="pyBlue" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#5A9FD4" /><stop offset="1" stopColor="#306998" /></linearGradient><linearGradient id="pyYellow" x1="209.474" y1="1098.811" x2="173.197" y2="1158.025" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFD43B" /><stop offset="1" stopColor="#FFE873" /></linearGradient><path fill="url(#pyBlue)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zm-13.354 7.569c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" /><path fill="url(#pyYellow)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" /></svg>) },
      { name: 'JavaScript', svg: (<svg viewBox="0 0 128 128" width="60" height="60"><path fill="#F0DB4F" d="M1.408 1.408h125.184v125.185H1.408z" /><path fill="#323330" d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z" /></svg>) },
      { name: 'Java', svg: (<svg viewBox="0 0 128 128" width="60" height="60"><path fill="#0074BD" d="M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zM44.629 84.455s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z" /><path fill="#EA2D2E" d="M69.802 61.271c6.025 6.929-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 .001-42.731 10.67-22.324 34.187z" /><path fill="#0074BD" d="M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zM90.609 93.041c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0-.002.359-.327.468-.617z" /><path fill="#EA2D2E" d="M76.491 1.587S89.459 14.563 64.188 34.51c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041 28.42 81.722 22.195 76.491 1.587z" /><path fill="#0074BD" d="M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z" /></svg>) },
      { name: 'C++', svg: (<svg viewBox="0 0 128 128" width="60" height="60"><path fill="#9C033A" d="M117.5 33.5l.3-.2c-.6-1.1-1.5-2.1-2.4-2.6L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.3.9 3.4l-.2.1c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c.1-.9-.1-1.9-.4-2.6z" /><path fill="#fff" d="M64 8.7l48 27.9v55.7l-48 27.9L16 92.3V36.6L64 8.7zm0 26.6c-15.9 0-28.8 12.9-28.8 28.8 0 15.9 12.9 28.8 28.8 28.8 7.6 0 14.5-2.9 19.7-7.8l-9.8-9.8c-2.5 2.3-5.8 3.7-9.9 3.7-8.2 0-14.8-6.7-14.8-14.9s6.6-14.9 14.8-14.9c4.1 0 7.5 1.5 10 3.8l9.8-9.8c-5.1-5-12.1-7.9-19.8-7.9zm33.1 23.5h-4.7v-4.7h-4.7v4.7h-4.7v4.7h4.7v4.7h4.7v-4.7h4.7zm14.8 0h-4.7v-4.7h-4.7v4.7h-4.7v4.7h4.7v4.7h4.7v-4.7h4.7z" /></svg>) },
      { name: 'C', svg: (<svg viewBox="0 0 128 128" width="60" height="60"><path fill="#03599C" d="M117.5 33.5l.3-.2c-.6-1.1-1.5-2.1-2.4-2.6L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.3.9 3.4l-.2.1c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c.1-.9-.1-1.9-.4-2.6z" /><path fill="#fff" d="M64 8.7l48 27.9v55.7l-48 27.9L16 92.3V36.6L64 8.7zm0 26.6c-15.9 0-28.8 12.9-28.8 28.8 0 15.9 12.9 28.8 28.8 28.8 7.6 0 14.5-2.9 19.7-7.8l-9.8-9.8c-2.5 2.3-5.8 3.7-9.9 3.7-8.2 0-14.8-6.7-14.8-14.9s6.6-14.9 14.8-14.9c4.1 0 7.5 1.5 10 3.8l9.8-9.8c-5.1-5-12.1-7.9-19.8-7.9z" /></svg>) },
    ];
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: isMobile ? '0 20px' : '0 40px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: isMobile ? '24px' : '36px', fontWeight: 'bold', color: theme.textPrimary, textAlign: 'center', marginBottom: '12px' }}>Supported Programming Languages</h2>
        <p style={{ textAlign: 'center', color: theme.textSecondary, fontSize: isMobile ? '14px' : '16px', marginBottom: '48px' }}>Write, compile, and run code in 5 languages — powered by real code execution</p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? '16px' : '32px', flexWrap: 'wrap' }}>
          {languages.map((lang) => (
            <div key={lang.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: isMobile ? '16px 20px' : '28px 36px', background: theme.cardBg, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', transition: 'all 0.3s ease', cursor: 'default', minWidth: isMobile ? '80px' : '130px' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-12px) scale(1.06)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.35)'; e.currentTarget.style.borderColor = 'rgba(251,191,36,0.5)'; e.currentTarget.style.background = 'rgba(251,191,36,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = theme.cardBg; }}>
              {lang.svg}
              <span style={{ fontSize: isMobile ? '12px' : '15px', fontWeight: '700', color: theme.textPrimary, letterSpacing: '0.3px' }}>{lang.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CodeEditorIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
      <rect x="8" y="12" width="48" height="40" rx="4" fill="rgba(251, 191, 36, 0.2)" stroke="#fbbf24" strokeWidth="2" />
      <line x1="8" y1="20" x2="56" y2="20" stroke="#fbbf24" strokeWidth="2" />
      <circle cx="14" cy="16" r="2" fill="#ff5f56"><animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" /></circle>
      <circle cx="20" cy="16" r="2" fill="#ffbd2e"><animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="0.3s" repeatCount="indefinite" /></circle>
      <circle cx="26" cy="16" r="2" fill="#27c93f"><animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="0.6s" repeatCount="indefinite" /></circle>
      <text x="14" y="32" fontFamily="monospace" fontSize="8" fill="#fbbf24">{'<code/>'}</text>
      <rect x="14" y="36" width="20" height="2" fill="#fbbf24" opacity="0.6"><animate attributeName="width" values="20;36;20" dur="3s" repeatCount="indefinite" /></rect>
      <rect x="14" y="42" width="30" height="2" fill="#fbbf24" opacity="0.6"><animate attributeName="width" values="30;24;30" dur="3s" begin="0.5s" repeatCount="indefinite" /></rect>
    </svg>
  );

  const LightningIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
      <path d="M32 8 L20 36 L32 36 L28 56 L44 28 L32 28 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"><animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" /></path>
      <circle cx="32" cy="32" r="24" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.3"><animate attributeName="r" values="24;28;24" dur="1.5s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" /></circle>
    </svg>
  );

  const TargetIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
      <circle cx="32" cy="32" r="28" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.3" />
      <circle cx="32" cy="32" r="20" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.5" />
      <circle cx="32" cy="32" r="12" fill="none" stroke="#fbbf24" strokeWidth="2" />
      <circle cx="32" cy="32" r="4" fill="#fbbf24"><animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" /></circle>
      <path d="M 48 16 L 32 32" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <polygon points="48,16 44,18 46,22" fill="#fbbf24"><animateTransform attributeName="transform" type="rotate" values="0 48 16; 360 48 16" dur="4s" repeatCount="indefinite" /></polygon>
    </svg>
  );

  const styles = {
    loadingScreen: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
    loadingLogo: { fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '24px', animation: 'pulse 1.5s ease-in-out infinite' },
    loadingSpinner: { width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid #fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    codeParticle: { position: 'absolute', color: 'rgba(251,191,36,0.15)', fontFamily: 'monospace', pointerEvents: 'none', whiteSpace: 'nowrap', animation: 'floatDown 20s linear infinite' },
    progressBar: { position: 'fixed', top: 0, left: 0, height: '4px', background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', zIndex: 9999, transition: 'width 0.3s ease', width: `${scrollProgress}%` },
    mouseTrailDot: { position: 'fixed', width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(251,191,36,0.5)', pointerEvents: 'none', zIndex: 9998, transition: 'all 0.3s ease' },
    backToTop: { position: 'fixed', bottom: '40px', right: '40px', width: '56px', height: '56px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 24px rgba(251,191,36,0.4)', zIndex: 1000, border: 'none', transition: 'all 0.3s ease', opacity: showBackToTop ? 1 : 0, pointerEvents: showBackToTop ? 'auto' : 'none', transform: showBackToTop ? 'scale(1)' : 'scale(0.8)' },
    container: { minHeight: '100vh', background: theme.background, color: theme.textPrimary, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', position: 'relative', overflowX: 'hidden', transition: 'background 0.5s ease' },
    orb1: { position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 20s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 },
    orb2: { position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 25s ease-in-out infinite reverse', pointerEvents: 'none', zIndex: 0 },
    orb3: { position: 'absolute', top: '50%', left: '50%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 30s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 },
    sectionDivider: { height: '2px', background: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.5) 50%, transparent 100%)', margin: isMobile ? '40px auto' : '80px auto', maxWidth: '1200px' },
    nav: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: isMobile ? '0 16px' : '0 20px', position: 'sticky', top: 0, zIndex: 100 },
    navContainer: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' },
    logo: { fontSize: isMobile ? '18px' : '28px', fontWeight: 'bold', color: theme.textPrimary, textShadow: '2px 2px 4px rgba(0,0,0,0.3)', cursor: 'pointer' },
    navLinks: { display: 'flex', gap: '32px', marginRight: 'auto', marginLeft: '48px' },
    navLink: { color: theme.textSecondary, fontSize: '16px', cursor: 'pointer', transition: 'color 0.3s', fontWeight: '500' },
    navButtons: { display: 'flex', gap: '16px' },
    signInBtn: { padding: '12px 28px', fontSize: '16px', fontWeight: '600', color: theme.textPrimary, background: 'transparent', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease' },
    getStartedBtn: { padding: '12px 28px', fontSize: '16px', fontWeight: '600', color: '#1e293b', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease', animation: 'pulse 2s ease-in-out infinite' },
    hero: { maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '60px 20px 40px' : '100px 40px 60px', textAlign: 'center', position: 'relative', zIndex: 1 },
    heroWrapper: { position: 'relative', zIndex: 1, overflow: 'visible' },
    title: { fontSize: isMobile ? '36px' : '64px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '16px', textShadow: '2px 2px 8px rgba(0,0,0,0.3)', minHeight: isMobile ? '48px' : '80px' },
    titleHighlight: { fontSize: isMobile ? '32px' : '64px', fontWeight: 'bold', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'block', marginTop: '8px', textShadow: 'none' },
    subtitle: { fontSize: isMobile ? '15px' : '20px', color: theme.textSecondary, maxWidth: '750px', margin: '24px auto 48px', lineHeight: '1.7' },
    heroButtons: { display: 'flex', justifyContent: 'center', gap: isMobile ? '12px' : '20px', flexWrap: 'wrap', marginBottom: '48px' },
    primaryBtn: { padding: isMobile ? '14px 28px' : '18px 40px', fontSize: isMobile ? '15px' : '18px', fontWeight: '600', color: '#1e293b', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease', animation: 'pulse 2s ease-in-out infinite' },
    secondaryBtn: { padding: isMobile ? '14px 28px' : '18px 40px', fontSize: isMobile ? '15px' : '18px', fontWeight: '600', color: theme.textPrimary, background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '12px', cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease' },
    techBadgesContainer: { display: 'flex', gap: isMobile ? '8px' : '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' },
    techBadge: { padding: isMobile ? '6px 14px' : '8px 20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '20px', color: '#fbbf24', fontSize: isMobile ? '12px' : '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' },
    techBadgeActive: { background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#1e293b', transform: 'scale(1.1)' },
    languagePopup: { position: 'absolute', top: '120%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(251,191,36,0.5)', whiteSpace: 'nowrap', fontSize: '13px', color: 'rgba(255,255,255,0.85)', zIndex: 10 },
    statsSection: { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: isMobile ? '12px' : '24px', marginBottom: '80px' },
    statCard: { padding: isMobile ? '20px 12px' : '32px 24px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', textAlign: 'center', transition: 'all 0.3s ease' },
    statIcon: { fontSize: isMobile ? '32px' : '48px', marginBottom: '12px' },
    statNumber: { fontSize: isMobile ? '28px' : '36px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '8px' },
    statLabel: { fontSize: isMobile ? '12px' : '16px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
    features: { maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 20px 60px' : '0 40px 80px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: isMobile ? '20px' : '32px', position: 'relative', zIndex: 1 },
    featureCard: { padding: isMobile ? '28px 20px' : '40px 32px', background: theme.cardBg, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', textAlign: 'center', cursor: 'default', transition: 'all 0.3s ease', animation: 'floatCard 3s ease-in-out infinite' },
    featureIcon: { marginBottom: '20px', display: 'flex', justifyContent: 'center' },
    featureTitle: { fontSize: isMobile ? '18px' : '24px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '16px' },
    featureDesc: { fontSize: isMobile ? '14px' : '16px', color: theme.textSecondary, lineHeight: '1.6' },
    sectionTitle: { fontSize: isMobile ? '28px' : '42px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '48px', textAlign: 'center' },
    sectionSubtitle: { fontSize: isMobile ? '14px' : '17px', color: theme.textSecondary, textAlign: 'center', marginTop: '-32px', marginBottom: '48px' },
    techStackSection: { maxWidth: '1200px', margin: '0 auto 80px', padding: isMobile ? '0 20px' : '0 40px', position: 'relative', zIndex: 1 },
    techStackGrid: { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
    techStackCard: { padding: isMobile ? '16px' : '24px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', textAlign: 'center', transition: 'all 0.3s ease' },
    techStackIcon: { fontSize: isMobile ? '28px' : '36px', marginBottom: '12px' },
    techStackName: { fontSize: isMobile ? '13px' : '16px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '6px' },
    techStackDesc: { fontSize: isMobile ? '11px' : '13px', color: theme.textSecondary },
    teamSection: { maxWidth: '1200px', margin: '0 auto 80px', padding: isMobile ? '0 20px' : '0 40px', position: 'relative', zIndex: 1 },
    teamGrid: { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: isMobile ? '16px' : '24px' },
    teamCard: { padding: isMobile ? '20px 16px' : '32px 24px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', textAlign: 'center', transition: 'all 0.3s ease' },
    teamAvatar: { fontSize: isMobile ? '36px' : '52px', marginBottom: '16px' },
    teamName: { fontSize: isMobile ? '14px' : '17px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '6px' },
    teamRole: { fontSize: isMobile ? '12px' : '13px', color: '#fbbf24', fontWeight: '600' },
    comparisonSection: { maxWidth: '1200px', margin: '0 auto 80px', padding: isMobile ? '0 20px' : '0 40px', position: 'relative', zIndex: 1 },
    comparisonTable: { width: '100%', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden' },
    comparisonHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: isMobile ? '12px 16px' : '20px', background: 'rgba(251,191,36,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold', fontSize: isMobile ? '13px' : '18px' },
    comparisonRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: isMobile ? '10px 16px' : '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s ease', fontSize: isMobile ? '12px' : '16px' },
    checkmark: { color: '#10b981', fontSize: isMobile ? '18px' : '24px' },
    cross: { color: '#ef4444', fontSize: isMobile ? '18px' : '24px' },
    faqSection: { maxWidth: '1200px', margin: '0 auto 80px', padding: isMobile ? '0 20px' : '0 40px', position: 'relative', zIndex: 1 },
    faqItem: { marginBottom: '16px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.3s ease' },
    faqQuestion: { padding: isMobile ? '14px 16px' : '20px 24px', fontSize: isMobile ? '14px' : '18px', fontWeight: '600', color: theme.textPrimary, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s ease' },
    faqAnswer: { padding: isMobile ? '0 16px 14px' : '0 24px 20px', fontSize: isMobile ? '13px' : '16px', color: theme.textSecondary, lineHeight: '1.7' },
    platformPreview: { maxWidth: '1200px', margin: '0 auto 80px', padding: isMobile ? '30px 20px' : '60px 40px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', position: 'relative', zIndex: 1 },
    platformTitle: { fontSize: isMobile ? '24px' : '42px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '16px', textAlign: 'center' },
    platformSubtitle: { fontSize: isMobile ? '14px' : '18px', color: theme.textSecondary, textAlign: 'center', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' },
    codeEditorContainer: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' },
    codeEditor: { width: '100%', minHeight: isMobile ? '280px' : '400px', background: 'rgba(15,23,42,0.9)', borderRadius: '16px', border: '2px solid rgba(251,191,36,0.3)', position: 'relative', overflow: 'hidden', fontFamily: 'monospace' },
    editorHeader: { height: '40px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
    editorHeaderLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
    editorDot: { width: '12px', height: '12px', borderRadius: '50%' },
    runButton: { padding: '6px 16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '12px', fontWeight: '600', cursor: isRunning ? 'not-allowed' : 'pointer', opacity: isRunning ? 0.6 : 1, transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '6px' },
    editorContent: { padding: isMobile ? '12px' : '24px', fontSize: isMobile ? '12px' : '16px', lineHeight: '1.8', color: '#e2e8f0', maxHeight: isMobile ? '240px' : '360px', overflowY: 'auto' },
    codeLine: { display: 'flex', gap: '24px' },
    lineNumber: { color: 'rgba(255,255,255,0.3)', userSelect: 'none', minWidth: '30px', textAlign: 'right' },
    codeContent: { flex: 1 },
    outputPanel: { width: '100%', minHeight: isMobile ? '200px' : '400px', background: 'rgba(15,23,42,0.9)', borderRadius: '16px', border: '2px solid rgba(59,130,246,0.3)', position: 'relative', overflow: 'hidden', fontFamily: 'monospace' },
    outputHeader: { height: '40px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#60a5fa', fontSize: '14px', fontWeight: '600' },
    outputContent: { padding: isMobile ? '12px' : '24px', fontSize: '14px', lineHeight: '1.8', color: '#e2e8f0' },
    outputStage: { marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
    spinner: { width: '16px', height: '16px', border: '2px solid rgba(251,191,36,0.3)', borderTop: '2px solid #fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    outputResult: { marginTop: '16px', padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10b981', fontSize: '16px', fontWeight: '600' },
    testCase: { marginBottom: '8px', padding: '8px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', animation: 'slideIn 0.3s ease-out' },
    scoreDisplay: { marginTop: '16px', padding: '16px', background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.2) 100%)', border: '2px solid rgba(251,191,36,0.5)', borderRadius: '12px', textAlign: 'center', fontSize: isMobile ? '16px' : '24px', fontWeight: 'bold', color: '#fbbf24', animation: 'scaleIn 0.5s ease-out' },
    testimonialSection: { maxWidth: '1200px', margin: '0 auto 80px', padding: isMobile ? '0 20px' : '0 40px', position: 'relative', zIndex: 1 },
    testimonialCard: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: isMobile ? '32px 20px' : '60px 40px', textAlign: 'center', minHeight: isMobile ? '200px' : '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
    testimonialAvatar: { fontSize: isMobile ? '40px' : '64px', marginBottom: '24px' },
    testimonialText: { fontSize: isMobile ? '14px' : '20px', lineHeight: '1.6', color: theme.textSecondary, marginBottom: '24px', maxWidth: '700px', fontStyle: 'italic' },
    testimonialName: { fontSize: isMobile ? '15px' : '18px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '4px' },
    testimonialRole: { fontSize: isMobile ? '12px' : '14px', color: 'rgba(255,255,255,0.6)' },
    testimonialDots: { display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px' },
    testimonialDot: { width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.3s ease' },
    testimonialDotActive: { background: '#fbbf24', transform: 'scale(1.2)' },
    howItWorks: { maxWidth: '1200px', margin: '0 auto 80px', padding: isMobile ? '0 20px' : '0 40px', position: 'relative', zIndex: 1 },
    stepsGrid: { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: isMobile ? '24px' : '32px' },
    step: { textAlign: 'center' },
    stepNumber: { width: isMobile ? '56px' : '80px', height: isMobile ? '56px' : '80px', margin: '0 auto 24px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '22px' : '32px', fontWeight: 'bold', color: '#1e293b', boxShadow: '0 8px 24px rgba(251,191,36,0.3)' },
    stepTitle: { fontSize: isMobile ? '16px' : '24px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '12px' },
    stepDesc: { fontSize: isMobile ? '13px' : '16px', color: theme.textSecondary, lineHeight: '1.6' },
    finalCTA: { maxWidth: '1200px', margin: '0 auto 80px', padding: isMobile ? '40px 20px' : '60px 40px', background: 'rgba(251,191,36,0.1)', backdropFilter: 'blur(10px)', border: '2px solid rgba(251,191,36,0.3)', borderRadius: '24px', textAlign: 'center', position: 'relative', zIndex: 1 },
    finalCTATitle: { fontSize: isMobile ? '28px' : '42px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '16px' },
    finalCTASubtitle: { fontSize: isMobile ? '14px' : '18px', color: theme.textSecondary, marginBottom: '32px' },
    footer: { padding: isMobile ? '32px 20px' : '40px 80px', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 1 },
    footerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', gap: '20px', textAlign: isMobile ? 'center' : 'left' },
    footerBrand: { fontSize: isMobile ? '18px' : '24px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '8px' },
    footerText: { fontSize: '14px', color: 'rgba(255,255,255,0.6)' },
    footerLinks: { display: 'flex', gap: isMobile ? '16px' : '32px', color: theme.textSecondary, fontSize: '14px', flexWrap: 'wrap', justifyContent: 'center' },
    footerLink: { cursor: 'pointer', transition: 'color 0.2s' },
  };

  if (loading) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #0f172a 0%, #1a2744 40%, #2a1a4e 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes goldPulse { 0%, 100% { filter: drop-shadow(0 0 6px rgba(251,191,36,0.4)); } 50% { filter: drop-shadow(0 0 18px rgba(251,191,36,0.9)); } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fillBar { from { width: 0%; } to { width: 100%; } }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
          @keyframes termLine { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes orbFloat { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.15); opacity: 1; } }
        `}</style>

        {/* Background glow orb */}
        <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', animation: 'orbFloat 3s ease-in-out infinite' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', animation: 'fadeInUp 0.7s ease-out forwards', zIndex: 1 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ animation: 'goldPulse 2s ease-in-out infinite', flexShrink: 0 }}>
            <path d="M8 5 L3 12 L8 19" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 5 L21 12 L16 19" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="8" x2="12" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div style={{ fontSize: '38px', fontWeight: 'bold', color: 'white', letterSpacing: '-0.5px' }}>
            CodeMentor<span style={{ color: '#FBBF24' }}> + Pro</span>
          </div>
        </div>

        {/* Terminal lines */}
        <div style={{ marginBottom: '36px', zIndex: 1, animation: 'fadeInUp 0.7s ease-out 0.2s both' }}>
          {[
            { text: '> Initializing workspace...', delay: '0.4s', color: 'rgba(255,255,255,0.5)' },
            { text: '> Loading code execution engine...', delay: '0.8s', color: 'rgba(255,255,255,0.5)' },
            { text: '> Ready.', delay: '1.2s', color: '#FBBF24' },
          ].map((line, i) => (
            <div key={i} style={{ fontFamily: 'monospace', fontSize: '13px', color: line.color, marginBottom: '6px', opacity: 0, animation: `termLine 0.4s ease-out ${line.delay} forwards`, letterSpacing: '0.3px' }}>
              {line.text}{i === 2 && <span style={{ animation: 'blink 1s infinite', marginLeft: '2px' }}>▊</span>}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ width: '280px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', zIndex: 1 }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', borderRadius: '2px', animation: 'fillBar 2s cubic-bezier(0.4, 0, 0.2, 1) forwards', boxShadow: '0 0 8px rgba(251,191,36,0.6)' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes heroIconFloat { 0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); } 50% { transform: translateY(-18px) rotate(var(--r, 0deg)); } }
        @keyframes logoFadeIn { 0% { opacity: 0; transform: translateY(-8px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translate(0,0) scale(1); } 25% { transform: translate(30px,-30px) scale(1.05); } 50% { transform: translate(-20px,20px) scale(0.95); } 75% { transform: translate(20px,30px) scale(1.02); } }
        @keyframes floatCard { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes floatDown { 0% { transform: translateY(-100px); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.7); } 50% { box-shadow: 0 0 0 10px rgba(251,191,36,0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes mobileMenuSlide { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .reveal-section { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal-section.revealed { opacity: 1; transform: translateY(0); }
        .feature-card:nth-child(1) { animation-delay: 0s !important; }
        .feature-card:nth-child(2) { animation-delay: 0.5s !important; }
        .feature-card:nth-child(3) { animation-delay: 1s !important; }
        .hamburger-btn { background: none; border: none; cursor: pointer; padding: 8px; display: flex; flex-direction: column; gap: 5px; }
        .hamburger-btn span { display: block; width: 24px; height: 2px; background: #e2e8f0; border-radius: 2px; transition: all 0.3s ease; }
        .mobile-menu { position: absolute; top: 64px; left: 0; right: 0; background: rgba(15,23,42,0.98); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 16px; z-index: 99; animation: mobileMenuSlide 0.25s ease-out; }
        .mobile-menu-link { display: block; padding: 14px 16px; color: rgba(226,232,240,0.8); font-size: 16px; font-weight: 500; cursor: pointer; border-radius: 10px; transition: all 0.2s; }
        .mobile-menu-link:hover { color: #fbbf24; background: rgba(251,191,36,0.08); }
        .mobile-menu-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 8px 0; }
        .mobile-menu-btn { display: block; width: 100%; padding: 14px 16px; margin-top: 8px; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; text-align: center; border: none; transition: all 0.2s; }
      `}</style>

      <div style={styles.progressBar} />

      {!isMobile && codeParticles.map((particle) => (
        <div key={particle.id} style={{ ...styles.codeParticle, left: `${particle.left}%`, fontSize: `${particle.fontSize}px`, opacity: particle.opacity, animationDuration: `${particle.animationDuration}s`, animationDelay: `${particle.animationDelay}s` }}>
          {particle.text}
        </div>
      ))}

      {!isMobile && mouseTrail.map((dot, index) => (
        <div key={dot.id} style={{ ...styles.mouseTrailDot, left: `${dot.x}px`, top: `${dot.y}px`, opacity: (index + 1) / mouseTrail.length, transform: `scale(${(index + 1) / mouseTrail.length})` }} />
      ))}

      <button style={styles.backToTop} onClick={scrollToTop}
        onMouseEnter={(e) => { e.target.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}>
        <span style={{ fontSize: '24px', color: '#1e293b' }}>↑</span>
      </button>

      <div className="parallax-orb" style={styles.orb1} />
      <div className="parallax-orb" style={styles.orb2} />
      <div className="parallax-orb" style={styles.orb3} />

      {/* Navigation */}
      <nav style={{ ...styles.nav, position: 'sticky' }}>
        <div style={styles.navContainer}>
          <div onClick={scrollToTop} style={{ ...styles.logo, display: 'flex', alignItems: 'center', gap: '10px', opacity: logoVisible ? 1 : 0, animation: logoVisible ? 'logoFadeIn 0.7s ease-out forwards' : 'none' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.4))', flexShrink: 0 }}>
              <path d="M8 5 L3 12 L8 19" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 5 L21 12 L16 19" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="8" x2="12" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>CodeMentor<span style={{ color: '#FBBF24' }}> + Pro</span></span>
          </div>

          {!isMobile && (
            <div style={styles.navLinks}>
              {[{ label: 'Features', id: 'features' }, { label: 'How It Works', id: 'how-it-works' }, { label: 'Team', id: 'team' }, { label: 'Testimonials', id: 'testimonials' }].map((link) => (
                <span key={link.id} style={styles.navLink} onClick={() => scrollToSection(link.id)}
                  onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
                  onMouseLeave={(e) => e.target.style.color = theme.textSecondary}>
                  {link.label}
                </span>
              ))}
            </div>
          )}

          {!isMobile && (
            <div style={styles.navButtons}>
              <button style={styles.signInBtn} onClick={() => navigate('/login')}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = 'rgba(255,255,255,0.5)'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.transform = 'translateY(0)'; }}>
                Sign In
              </button>
              <button style={styles.getStartedBtn} onClick={() => navigate('/register')}
                onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.animation = 'none'; }}
                onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.animation = 'pulse 2s ease-in-out infinite'; }}>
                Get Started
              </button>
            </div>
          )}

          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#1e293b', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => navigate('/register')}>
                Get Started
              </button>
              <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <span style={{ transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
                <span style={{ opacity: mobileMenuOpen ? 0 : 1 }} />
                <span style={{ transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
              </button>
            </div>
          )}
        </div>

        {isMobile && mobileMenuOpen && (
          <div className="mobile-menu">
            {[{ label: 'Features', id: 'features' }, { label: 'How It Works', id: 'how-it-works' }, { label: 'Team', id: 'team' }, { label: 'Testimonials', id: 'testimonials' }].map((link) => (
              <span key={link.id} className="mobile-menu-link" onClick={() => scrollToSection(link.id)}>{link.label}</span>
            ))}
            <div className="mobile-menu-divider" />
            <button className="mobile-menu-btn" style={{ color: theme.textPrimary, background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)', marginBottom: '8px' }}
              onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
              Sign In
            </button>
          </div>
        )}
      </nav>

      {/* Hero wrapper */}
      <div style={styles.heroWrapper} id="home">
        {!isMobile && [
          { svg: <svg viewBox="0 0 128 128" width="64" height="64"><linearGradient id="hpyB" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#5A9FD4" /><stop offset="1" stopColor="#306998" /></linearGradient><linearGradient id="hpyY" x1="209.474" y1="1098.811" x2="173.197" y2="1158.025" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFD43B" /><stop offset="1" stopColor="#FFE873" /></linearGradient><path fill="url(#hpyB)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zm-13.354 7.569c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" /><path fill="url(#hpyY)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" /></svg>, top: '80px', left: '13%', rotate: '-12deg', delay: '0s', duration: '6s' },
          { svg: <svg viewBox="0 0 128 128" width="60" height="60"><path fill="#9C033A" d="M117.5 33.5l.3-.2c-.6-1.1-1.5-2.1-2.4-2.6L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.3.9 3.4l-.2.1c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c.1-.9-.1-1.9-.4-2.6z" /><path fill="#fff" d="M64 8.7l48 27.9v55.7l-48 27.9L16 92.3V36.6L64 8.7zm0 26.6c-15.9 0-28.8 12.9-28.8 28.8 0 15.9 12.9 28.8 28.8 28.8 7.6 0 14.5-2.9 19.7-7.8l-9.8-9.8c-2.5 2.3-5.8 3.7-9.9 3.7-8.2 0-14.8-6.7-14.8-14.9s6.6-14.9 14.8-14.9c4.1 0 7.5 1.5 10 3.8l9.8-9.8c-5.1-5-12.1-7.9-19.8-7.9zm33.1 23.5h-4.7v-4.7h-4.7v4.7h-4.7v4.7h4.7v4.7h4.7v-4.7h4.7zm14.8 0h-4.7v-4.7h-4.7v4.7h-4.7v4.7h4.7v4.7h4.7v-4.7h4.7z" /></svg>, top: '290px', left: '11%', rotate: '8deg', delay: '1.5s', duration: '7s' },
          { svg: <svg viewBox="0 0 128 128" width="56" height="56"><path fill="#03599C" d="M117.5 33.5l.3-.2c-.6-1.1-1.5-2.1-2.4-2.6L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.3.9 3.4l-.2.1c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c.1-.9-.1-1.9-.4-2.6z" /><path fill="#fff" d="M64 8.7l48 27.9v55.7l-48 27.9L16 92.3V36.6L64 8.7zm0 26.6c-15.9 0-28.8 12.9-28.8 28.8 0 15.9 12.9 28.8 28.8 28.8 7.6 0 14.5-2.9 19.7-7.8l-9.8-9.8c-2.5 2.3-5.8 3.7-9.9 3.7-8.2 0-14.8-6.7-14.8-14.9s6.6-14.9 14.8-14.9c4.1 0 7.5 1.5 10 3.8l9.8-9.8c-5.1-5-12.1-7.9-19.8-7.9z" /></svg>, top: '480px', left: '13%', rotate: '-6deg', delay: '0.8s', duration: '8s' },
        ].map((item, i) => (
          <div key={`left-${i}`} style={{ position: 'absolute', left: item.left, top: item.top, transform: `rotate(${item.rotate})`, animation: `heroIconFloat ${item.duration} ease-in-out infinite`, animationDelay: item.delay, background: 'transparent', border: 'none', boxShadow: 'none', zIndex: 2, pointerEvents: 'none' }}>
            {item.svg}
          </div>
        ))}

        {!isMobile && [
          { svg: <svg viewBox="0 0 128 128" width="64" height="64"><path fill="#F0DB4F" d="M1.408 1.408h125.184v125.185H1.408z" /><path fill="#323330" d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z" /></svg>, top: '70px', right: '13%', rotate: '10deg', delay: '0.4s', duration: '7s' },
          { svg: <svg viewBox="0 0 128 128" width="62" height="62"><path fill="#0074BD" d="M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zM44.629 84.455s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z" /><path fill="#EA2D2E" d="M69.802 61.271c6.025 6.929-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 .001-42.731 10.67-22.324 34.187z" /><path fill="#0074BD" d="M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zM90.609 93.041c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0-.002.359-.327.468-.617z" /><path fill="#EA2D2E" d="M76.491 1.587S89.459 14.563 64.188 34.51c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041 28.42 81.722 22.195 76.491 1.587z" /><path fill="#0074BD" d="M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z" /></svg>, top: '290px', right: '11%', rotate: '-8deg', delay: '2s', duration: '6.5s' },
          { svg: <svg viewBox="0 0 128 128" width="56" height="56"><linearGradient id="hpyB2" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#5A9FD4" /><stop offset="1" stopColor="#306998" /></linearGradient><linearGradient id="hpyY2" x1="209.474" y1="1098.811" x2="173.197" y2="1158.025" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFD43B" /><stop offset="1" stopColor="#FFE873" /></linearGradient><path fill="url(#hpyB2)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zm-13.354 7.569c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" /><path fill="url(#hpyY2)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" /></svg>, top: '490px', right: '13%', rotate: '14deg', delay: '1s', duration: '7.5s' },
        ].map((item, i) => (
          <div key={`right-${i}`} style={{ position: 'absolute', right: item.right, top: item.top, transform: `rotate(${item.rotate})`, animation: `heroIconFloat ${item.duration} ease-in-out infinite`, animationDelay: item.delay, background: 'transparent', border: 'none', boxShadow: 'none', zIndex: 2, pointerEvents: 'none' }}>
            {item.svg}
          </div>
        ))}

        <div style={styles.hero}>
          <h1 style={styles.title}>{typedText}<span style={{ animation: 'blink 1s infinite' }}>|</span></h1>
          <h2 style={styles.titleHighlight}>One Challenge at a Time</h2>
          <p style={styles.subtitle}>An intelligent learning management and adaptive programming assessment system. Write code, submit solutions, and receive instant automated feedback — powered by real code execution.</p>
          <div style={styles.heroButtons}>
            <button style={styles.primaryBtn} onClick={() => navigate('/register')}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px) scale(1.05)'; e.target.style.animation = 'none'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.animation = 'pulse 2s ease-in-out infinite'; }}>
              Start Learning Free →
            </button>
            <button style={styles.secondaryBtn} onClick={() => scrollToSection('features')}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Explore Features ↓
            </button>
          </div>
          <div style={styles.techBadgesContainer}>
            {Object.keys(languageInfo).map((lang) => (
              <div key={lang} style={{ ...styles.techBadge, ...(selectedLanguage === lang ? styles.techBadgeActive : {}) }}
                onClick={() => setSelectedLanguage(selectedLanguage === lang ? null : lang)}
                onMouseEnter={(e) => { if (selectedLanguage !== lang) { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(251,191,36,0.3)'; } }}
                onMouseLeave={(e) => { if (selectedLanguage !== lang) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; } }}>
                {lang}
                {selectedLanguage === lang && <div style={styles.languagePopup}>{languageInfo[lang]}</div>}
              </div>
            ))}
          </div>
          <div style={styles.statsSection}>
            {[
              { label: 'Supported Languages', value: '5', icon: '💻', suffix: '' },
              { label: 'User Roles', value: '3', icon: '👥', suffix: '' },
              { label: 'Real Code Execution', value: '100', icon: '⚡', suffix: '%' },
              { label: 'Success Rate', value: liveStats.successRate !== null ? liveStats.successRate : '...', icon: '🎯', suffix: liveStats.successRate !== null ? '%' : '' },
            ].map((stat) => (
              <div key={stat.label} style={styles.statCard}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={styles.statIcon}>{stat.icon}</div>
                <div style={styles.statNumber}>{stat.value}{stat.suffix}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.sectionDivider} />
      <div className="reveal-section"><LanguageIconsStrip /></div>
      <div style={styles.sectionDivider} />

      {/* Features */}
      <div className="reveal-section" style={styles.features} id="features">
        {[
          { component: <CodeEditorIcon />, title: 'Monaco Code Editor', description: 'Write code in a VS Code-powered editor with syntax highlighting, auto-indent, and support for all 5 programming languages.' },
          { component: <LightningIcon />, title: 'Instant Automated Grading', description: 'Submissions are compiled and executed via Judge0 CE. Each test case is evaluated in real time — no manual checking needed.' },
          { component: <TargetIcon />, title: 'Role-Based Dashboards', description: 'Students track their submissions and scores. Instructors manage exercises and view analytics. Admins oversee all users.' }
        ].map((feature, index) => (
          <div key={feature.title} className="feature-card" style={{ ...styles.featureCard, animationDelay: `${index * 0.5}s` }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-15px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)'; e.currentTarget.style.animation = 'none'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.animation = 'floatCard 3s ease-in-out infinite'; }}>
            <div style={styles.featureIcon}>{feature.component}</div>
            <h3 style={styles.featureTitle}>{feature.title}</h3>
            <p style={styles.featureDesc}>{feature.description}</p>
          </div>
        ))}
      </div>

      <div style={styles.sectionDivider} />

      {/* How It Works */}
      <div className="reveal-section" style={styles.howItWorks} id="how-it-works">
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.stepsGrid}>
          {[
            { step: '1', title: 'Register & Log In', description: 'Create an account as a student or instructor. Instructor accounts require admin approval before access is granted.' },
            { step: '2', title: 'Browse Exercises', description: 'View all available coding exercises, each with a problem description, difficulty level, and supported language.' },
            { step: '3', title: 'Write & Submit Code', description: 'Use the built-in Monaco editor to write your solution and submit it for automated grading.' },
            { step: '4', title: 'Get Instant Results', description: 'Your code runs against test cases in real time. See which tests pass, which fail, and track your improvement.' },
          ].map((s) => (
            <div key={s.step} style={styles.step}>
              <div style={styles.stepNumber}>{s.step}</div>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepDesc}>{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.sectionDivider} />

      {/* Live Code Demo */}
      <div className="reveal-section" style={styles.platformPreview}>
        <h2 style={styles.platformTitle}>Live Code Execution Demo</h2>
        <p style={styles.platformSubtitle}>See how the platform runs your code and evaluates it against test cases in real time.</p>
        <div style={styles.codeEditorContainer}>
          <div style={styles.codeEditor}>
            <div style={styles.editorHeader}>
              <div style={styles.editorHeaderLeft}>
                <div style={{ ...styles.editorDot, background: '#ff5f56' }} />
                <div style={{ ...styles.editorDot, background: '#ffbd2e' }} />
                <div style={{ ...styles.editorDot, background: '#27c93f' }} />
                <span style={{ marginLeft: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>fibonacci.py</span>
              </div>
              <button style={styles.runButton} onClick={handleRunCode} disabled={isRunning}
                onMouseEnter={(e) => { if (!isRunning) { e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)'; e.target.style.transform = 'scale(1.05)'; } }}
                onMouseLeave={(e) => { if (!isRunning) { e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'; e.target.style.transform = 'scale(1)'; } }}>
                <span>▶</span>{isRunning ? 'Running...' : 'Run Code'}
              </button>
            </div>
            <div style={styles.editorContent}>
              {codeText.split('\n').map((line, index) => (
                <div key={index} style={styles.codeLine}>
                  <span style={styles.lineNumber}>{index + 1}</span>
                  <span style={styles.codeContent}>
                    {line.includes('def') || line.includes('if') || line.includes('return') ? <span style={{ color: '#c678dd' }}>{line}</span>
                      : line.includes('print') ? <span style={{ color: '#61afef' }}>{line}</span>
                        : line.includes('fibonacci') ? <span style={{ color: '#e5c07b' }}>{line}</span>
                          : <span>{line}</span>}
                  </span>
                </div>
              ))}
              <span style={{ color: '#fbbf24', animation: 'blink 1s infinite', fontSize: '18px' }}>▊</span>
            </div>
          </div>
          <div style={styles.outputPanel}>
            <div style={styles.outputHeader}>OUTPUT</div>
            <div style={styles.outputContent}>
              {executionStage === 'idle' && <div style={{ color: 'rgba(255,255,255,0.5)' }}>Click "Run Code" to execute...</div>}
              {executionStage === 'compiling' && <div style={styles.outputStage}><div style={styles.spinner} /><span style={{ color: '#fbbf24' }}>Compiling code...</span></div>}
              {(executionStage === 'running' || executionStage === 'completed') && (
                <>
                  <div style={styles.outputStage}>
                    {executionStage === 'running' ? <><div style={styles.spinner} /><span style={{ color: '#fbbf24' }}>Running tests...</span></> : <span style={{ color: '#10b981' }}>✓ Execution complete</span>}
                  </div>
                  {outputText && <div style={styles.outputResult}>Output: {outputText}</div>}
                  {testResults.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '12px', fontWeight: '600' }}>Test Results:</div>
                      {testResults.map((test) => (
                        <div key={test.id} style={styles.testCase}>
                          <span style={{ color: '#10b981', fontSize: '18px' }}>✓</span>
                          <span style={{ color: '#10b981' }}>{test.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {executionStage === 'completed' && <div style={styles.scoreDisplay}>🎉 Score: 3/3 Test Cases Passed</div>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.sectionDivider} />

      {/* Tech Stack */}
      <div className="reveal-section" style={styles.techStackSection}>
        <h2 style={styles.sectionTitle}>Built With Modern Technology</h2>
        <p style={styles.sectionSubtitle}>A full-stack web application using industry-standard tools and frameworks</p>
        <div style={styles.techStackGrid}>
          {techStack.map((tech) => (
            <div key={tech.name} style={styles.techStackCard}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.background = 'rgba(251,191,36,0.08)'; e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
              <div style={styles.techStackIcon}>{tech.icon}</div>
              <div style={styles.techStackName}>{tech.name}</div>
              <div style={styles.techStackDesc}>{tech.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.sectionDivider} />

      {/* Comparison */}
      <div className="reveal-section" style={styles.comparisonSection}>
        <h2 style={styles.sectionTitle}>Why CodeMentor<span style={{ color: '#FBBF24' }}> + Pro</span>?</h2>
        <div style={styles.comparisonTable}>
          <div style={styles.comparisonHeader}>
            <div>Feature</div>
            <div style={{ textAlign: 'center' }}>CodeMentor<span style={{ color: '#FBBF24' }}> + Pro</span></div>
            <div style={{ textAlign: 'center' }}>Generic Platforms</div>
          </div>
          {comparisonFeatures.map((item, index) => (
            <div key={index} style={styles.comparisonRow}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251,191,36,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              <div>{item.feature}</div>
              <div style={{ textAlign: 'center' }}>{item.codementor ? <span style={styles.checkmark}>✓</span> : <span style={styles.cross}>✗</span>}</div>
              <div style={{ textAlign: 'center' }}>{item.generic ? <span style={styles.checkmark}>✓</span> : <span style={styles.cross}>✗</span>}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.sectionDivider} />

      {/* FAQ */}
      <div className="reveal-section" style={styles.faqSection}>
        <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
        {faqs.map((faq, index) => (
          <div key={index} style={styles.faqItem}>
            <div style={styles.faqQuestion}
              onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251,191,36,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              <span>{faq.question}</span>
              <span style={{ fontSize: '24px', transition: 'transform 0.3s', transform: openFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0, marginLeft: '12px' }}>▼</span>
            </div>
            {openFAQ === index && <div style={styles.faqAnswer}>{faq.answer}</div>}
          </div>
        ))}
      </div>

      <div style={styles.sectionDivider} />

      {/* Testimonials */}
      <div className="reveal-section" style={styles.testimonialSection} id="testimonials">
        <h2 style={styles.sectionTitle}>What Students Say</h2>
        <div style={styles.testimonialCard}>
          <div style={styles.testimonialAvatar}>{testimonials[currentTestimonial].avatar}</div>
          <p style={styles.testimonialText}>"{testimonials[currentTestimonial].text}"</p>
          <div style={styles.testimonialName}>{testimonials[currentTestimonial].name}</div>
          <div style={styles.testimonialRole}>{testimonials[currentTestimonial].role}</div>
          <div style={styles.testimonialDots}>
            {testimonials.map((_, index) => (
              <div key={index} style={{ ...styles.testimonialDot, ...(index === currentTestimonial ? styles.testimonialDotActive : {}) }} onClick={() => setCurrentTestimonial(index)} />
            ))}
          </div>
        </div>
      </div>

      <div style={styles.sectionDivider} />

      {/* Meet the Team */}
      <div className="reveal-section" style={styles.teamSection} id="team">
        <h2 style={styles.sectionTitle}>Meet the Team</h2>
        <p style={styles.sectionSubtitle}>The developers and researchers behind CodeMentor<span style={{ color: '#FBBF24' }}> + Pro</span></p>
        <div style={styles.teamGrid}>
          {teamMembers.map((member) => (
            <div key={member.name} style={styles.teamCard}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = 'rgba(251,191,36,0.4)'; e.currentTarget.style.background = 'rgba(251,191,36,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
              <div style={styles.teamAvatar}>{member.avatar}</div>
              <div style={styles.teamName}>{member.name}</div>
              <div style={styles.teamRole}>{member.role}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.sectionDivider} />

      {/* Final CTA */}
      <div className="reveal-section" style={styles.finalCTA}>
        <h2 style={styles.finalCTATitle}>Ready to Start Coding?</h2>
        <p style={styles.finalCTASubtitle}>Register for free and start solving programming exercises with instant automated feedback.</p>
        <button style={styles.primaryBtn} onClick={() => navigate('/register')}
          onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px) scale(1.05)'; e.target.style.animation = 'none'; }}
          onMouseLeave={(e) => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.animation = 'pulse 2s ease-in-out infinite'; }}>
          Get Started Now →
        </button>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.4))' }}>
                <path d="M8 5 L3 12 L8 19" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 5 L21 12 L16 19" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="8" x2="12" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3 style={styles.footerBrand}>CodeMentor<span style={{ color: '#FBBF24' }}> + Pro</span></h3>
            </div>
            <p style={styles.footerText}>© 2026 All rights reserved</p>
          </div>
          <div style={styles.footerLinks}>
            {[{ label: 'Features', id: 'features' }, { label: 'Testimonials', id: 'testimonials' }, { label: 'How It Works', id: 'how-it-works' }, { label: 'Team', id: 'team' }].map((link) => (
              <span key={link.id} style={styles.footerLink}
                onClick={() => scrollToSection(link.id)}
                onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
                onMouseLeave={(e) => e.target.style.color = theme.textSecondary}>
                {link.label}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;