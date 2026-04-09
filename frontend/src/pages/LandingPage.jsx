import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [typedText, setTypedText] = useState('');
  const [stats, setStats] = useState({
    exercises: 0,
    students: 0,
    submissions: 0,
    successRate: 0
  });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [codeText, setCodeText] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mouseTrail, setMouseTrail] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codeParticles, setCodeParticles] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionStage, setExecutionStage] = useState('idle');
  const [outputText, setOutputText] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Animated Code Particles Background
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

  // Typing animation effect
  useEffect(() => {
    const text = 'Master Programming';
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setTypedText(text.substring(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Animated counter effect
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;

    const targets = {
      exercises: 500,
      students: 1200,
      submissions: 5000,
      successRate: 87
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setStats({
        exercises: Math.floor(targets.exercises * progress),
        students: Math.floor(targets.students * progress),
        submissions: Math.floor(targets.submissions * progress),
        successRate: Math.floor(targets.successRate * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
        setStats(targets);
      }
    }, increment);

    return () => clearInterval(timer);
  }, []);

  // Scroll reveal animation + Back to top + Progress bar + Parallax
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.reveal-section');
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8;
        
        if (isVisible && !section.classList.contains('revealed')) {
          section.classList.add('revealed');
        }
      });

      setShowBackToTop(window.scrollY > 300);

      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      setScrollProgress(scrolled);

      const orbs = document.querySelectorAll('.parallax-orb');
      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 0.5;
        const yPos = -(window.scrollY * speed);
        orb.style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse trail effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      setMouseTrail(prev => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: Date.now() }];
        return newTrail.slice(-15);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Remove old trail particles
  useEffect(() => {
    const interval = setInterval(() => {
      setMouseTrail(prev => prev.slice(-10));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Testimonial rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Code editor typing animation
  useEffect(() => {
    const code = `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))`;
    
    let index = 0;
    const timer = setInterval(() => {
      if (index <= code.length) {
        setCodeText(code.substring(0, index));
        index++;
      } else {
        setTimeout(() => {
          setCodeText('');
          index = 0;
        }, 2000);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, []);

  // Live Code Execution Simulation
  const handleRunCode = async () => {
    setIsRunning(true);
    setExecutionStage('compiling');
    setOutputText('');
    setTestResults([]);

    await new Promise(resolve => setTimeout(resolve, 800));
    setExecutionStage('running');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOutputText('55');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const tests = [
      { id: 1, name: 'Test Case 1: fibonacci(5) == 5', passed: true },
      { id: 2, name: 'Test Case 2: fibonacci(10) == 55', passed: true },
      { id: 3, name: 'Test Case 3: fibonacci(0) == 0', passed: true }
    ];
    
    for (let i = 0; i < tests.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setTestResults(prev => [...prev, tests[i]]);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setExecutionStage('completed');
    setIsRunning(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const testimonials = [
    {
      name: "Gemalyn Bilos",
      role: "Information Technology Student",
      text: "CodeMentor+ Pro helped me master Python in just 3 months. The instant feedback feature is a game-changer!",
      avatar: "👩‍💻"
    },
    {
      name: "Jerome Hernaez",
      role: "Information Technology Student",
      text: "The automated grading system makes it so easy to learn from mistakes. I improved my coding skills faster than I expected!",
      avatar: "👨‍💻"
    },
    {
      name: "Hannah Goze",
      role: "Information Technology Student",
      text: "The exercise variety and difficulty progression made learning enjoyable. I went from beginner to confident coder!",
      avatar: "👩‍🎓"
    }
  ];

  const languageStats = {
    Python: 150,
    Java: 120,
    'C++': 90,
    JavaScript: 110,
    C: 70,
  };

  const faqs = [
    {
      question: "What programming languages are supported?",
      answer: "We support Python, Java, C++, JavaScript, and C. Each language has a comprehensive set of exercises ranging from beginner to advanced levels."
    },
    {
      question: "How does the automated grading system work?",
      answer: "Your code is executed against predefined test cases. The system checks for correctness, efficiency, and edge cases. You'll receive instant feedback with detailed results for each test case."
    },
    {
      question: "Is CodeMentor+ Pro free to use?",
      answer: "Yes! Students can access all core features for free. Instructors and administrators have additional tools for managing courses and tracking progress."
    },
    {
      question: "Can I track my progress over time?",
      answer: "Absolutely! Your dashboard shows comprehensive analytics including exercises completed, success rate, submission history, and skill progression across different languages."
    }
  ];

  const achievements = [
    { name: "First Blood", description: "Complete your first exercise", icon: "🎯", color: "#10b981" },
    { name: "Speed Demon", description: "Solve 5 exercises in one day", icon: "⚡", color: "#f59e0b" },
    { name: "Perfect Score", description: "Get 100% on 10 exercises", icon: "💯", color: "#8b5cf6" },
    { name: "Language Master", description: "Complete 50 exercises in one language", icon: "🏆", color: "#fbbf24" },
    { name: "Bug Crusher", description: "Fix 20 failed submissions", icon: "🐛", color: "#ef4444" },
    { name: "Night Owl", description: "Submit code after midnight", icon: "🦉", color: "#6366f1" }
  ];

  const comparisonFeatures = [
    { feature: "Real-time Code Execution", codementor: true, generic: false },
    { feature: "Automated Test Cases", codementor: true, generic: true },
    { feature: "Multiple Languages Support", codementor: true, generic: true },
    { feature: "Instructor Analytics Dashboard", codementor: true, generic: false },
    { feature: "Progress Tracking", codementor: true, generic: true },
    { feature: "Achievement System", codementor: true, generic: false },
    { feature: "Admin Management Tools", codementor: true, generic: false },
    { feature: "Instant Feedback", codementor: true, generic: true }
  ];

  const getThemeColors = () => {
    if (darkMode) {
      return {
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        cardBg: 'rgba(15, 23, 42, 0.6)',
        textPrimary: '#e2e8f0',
        textSecondary: 'rgba(226, 232, 240, 0.8)',
      };
    }
    return {
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
      cardBg: 'rgba(30, 41, 59, 0.6)',
      textPrimary: 'white',
      textSecondary: 'rgba(255, 255, 255, 0.9)',
    };
  };

  const theme = getThemeColors();

  const CodeEditorIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
      <rect x="8" y="12" width="48" height="40" rx="4" fill="rgba(251, 191, 36, 0.2)" stroke="#fbbf24" strokeWidth="2"/>
      <line x1="8" y1="20" x2="56" y2="20" stroke="#fbbf24" strokeWidth="2"/>
      <circle cx="14" cy="16" r="2" fill="#ff5f56">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="16" r="2" fill="#ffbd2e">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="0.3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="26" cy="16" r="2" fill="#27c93f">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="0.6s" repeatCount="indefinite"/>
      </circle>
      <text x="14" y="32" fontFamily="monospace" fontSize="8" fill="#fbbf24">{'<code/>'}</text>
      <rect x="14" y="36" width="20" height="2" fill="#fbbf24" opacity="0.6">
        <animate attributeName="width" values="20;36;20" dur="3s" repeatCount="indefinite"/>
      </rect>
      <rect x="14" y="42" width="30" height="2" fill="#fbbf24" opacity="0.6">
        <animate attributeName="width" values="30;24;30" dur="3s" begin="0.5s" repeatCount="indefinite"/>
      </rect>
    </svg>
  );

  const LightningIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
      <path d="M32 8 L20 36 L32 36 L28 56 L44 28 L32 28 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2">
        <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite"/>
      </path>
      <circle cx="32" cy="32" r="24" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.3">
        <animate attributeName="r" values="24;28;24" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );

  const TargetIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
      <circle cx="32" cy="32" r="28" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.3"/>
      <circle cx="32" cy="32" r="20" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.5"/>
      <circle cx="32" cy="32" r="12" fill="none" stroke="#fbbf24" strokeWidth="2"/>
      <circle cx="32" cy="32" r="4" fill="#fbbf24">
        <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/>
      </circle>
      <path d="M 48 16 L 32 32" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="48,16 44,18 46,22" fill="#fbbf24">
        <animateTransform attributeName="transform" type="rotate" values="0 48 16; 360 48 16" dur="4s" repeatCount="indefinite"/>
      </polygon>
    </svg>
  );

  const styles = {
    loadingScreen: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      animation: loading ? 'none' : 'fadeOut 0.5s ease-out forwards',
    },
    loadingLogo: {
      fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '24px',
      animation: 'pulse 1.5s ease-in-out infinite',
    },
    loadingSpinner: {
      width: '50px', height: '50px',
      border: '4px solid rgba(255, 255, 255, 0.3)', borderTop: '4px solid #fbbf24',
      borderRadius: '50%', animation: 'spin 1s linear infinite',
    },
    codeParticle: {
      position: 'absolute', color: 'rgba(251, 191, 36, 0.15)', fontFamily: 'monospace',
      pointerEvents: 'none', whiteSpace: 'nowrap', animation: 'floatDown 20s linear infinite',
    },
    progressBar: {
      position: 'fixed', top: 0, left: 0, height: '4px',
      background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
      zIndex: 9999, transition: 'width 0.3s ease', width: `${scrollProgress}%`,
    },
    mouseTrailDot: {
      position: 'fixed', width: '8px', height: '8px', borderRadius: '50%',
      background: 'rgba(251, 191, 36, 0.5)', pointerEvents: 'none',
      zIndex: 9998, transition: 'all 0.3s ease',
    },
    backToTop: {
      position: 'fixed', bottom: '40px', right: '40px', width: '56px', height: '56px',
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', boxShadow: '0 8px 24px rgba(251, 191, 36, 0.4)',
      zIndex: 1000, border: 'none', transition: 'all 0.3s ease',
      opacity: showBackToTop ? 1 : 0,
      pointerEvents: showBackToTop ? 'auto' : 'none',
      transform: showBackToTop ? 'scale(1)' : 'scale(0.8)',
    },
    darkModeToggle: {
      position: 'fixed', top: '100px', right: '40px', width: '56px', height: '56px',
      background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', border: '2px solid rgba(255, 255, 255, 0.2)', zIndex: 1000,
      transition: 'all 0.3s ease',
    },
    container: {
      minHeight: '100vh', background: theme.background, color: theme.textPrimary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative', overflow: 'hidden', transition: 'background 0.5s ease',
    },
    orb1: {
      position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px',
      background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
      borderRadius: '50%', animation: 'float 20s ease-in-out infinite',
      pointerEvents: 'none', zIndex: 0,
    },
    orb2: {
      position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px',
      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
      borderRadius: '50%', animation: 'float 25s ease-in-out infinite reverse',
      pointerEvents: 'none', zIndex: 0,
    },
    orb3: {
      position: 'absolute', top: '50%', left: '50%', width: '350px', height: '350px',
      background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
      borderRadius: '50%', animation: 'float 30s ease-in-out infinite',
      pointerEvents: 'none', zIndex: 0,
    },
    sectionDivider: {
      height: '2px',
      background: 'linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.5) 50%, transparent 100%)',
      margin: '80px auto', maxWidth: '1200px',
    },
    nav: {
      background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '0 20px',
      position: 'sticky', top: 0, zIndex: 100,
    },
    navContainer: {
      maxWidth: '1200px', margin: '0 auto', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center', height: '64px',
    },
    logo: {
      fontSize: '28px', fontWeight: 'bold', color: theme.textPrimary,
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)', cursor: 'pointer',
    },
    navLinks: { display: 'flex', gap: '32px', marginRight: 'auto', marginLeft: '48px' },
    navLink: {
      color: theme.textSecondary, fontSize: '16px', cursor: 'pointer',
      transition: 'color 0.3s', fontWeight: '500',
    },
    navButtons: { display: 'flex', gap: '16px' },
    signInBtn: {
      padding: '12px 28px', fontSize: '16px', fontWeight: '600',
      color: theme.textPrimary, background: 'transparent',
      border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '12px',
      cursor: 'pointer', transition: 'all 0.3s ease', backdropFilter: 'blur(5px)',
    },
    getStartedBtn: {
      padding: '12px 28px', fontSize: '16px', fontWeight: '600',
      color: '#1e293b', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      border: 'none', borderRadius: '12px', cursor: 'pointer',
      transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
      zIndex: 1, animation: 'pulse 2s ease-in-out infinite',
    },
    hero: {
      maxWidth: '1200px', margin: '0 auto', padding: '100px 40px 60px',
      textAlign: 'center', position: 'relative', zIndex: 1,
    },
    title: {
      fontSize: '64px', fontWeight: 'bold', color: theme.textPrimary,
      marginBottom: '16px', textShadow: '2px 2px 8px rgba(0,0,0,0.3)', minHeight: '80px',
    },
    titleHighlight: {
      fontSize: '64px', fontWeight: 'bold',
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      backgroundClip: 'text', display: 'block', marginTop: '8px', textShadow: 'none',
    },
    subtitle: {
      fontSize: '20px', color: theme.textSecondary, maxWidth: '800px',
      margin: '24px auto 48px', lineHeight: '1.6', textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    },
    heroButtons: {
      display: 'flex', justifyContent: 'center', gap: '20px',
      flexWrap: 'wrap', marginBottom: '60px',
    },
    primaryBtn: {
      padding: '18px 40px', fontSize: '18px', fontWeight: '600',
      color: '#1e293b', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      border: 'none', borderRadius: '12px', cursor: 'pointer',
      transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
      zIndex: 1, animation: 'pulse 2s ease-in-out infinite',
    },
    secondaryBtn: {
      padding: '18px 40px', fontSize: '18px', fontWeight: '600',
      color: theme.textPrimary, background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '12px',
      cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease',
    },
    techBadgesContainer: {
      display: 'flex', gap: '16px', justifyContent: 'center',
      flexWrap: 'wrap', marginBottom: '60px',
    },
    techBadge: {
      padding: '8px 20px', background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)', border: '1px solid rgba(251, 191, 36, 0.3)',
      borderRadius: '20px', color: '#fbbf24', fontSize: '14px', fontWeight: '600',
      cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative',
    },
    techBadgeActive: {
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      color: '#1e293b', transform: 'scale(1.1)',
    },
    languagePopup: {
      position: 'absolute', top: '120%', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)',
      padding: '12px 20px', borderRadius: '12px',
      border: '1px solid rgba(251, 191, 36, 0.5)', whiteSpace: 'nowrap',
      fontSize: '14px', color: '#fbbf24', zIndex: 10,
    },
    statsSection: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px', marginBottom: '80px',
    },
    statCard: {
      padding: '32px 24px', background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px', textAlign: 'center', transition: 'all 0.3s ease',
    },
    statIcon: { fontSize: '48px', marginBottom: '12px' },
    statNumber: { fontSize: '36px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '8px' },
    statLabel: { fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' },
    features: {
      maxWidth: '1200px', margin: '0 auto', padding: '0 40px 80px',
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '32px', position: 'relative', zIndex: 1,
    },
    featureCard: {
      padding: '40px 32px', background: theme.cardBg, backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px',
      textAlign: 'center', cursor: 'default', transition: 'all 0.3s ease',
      animation: 'floatCard 3s ease-in-out infinite',
    },
    featureIcon: { marginBottom: '20px', display: 'flex', justifyContent: 'center' },
    featureTitle: { fontSize: '24px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '16px' },
    featureDesc: { fontSize: '16px', color: theme.textSecondary, lineHeight: '1.6' },
    achievementsSection: {
      maxWidth: '1200px', margin: '0 auto 80px', padding: '0 40px',
      position: 'relative', zIndex: 1,
    },
    achievementsGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px',
    },
    achievementCard: {
      padding: '24px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px',
      textAlign: 'center', transition: 'all 0.3s ease', cursor: 'default',
    },
    achievementIcon: { fontSize: '48px', marginBottom: '12px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' },
    achievementName: { fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' },
    achievementDesc: { fontSize: '14px', color: theme.textSecondary },
    comparisonSection: {
      maxWidth: '1200px', margin: '0 auto 80px', padding: '0 40px',
      position: 'relative', zIndex: 1,
    },
    comparisonTable: {
      width: '100%', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', overflow: 'hidden',
    },
    comparisonHeader: {
      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '20px',
      background: 'rgba(251, 191, 36, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      fontWeight: 'bold', fontSize: '18px',
    },
    comparisonRow: {
      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '16px 20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s ease',
    },
    checkmark: { color: '#10b981', fontSize: '24px' },
    cross: { color: '#ef4444', fontSize: '24px' },
    faqSection: {
      maxWidth: '1200px', margin: '0 auto 80px', padding: '0 40px',
      position: 'relative', zIndex: 1,
    },
    faqItem: {
      marginBottom: '16px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px',
      overflow: 'hidden', transition: 'all 0.3s ease',
    },
    faqQuestion: {
      padding: '20px 24px', fontSize: '18px', fontWeight: '600', color: theme.textPrimary,
      cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', transition: 'background 0.2s ease',
    },
    faqAnswer: { padding: '0 24px 20px', fontSize: '16px', color: theme.textSecondary, lineHeight: '1.6' },
    platformPreview: {
      maxWidth: '1200px', margin: '0 auto 80px', padding: '60px 40px',
      background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px',
      position: 'relative', zIndex: 1,
    },
    platformTitle: {
      fontSize: '42px', fontWeight: 'bold', color: theme.textPrimary,
      marginBottom: '16px', textAlign: 'center',
    },
    platformSubtitle: {
      fontSize: '18px', color: theme.textSecondary, textAlign: 'center',
      marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px',
    },
    codeEditorContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    codeEditor: {
      width: '100%', minHeight: '400px', background: 'rgba(15, 23, 42, 0.9)',
      borderRadius: '16px', border: '2px solid rgba(251, 191, 36, 0.3)',
      position: 'relative', overflow: 'hidden', fontFamily: 'monospace',
    },
    editorHeader: {
      height: '40px', background: 'rgba(0, 0, 0, 0.3)', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    editorHeaderLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
    editorDot: { width: '12px', height: '12px', borderRadius: '50%' },
    runButton: {
      padding: '6px 16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      border: 'none', borderRadius: '6px', color: 'white', fontSize: '12px', fontWeight: '600',
      cursor: isRunning ? 'not-allowed' : 'pointer', opacity: isRunning ? 0.6 : 1,
      transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '6px',
    },
    editorContent: {
      padding: '24px', fontSize: '16px', lineHeight: '1.8', color: '#e2e8f0',
      maxHeight: '360px', overflowY: 'auto',
    },
    codeLine: { display: 'flex', gap: '24px' },
    lineNumber: { color: 'rgba(255, 255, 255, 0.3)', userSelect: 'none', minWidth: '30px', textAlign: 'right' },
    codeContent: { flex: 1 },
    outputPanel: {
      width: '100%', minHeight: '400px', background: 'rgba(15, 23, 42, 0.9)',
      borderRadius: '16px', border: '2px solid rgba(59, 130, 246, 0.3)',
      position: 'relative', overflow: 'hidden', fontFamily: 'monospace',
    },
    outputHeader: {
      height: '40px', background: 'rgba(0, 0, 0, 0.3)', display: 'flex',
      alignItems: 'center', padding: '0 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#60a5fa', fontSize: '14px', fontWeight: '600',
    },
    outputContent: { padding: '24px', fontSize: '14px', lineHeight: '1.8', color: '#e2e8f0' },
    outputStage: { marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
    spinner: {
      width: '16px', height: '16px',
      border: '2px solid rgba(251, 191, 36, 0.3)', borderTop: '2px solid #fbbf24',
      borderRadius: '50%', animation: 'spin 1s linear infinite',
    },
    outputResult: {
      marginTop: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px',
      color: '#10b981', fontSize: '16px', fontWeight: '600',
    },
    testCase: {
      marginBottom: '8px', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px',
      display: 'flex', alignItems: 'center', gap: '8px', animation: 'slideIn 0.3s ease-out',
    },
    scoreDisplay: {
      marginTop: '16px', padding: '16px',
      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
      border: '2px solid rgba(251, 191, 36, 0.5)', borderRadius: '12px',
      textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#fbbf24',
      animation: 'scaleIn 0.5s ease-out',
    },
    testimonialSection: {
      maxWidth: '1200px', margin: '0 auto 80px', padding: '0 40px',
      position: 'relative', zIndex: 1,
    },
    testimonialCard: {
      background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px',
      padding: '60px 40px', textAlign: 'center', minHeight: '300px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    },
    testimonialAvatar: { fontSize: '64px', marginBottom: '24px' },
    testimonialText: {
      fontSize: '20px', lineHeight: '1.6', color: theme.textSecondary,
      marginBottom: '24px', maxWidth: '700px', fontStyle: 'italic',
    },
    testimonialName: { fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '4px' },
    testimonialRole: { fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' },
    testimonialDots: { display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px' },
    testimonialDot: {
      width: '12px', height: '12px', borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.3)', cursor: 'pointer', transition: 'all 0.3s ease',
    },
    testimonialDotActive: { background: '#fbbf24', transform: 'scale(1.2)' },
    howItWorks: {
      maxWidth: '1200px', margin: '0 auto 80px', padding: '0 40px',
      position: 'relative', zIndex: 1,
    },
    sectionTitle: {
      fontSize: '42px', fontWeight: 'bold', color: theme.textPrimary,
      marginBottom: '48px', textAlign: 'center',
    },
    stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' },
    step: { textAlign: 'center' },
    stepNumber: {
      width: '80px', height: '80px', margin: '0 auto 24px',
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '32px', fontWeight: 'bold', color: '#1e293b',
      boxShadow: '0 8px 24px rgba(251, 191, 36, 0.3)',
    },
    stepTitle: { fontSize: '24px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '12px' },
    stepDesc: { fontSize: '16px', color: theme.textSecondary, lineHeight: '1.6' },
    finalCTA: {
      maxWidth: '1200px', margin: '0 auto 80px', padding: '60px 40px',
      background: 'rgba(251, 191, 36, 0.1)', backdropFilter: 'blur(10px)',
      border: '2px solid rgba(251, 191, 36, 0.3)', borderRadius: '24px',
      textAlign: 'center', position: 'relative', zIndex: 1,
    },
    finalCTATitle: { fontSize: '42px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '16px' },
    finalCTASubtitle: { fontSize: '18px', color: theme.textSecondary, marginBottom: '32px' },
    footer: {
      padding: '40px 80px', background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative', zIndex: 1,
    },
    footerContent: {
      maxWidth: '1200px', margin: '0 auto', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
    },
    footerBrand: { fontSize: '24px', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '8px' },
    footerText: { fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' },
    footerLinks: { display: 'flex', gap: '32px', color: theme.textSecondary, fontSize: '14px' },
    footerLink: { cursor: 'pointer', transition: 'color 0.2s' },
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeOut {
            to { opacity: 0; pointer-events: none; }
          }
        `}</style>
        <div style={styles.loadingLogo}>CodeMentor+ Pro</div>
        <div style={styles.loadingSpinner} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(20px, 30px) scale(1.02); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatDown {
          0% { transform: translateY(-100px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .reveal-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal-section.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .feature-card:nth-child(1) { animation-delay: 0s !important; }
        .feature-card:nth-child(2) { animation-delay: 0.5s !important; }
        .feature-card:nth-child(3) { animation-delay: 1s !important; }
      `}</style>

      {/* Progress Bar */}
      <div style={styles.progressBar} />

      {/* Animated Code Particles Background */}
      {codeParticles.map((particle) => (
        <div
          key={particle.id}
          style={{
            ...styles.codeParticle,
            left: `${particle.left}%`,
            fontSize: `${particle.fontSize}px`,
            opacity: particle.opacity,
            animationDuration: `${particle.animationDuration}s`,
            animationDelay: `${particle.animationDelay}s`,
          }}
        >
          {particle.text}
        </div>
      ))}

      {/* Mouse Trail */}
      {mouseTrail.map((dot, index) => (
        <div
          key={dot.id}
          style={{
            ...styles.mouseTrailDot,
            left: `${dot.x}px`,
            top: `${dot.y}px`,
            opacity: (index + 1) / mouseTrail.length,
            transform: `scale(${(index + 1) / mouseTrail.length})`,
          }}
        />
      ))}

      {/* Back to Top Button */}
      <button
        style={styles.backToTop}
        onClick={scrollToTop}
        onMouseEnter={(e) => { e.target.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
      >
        <span style={{ fontSize: '24px', color: '#1e293b' }}>↑</span>
      </button>

      {/* Dark Mode Toggle */}
      <button
        style={styles.darkModeToggle}
        onClick={() => setDarkMode(!darkMode)}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          e.target.style.transform = 'scale(1)';
        }}
      >
        <span style={{ fontSize: '24px' }}>{darkMode ? '☀️' : '🌙'}</span>
      </button>

      {/* Animated Background Orbs */}
      <div className="parallax-orb" style={styles.orb1} />
      <div className="parallax-orb" style={styles.orb2} />
      <div className="parallax-orb" style={styles.orb3} />

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.logo} onClick={scrollToTop}>CodeMentor+ Pro</div>
          <div style={styles.navLinks}>
            <span style={styles.navLink} onClick={() => scrollToSection('features')}
              onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.target.style.color = theme.textSecondary}>
              Features
            </span>
            <span style={styles.navLink} onClick={() => scrollToSection('testimonials')}
              onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.target.style.color = theme.textSecondary}>
              Testimonials
            </span>
            <span style={styles.navLink} onClick={() => scrollToSection('how-it-works')}
              onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.target.style.color = theme.textSecondary}>
              How It Works
            </span>
          </div>
          <div style={styles.navButtons}>
            <button style={styles.signInBtn} onClick={() => navigate('/login')}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }}>
              Sign In
            </button>
            <button style={styles.getStartedBtn} onClick={() => navigate('/register')}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.animation = 'none';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.animation = 'pulse 2s ease-in-out infinite';
              }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero} id="home">
        <div>
          <h1 style={styles.title}>
            {typedText}
            <span style={{ animation: 'blink 1s infinite' }}>|</span>
          </h1>
          <h2 style={styles.titleHighlight}>One Challenge at a Time</h2>
          <p style={styles.subtitle}>
            Practice coding exercises, submit solutions, and get instant feedback.
            Built for students, designed by developers.
          </p>

          <div style={styles.heroButtons}>
            <button style={styles.primaryBtn} onClick={() => navigate('/register')}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.animation = 'none';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.animation = 'pulse 2s ease-in-out infinite';
              }}>
              Start Learning Free →
            </button>
            <button style={styles.secondaryBtn} onClick={() => navigate('/login')}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}>
              Sign In
            </button>
          </div>

          {/* Technology Badges - 5 languages only, PHP removed */}
          <div style={styles.techBadgesContainer}>
            {['Python', 'Java', 'C++', 'JavaScript', 'C'].map((tech) => (
              <div
                key={tech}
                style={{ ...styles.techBadge, ...(selectedLanguage === tech ? styles.techBadgeActive : {}) }}
                onClick={() => setSelectedLanguage(selectedLanguage === tech ? null : tech)}
                onMouseEnter={(e) => {
                  if (selectedLanguage !== tech) {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.boxShadow = '0 5px 15px rgba(251, 191, 36, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedLanguage !== tech) {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {tech}
                {selectedLanguage === tech && (
                  <div style={styles.languagePopup}>{languageStats[tech]} exercises available</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Section */}
        <div style={styles.statsSection}>
          {[
            { label: 'Exercises', value: stats.exercises, icon: '📚', suffix: '+' },
            { label: 'Active Students', value: stats.students, icon: '👥', suffix: '+' },
            { label: 'Submissions', value: stats.submissions, icon: '📝', suffix: '+' },
            { label: 'Success Rate', value: stats.successRate, icon: '🎯', suffix: '%' }
          ].map((stat) => (
            <div key={stat.label} style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={styles.statNumber}>{stat.value}{stat.suffix}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.sectionDivider} />

      {/* Feature Cards */}
      <div className="reveal-section" style={styles.features} id="features">
        {[
          { component: <CodeEditorIcon />, title: 'Code Editor', description: 'Write and test your code in a professional IDE-like environment with syntax highlighting.' },
          { component: <LightningIcon />, title: 'Instant Feedback', description: 'Get immediate results on your code submissions with detailed test case analysis.' },
          { component: <TargetIcon />, title: 'Track Progress', description: 'Monitor your improvement with detailed statistics and submission history.' }
        ].map((feature, index) => (
          <div key={feature.title} className="feature-card"
            style={{ ...styles.featureCard, animationDelay: `${index * 0.5}s` }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-15px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
              e.currentTarget.style.animation = 'none';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.animation = 'floatCard 3s ease-in-out infinite';
            }}>
            <div style={styles.featureIcon}>{feature.component}</div>
            <h3 style={styles.featureTitle}>{feature.title}</h3>
            <p style={styles.featureDesc}>{feature.description}</p>
          </div>
        ))}
      </div>

      <div style={styles.sectionDivider} />

      {/* Achievement Badges Section */}
      <div className="reveal-section" style={styles.achievementsSection}>
        <h2 style={styles.sectionTitle}>Unlock Achievements</h2>
        <div style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <div key={achievement.name} style={styles.achievementCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = `0 12px 30px ${achievement.color}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
              <div style={styles.achievementIcon}>{achievement.icon}</div>
              <div style={{ ...styles.achievementName, color: achievement.color }}>{achievement.name}</div>
              <div style={styles.achievementDesc}>{achievement.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.sectionDivider} />

      {/* Platform Comparison Table */}
      <div className="reveal-section" style={styles.comparisonSection}>
        <h2 style={styles.sectionTitle}>Why CodeMentor+ Pro?</h2>
        <div style={styles.comparisonTable}>
          <div style={styles.comparisonHeader}>
            <div>Feature</div>
            <div style={{ textAlign: 'center' }}>CodeMentor+ Pro</div>
            <div style={{ textAlign: 'center' }}>Generic Platforms</div>
          </div>
          {comparisonFeatures.map((item, index) => (
            <div key={index} style={styles.comparisonRow}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251, 191, 36, 0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              <div>{item.feature}</div>
              <div style={{ textAlign: 'center' }}>
                {item.codementor ? <span style={styles.checkmark}>✓</span> : <span style={styles.cross}>✗</span>}
              </div>
              <div style={{ textAlign: 'center' }}>
                {item.generic ? <span style={styles.checkmark}>✓</span> : <span style={styles.cross}>✗</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.sectionDivider} />

      {/* Live Code Execution Demo */}
      <div className="reveal-section" style={styles.platformPreview}>
        <h2 style={styles.platformTitle}>Live Code Execution</h2>
        <p style={styles.platformSubtitle}>
          Watch code compile, run, and see instant test results - just like the real platform!
        </p>
        <div style={styles.codeEditorContainer}>
          <div style={styles.codeEditor}>
            <div style={styles.editorHeader}>
              <div style={styles.editorHeaderLeft}>
                <div style={{ ...styles.editorDot, background: '#ff5f56' }} />
                <div style={{ ...styles.editorDot, background: '#ffbd2e' }} />
                <div style={{ ...styles.editorDot, background: '#27c93f' }} />
                <span style={{ marginLeft: '12px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  fibonacci.py
                </span>
              </div>
              <button style={styles.runButton} onClick={handleRunCode} disabled={isRunning}
                onMouseEnter={(e) => {
                  if (!isRunning) {
                    e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isRunning) {
                    e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    e.target.style.transform = 'scale(1)';
                  }
                }}>
                <span>▶</span>
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
            </div>
            <div style={styles.editorContent}>
              {codeText.split('\n').map((line, index) => (
                <div key={index} style={styles.codeLine}>
                  <span style={styles.lineNumber}>{index + 1}</span>
                  <span style={styles.codeContent}>
                    {line.includes('def') || line.includes('if') || line.includes('return') ? (
                      <span style={{ color: '#c678dd' }}>{line}</span>
                    ) : line.includes('print') ? (
                      <span style={{ color: '#61afef' }}>{line}</span>
                    ) : line.includes('fibonacci') ? (
                      <span style={{ color: '#e5c07b' }}>{line}</span>
                    ) : (
                      <span>{line}</span>
                    )}
                  </span>
                </div>
              ))}
              <span style={{ color: '#fbbf24', animation: 'blink 1s infinite', fontSize: '18px' }}>▊</span>
            </div>
          </div>

          <div style={styles.outputPanel}>
            <div style={styles.outputHeader}>OUTPUT</div>
            <div style={styles.outputContent}>
              {executionStage === 'idle' && (
                <div style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Click "Run Code" to execute...</div>
              )}
              {executionStage === 'compiling' && (
                <div style={styles.outputStage}>
                  <div style={styles.spinner} />
                  <span style={{ color: '#fbbf24' }}>Compiling code...</span>
                </div>
              )}
              {(executionStage === 'running' || executionStage === 'completed') && (
                <>
                  <div style={styles.outputStage}>
                    {executionStage === 'running' ? (
                      <><div style={styles.spinner} /><span style={{ color: '#fbbf24' }}>Running tests...</span></>
                    ) : (
                      <span style={{ color: '#10b981' }}>✓ Execution complete</span>
                    )}
                  </div>
                  {outputText && <div style={styles.outputResult}>Output: {outputText}</div>}
                  {testResults.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '12px', fontWeight: '600' }}>
                        Test Results:
                      </div>
                      {testResults.map((test) => (
                        <div key={test.id} style={styles.testCase}>
                          <span style={{ color: '#10b981', fontSize: '18px' }}>✓</span>
                          <span style={{ color: '#10b981' }}>{test.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {executionStage === 'completed' && (
                    <div style={styles.scoreDisplay}>🎉 Score: 100/100</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.sectionDivider} />

      {/* FAQ Section */}
      <div className="reveal-section" style={styles.faqSection}>
        <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
        {faqs.map((faq, index) => (
          <div key={index} style={styles.faqItem}>
            <div style={styles.faqQuestion}
              onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              <span>{faq.question}</span>
              <span style={{ fontSize: '24px', transition: 'transform 0.3s', transform: openFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </div>
            {openFAQ === index && <div style={styles.faqAnswer}>{faq.answer}</div>}
          </div>
        ))}
      </div>

      <div style={styles.sectionDivider} />

      {/* Testimonials Section */}
      <div className="reveal-section" style={styles.testimonialSection} id="testimonials">
        <h2 style={styles.sectionTitle}>What Students Say</h2>
        <div style={styles.testimonialCard}>
          <div style={styles.testimonialAvatar}>{testimonials[currentTestimonial].avatar}</div>
          <p style={styles.testimonialText}>"{testimonials[currentTestimonial].text}"</p>
          <div style={styles.testimonialName}>{testimonials[currentTestimonial].name}</div>
          <div style={styles.testimonialRole}>{testimonials[currentTestimonial].role}</div>
          <div style={styles.testimonialDots}>
            {testimonials.map((_, index) => (
              <div key={index}
                style={{ ...styles.testimonialDot, ...(index === currentTestimonial ? styles.testimonialDotActive : {}) }}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={styles.sectionDivider} />

      {/* How It Works Section */}
      <div className="reveal-section" style={styles.howItWorks} id="how-it-works">
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.stepsGrid}>
          {[
            { step: '1', title: 'Choose Exercise', description: 'Browse through exercises filtered by language and difficulty' },
            { step: '2', title: 'Write Code', description: 'Use our built-in code editor with syntax highlighting' },
            { step: '3', title: 'Submit & Learn', description: 'Get instant feedback and track your progress' }
          ].map((step) => (
            <div key={step.step} style={styles.step}>
              <div style={styles.stepNumber}>{step.step}</div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.sectionDivider} />

      {/* Final CTA */}
      <div className="reveal-section" style={styles.finalCTA}>
        <h2 style={styles.finalCTATitle}>Ready to Start Coding?</h2>
        <p style={styles.finalCTASubtitle}>Join thousands of students learning to code effectively</p>
        <button style={styles.primaryBtn} onClick={() => navigate('/register')}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.05)';
            e.target.style.animation = 'none';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.animation = 'pulse 2s ease-in-out infinite';
          }}>
          Get Started Now →
        </button>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <h3 style={styles.footerBrand}>CodeMentor+ Pro</h3>
            <p style={styles.footerText}>© 2026 All rights reserved</p>
          </div>
          <div style={styles.footerLinks}>
            <span style={styles.footerLink} onClick={() => scrollToSection('features')}
              onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.target.style.color = theme.textSecondary}>
              Features
            </span>
            <span style={styles.footerLink} onClick={() => scrollToSection('testimonials')}
              onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.target.style.color = theme.textSecondary}>
              Testimonials
            </span>
            <span style={styles.footerLink} onClick={() => scrollToSection('how-it-works')}
              onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.target.style.color = theme.textSecondary}>
              How It Works
            </span>
            <span style={styles.footerLink}>Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;