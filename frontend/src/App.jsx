import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Laptop,
  Smartphone,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Calendar,
  ChevronRight,
  ChevronLeft,
  User,
  AlertCircle,
  Lock,
  LogOut,
  MessageSquare,
  Menu,
  X,
  FileText,
  Check,
  Building,
  UserCheck,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';

import servicesData from './servicesData';

const MotorolaLogo = ({ size = 24, style = {}, className = "" }) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={style} className={className} xmlns="http://www.w3.org/2000/svg">
    <title>Motorola</title>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12C24.002 5.375 18.632.002 12.007 0H12zm7.327 18.065s-.581-2.627-1.528-4.197c-.514-.857-1.308-1.553-2.368-1.532-.745 0-1.399.423-2.2 1.553-.469.77-.882 1.573-1.235 2.403 0 0-.29-.675-.63-1.343a8.038 8.038 0 0 0-.605-1.049c-.804-1.13-1.455-1.539-2.2-1.553-1.049-.021-1.854.675-2.364 1.528-.948 1.574-1.528 4.197-1.528 4.197h-.864l4.606-15.12 3.56 11.804.024.021.024-.021 3.56-11.804 4.61 15.113h-.862z" />
  </svg>
);

const DellLogo = ({ size = 24, style = {}, className = "" }) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={style} className={className} xmlns="http://www.w3.org/2000/svg">
    <title>Dell</title>
    <path d="M17.963 14.6V9.324h1.222v4.204h2.14v1.07h-3.362zm-9.784-3.288l2.98-2.292c.281.228.56.458.841.687l-2.827 2.14.611.535 2.827-2.216c.281.228.56.458.841.688a295.83 295.83 0 0 1-2.827 2.216l.61.536 2.83-2.295-.001-1.986h1.223v4.204h2.216v1.07h-3.362v-1.987c-.995.763-1.987 1.529-2.981 2.292l-2.981-2.292c-.144.729-.653 1.36-1.312 1.694-.285.147-.597.24-.915.276-.183.022-.367.017-.551.017H3.516V9.325H5.69a2.544 2.544 0 0 1 1.563.557c.454.36.778.872.927 1.43m-3.516-.917v3.21l.953-.001a1.377 1.377 0 0 0 1.036-.523 1.74 1.74 0 0 0 .182-1.889 1.494 1.494 0 0 0-.976-.766c-.166-.04-.338-.03-.507-.032h-.688zM11.82 0h.337a11.94 11.94 0 0 1 5.405 1.373 12.101 12.101 0 0 1 4.126 3.557A11.93 11.93 0 0 1 24 11.82v.36a11.963 11.963 0 0 1-3.236 8.033A11.967 11.967 0 0 1 12.182 24h-.361a11.993 11.993 0 0 1-4.145-.806 12.04 12.04 0 0 1-4.274-2.836A12.057 12.057 0 0 1 .576 15.67 12.006 12.006 0 0 1 0 12.181v-.361a11.924 11.924 0 0 1 1.992-6.396 12.211 12.211 0 0 1 4.71-4.172A11.875 11.875 0 0 1 11.82 0m-.153 1.23a10.724 10.724 0 0 0-6.43 2.375 10.78 10.78 0 0 0-3.319 4.573 10.858 10.858 0 0 0 .193 8.12 10.788 10.788 0 0 0 3.546 4.421 10.698 10.698 0 0 0 4.786 1.946c1.456.209 2.955.124 4.376-.26a10.756 10.756 0 0 0 5.075-3.062 10.742 10.742 0 0 0 2.686-5.28 10.915 10.915 0 0 0-.122-4.682 10.77 10.77 0 0 0-7.098-7.626 10.78 10.78 0 0 0-3.693-.525z" />
  </svg>
);

const HpLogo = ({ size = 24, style = {}, className = "" }) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={style} className={className} xmlns="http://www.w3.org/2000/svg">
    <title>HP</title>
    <path d="M12.0069 24h-.3572l2.459-6.7453h3.3796c.5907 0 1.2364-.4533 1.4424-1.0166l2.6652-7.3085c.4396-1.1952-.2473-2.1706-1.525-2.1706h-4.6983l-3.929 10.798-2.2255 6.127C3.929 22.434 0 17.6806 0 12.007 0 6.498 3.7092 1.8546 8.7647.4396L6.4705 6.759 2.6514 17.2547h2.5415L8.4488 8.339h1.9095l-3.2558 8.9158H9.644l3.0223-8.3251c.4396-1.1952-.2473-2.1706-1.525-2.1706h-2.143l2.459-6.7453C11.636 0 11.8145 0 11.9931 0 18.6285 0 24 5.3715 24 12.007c.0137 6.6216-5.3578 11.993-11.9931 11.993zM19.2742 8.325h-1.9096l-2.6789 7.336h1.9096l2.6789-7.336z" />
  </svg>
);

const AsusLogo = ({ size = 24, style = {}, className = "" }) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={style} className={className} xmlns="http://www.w3.org/2000/svg">
    <title>ASUS</title>
    <path d="M23.904 10.788V9.522h-4.656c-.972 0-1.41.6-1.482 1.182v.018-1.2h-1.368v1.266h1.362zm-6.144.456l-1.368-.078v1.458c0 .456-.228.594-1.02.594H14.28c-.654 0-.93-.186-.93-.594v-1.596l-1.386-.102v1.812h-.03c-.078-.528-.276-1.14-1.596-1.23L6 11.22c0 .666.474 1.062 1.218 1.14l3.024.306c.24.018.414.09.414.288 0 .216-.18.24-.456.24H5.946V11.22l-1.386-.09v3.348h5.646c1.26 0 1.662-.654 1.722-1.2h.03c.156.864.912 1.2 2.19 1.2h1.41c1.494 0 2.202-.456 2.202-1.524zm4.398.258l-4.338-.258c0 .666.438 1.11 1.182 1.17l3.09.24c.24.018.384.078.384.276 0 .186-.168.258-.516.258h-4.212v1.29h4.302c1.356 0 1.95-.474 1.95-1.554 0-.972-.534-1.338-1.842-1.422zm-10.194-1.98h1.386v1.266h-1.386zM3.798 11.07l-1.506-.15L0 14.478h1.686zm7.914-1.548h-4.23c-.984 0-1.416.612-1.518 1.2v-1.2H3.618c-.33 0-.486.102-.642.33l-.648.936h9.384Z" />
  </svg>
);

const AcerLogo = ({ size = 24, style = {}, className = "" }) => (
  <svg viewBox="0 0 80 20" width={size * 4} height={size} fill="currentColor" style={{ display: 'inline-block', ...style }} className={className} xmlns="http://www.w3.org/2000/svg">
    <title>Acer</title>
    <text x="0" y="16" fontFamily="'Outfit', 'Inter', sans-serif" fontWeight="900" fontSize="18" letterSpacing="-0.5px">acer</text>
  </svg>
);
const LenovoLogo = ({ size = 24, style = {}, className = "" }) => (
  <svg viewBox="0 7.997 24 8.006" width={size * 3} height={size} fill="currentColor" style={{ display: 'inline-block', ...style }} className={className} xmlns="http://www.w3.org/2000/svg">
    <title>Lenovo</title>
    <path d="M21.044 12.288c0 .5-.343.867-.815.867-.464 0-.827-.38-.827-.867 0-.51.343-.868.815-.868.464 0 .827.381.827.868zm-14.305-.92a.787.787 0 0 0-.651.307.991.991 0 0 0-.172.738l1.479-.614a.708.708 0 0 0-.656-.43zm6.963.052c-.472 0-.816.358-.816.868 0 .486.364.867.828.867.472 0 .815-.368.815-.867 0-.487-.363-.868-.827-.868zM24 7.997v8.006H0V7.997h24zM5.01 13.05H3.088V9.825H2.23v4.003h2.78v-.777zm1.137-.094l2.163-.897a1.667 1.667 0 0 0-.37-.86c-.284-.33-.704-.505-1.216-.505-.931 0-1.633.686-1.633 1.593 0 .93.704 1.593 1.726 1.593.572 0 1.158-.272 1.432-.589l-.535-.411c-.357.264-.56.326-.885.326-.292 0-.52-.09-.682-.25zm5.57-1.039c0-.709-.507-1.223-1.252-1.223a1.28 1.28 0 0 0-1.005.494v-.442h-.846v3.081h.846v-1.753c0-.316.245-.651.698-.651.35 0 .712.243.712.651v1.753h.847v-1.91zm3.647.37c0-.904-.725-1.593-1.65-1.593-.933 0-1.663.7-1.663 1.593 0 .903.726 1.592 1.651 1.592.932 0 1.662-.7 1.662-1.592zm2.066 1.54l1.268-3.081h-.967l-.765 2.099-.765-2.1h-.966l1.268 3.081h.927zm4.449-1.54c0-.904-.725-1.593-1.65-1.593-.932 0-1.662.7-1.662 1.593 0 .903.725 1.592 1.65 1.592.932 0 1.662-.7 1.662-1.592z" />
  </svg>
);

const LogoComponents = {
  MotorolaLogo,
  DellLogo,
  HpLogo,
  AsusLogo,
  AcerLogo,
  LenovoLogo
};

const RelianceResqLogo = ({ size = 20, className = "" }) => (
  <svg viewBox="0 0 160 40" width={size * 4} height={size} className={className} xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', display: 'inline-block' }}>
    <text x="5" y="26" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="800" fontSize="15" fill="#e11d48" letterSpacing="0.5">RELIANCE</text>
    <text x="90" y="26" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="800" fontSize="18" fill="#0284c7">res</text>
    <text x="118" y="26" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="900" fontSize="22" fill="#f97316">Q</text>
  </svg>
);

const DEFAULT_SLIDES = [
  {
    id: 'slide-1',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    title: 'State-of-the-Art Diagnostics Lab',
    desc: 'Our center is equipped with advanced testing jigs and professional ESD protection tools.'
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80f02e?auto=format&fit=crop&w=1200&q=80',
    title: 'Certified Micro-Soldering Repairs',
    desc: 'Specialist repair of complex motherboard chips, BGA chipsets, and charging boards.'
  },
  {
    id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=1200&q=80',
    title: 'Genuine Motorola & Laptop Parts',
    desc: 'We stock original displays, high-capacity batteries, keyboards, and components.'
  },
  {
    id: 'slide-4',
    image: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?auto=format&fit=crop&w=1200&q=80',
    title: 'Reliance resQ Certified Partnership',
    desc: 'Authorized brand service support with nationwide warranty validation.'
  }
];

let rawApiUrl = import.meta.env.VITE_API_URL || 'https://api.charom-resq.com/api';

// 1. Ensure absolute URL if not starting with http or /
if (rawApiUrl && !rawApiUrl.startsWith('http') && !rawApiUrl.startsWith('/')) {
  rawApiUrl = 'https://' + rawApiUrl;
}

// 2. Ensure it ends with /api
if (rawApiUrl && !rawApiUrl.endsWith('/api') && !rawApiUrl.endsWith('/api/')) {
  rawApiUrl = rawApiUrl.replace(/\/$/, '') + '/api';
}

const API_BASE = rawApiUrl;

const saveRepairToCache = (repair) => {
  if (!repair || !repair.ticket_id) return;
  try {
    const cached = JSON.parse(localStorage.getItem('cachedRepairs') || '[]');
    const filtered = cached.filter(item => item.ticket_id.toLowerCase() !== repair.ticket_id.toLowerCase());
    const updated = [repair, ...filtered].slice(0, 10);
    localStorage.setItem('cachedRepairs', JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving to cache:', e);
  }
};

function Slideshow({ slides, onUploadSlide }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const title = window.prompt("Enter a Title for your photo:", "Service Center Workstation");
      const desc = window.prompt("Enter a Description/Caption:", "Technician performing diagnostics and repairs.");

      const newSlide = {
        id: `uploaded-${Date.now()}`,
        image: event.target.result,
        title: title || "Service Center Upload",
        desc: desc || "Uploaded photo of our service workstation."
      };

      onUploadSlide(newSlide);
      setCurrentIndex(slides.length); // Switch to the newly uploaded slide
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="slideshow-container container">
      <button className="upload-overlay-trigger" onClick={handleUploadClick}>
        <Smartphone size={14} /> Upload Your Repair Exprience
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
      />

      {slides.map((slide, idx) => (
        <div key={slide.id} className={`slide-item ${idx === currentIndex ? 'active' : ''}`}>
          <img src={slide.image} alt={slide.title} className="slide-image" />
          <div className="slide-overlay">
            <h3 className="slide-title">{slide.title}</h3>
            <p className="slide-desc">{slide.desc}</p>
          </div>
        </div>
      ))}

      <button className="slideshow-arrow left" onClick={handlePrev} aria-label="Previous Slide">
        <ChevronLeft size={20} />
      </button>
      <button className="slideshow-arrow right" onClick={handleNext} aria-label="Next Slide">
        <ChevronRight size={20} />
      </button>

      <div className="slideshow-dots">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`slideshow-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname;
    const adminRoutes = ['/admin', '/moto', '/non-moto', '/expenses', '/overview'];
    if (adminRoutes.includes(path)) {
      return path === '/admin' ? 'admin' : path.substring(1);
    }
    const isDirectRoute = path.match(/^\/(mobile|laptop)\/([a-zA-Z0-9_-]+)\/?$/);
    if (isDirectRoute) return 'track';
    return 'home';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [hideCallBubble, setHideCallBubble] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('cachedRepairs') || '[]');
      return cached.some(r => r.status.toLowerCase() === 'delivered');
    } catch (e) {
      return false;
    }
  });

  const [slides, setSlides] = useState(() => {
    const saved = localStorage.getItem('motolap_slides');
    return saved ? JSON.parse(saved) : DEFAULT_SLIDES;
  });

  const handleUploadSlide = (newSlide) => {
    const updated = [...slides, newSlide];
    setSlides(updated);
    localStorage.setItem('motolap_slides', JSON.stringify(updated));
  };

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Sync pathname with state
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const adminRoutes = ['/admin', '/moto', '/non-moto', '/expenses', '/overview'];
      if (adminRoutes.includes(path)) {
        setActiveTab(path === '/admin' ? 'admin' : path.substring(1));
      } else {
        const isDirectRoute = path.match(/^\/(mobile|laptop)\/([a-zA-Z0-9_-]+)\/?$/);
        if (isDirectRoute) {
          setActiveTab('track');
        } else {
          const adminTabs = ['admin', 'moto', 'non-moto', 'expenses', 'overview'];
          setActiveTab((prev) => adminTabs.includes(prev) ? 'home' : prev);
        }
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Update path on tab selection
  useEffect(() => {
    const path = window.location.pathname;
    const adminTabs = ['admin', 'moto', 'non-moto', 'expenses', 'overview'];
    
    if (adminTabs.includes(activeTab)) {
      const targetPath = activeTab === 'admin' ? '/admin' : `/${activeTab}`;
      if (path !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    } else if (activeTab !== 'track') {
      if (path !== '/' && !path.startsWith('/services') && !path.startsWith('/book') && !path.startsWith('/contact')) {
        window.history.pushState(null, '', '/');
      }
    }
  }, [activeTab]);

  return (
    <div className="app-layout">

      {/* Header / Navbar */}
      <header className="navbar">
        <div className="container nav-container">
          <div className="logo" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/favicon.png" alt="Reliance Resq Service Logo" style={{ width: '28px', height: '28px', objectFit: 'contain', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: '1.1' }}>ReLince Resq Service</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Affiliated with <RelianceResqLogo size={9} />
              </span>
            </div>
          </div>

          <nav>
            <ul className="nav-menu">
              <li>
                <span
                  className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
                  onClick={() => setActiveTab('home')}
                >
                  Home
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeTab === 'services' ? 'active' : ''}`}
                  onClick={() => setActiveTab('services')}
                >
                  Services
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeTab === 'book' ? 'active' : ''}`}
                  onClick={() => setActiveTab('book')}
                >
                  Book Repair
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeTab === 'track' ? 'active' : ''}`}
                  onClick={() => setActiveTab('track')}
                >
                  Track Status
                </span>
              </li>
              <li>
                <span
                  className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contact')}
                >
                  Contact
                </span>
              </li>

            </ul>
          </nav>
        </div>
      </header>

      {/* Main Pages */}
      <main style={{ minHeight: '80vh' }}>
        {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} slides={slides} onUploadSlide={handleUploadSlide} setSelectedBrand={setSelectedBrand} />}
        {activeTab === 'services' && <ServicesView setActiveTab={setActiveTab} selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} />}
        {activeTab === 'book' && <BookRepairView />}
        {activeTab === 'track' && <TrackStatusView setHideCallBubble={setHideCallBubble} />}
        {activeTab === 'contact' && <ContactView />}
        {['admin', 'moto', 'non-moto', 'expenses', 'overview'].includes(activeTab) && (
          <AdminView activeSection={activeTab} setActiveSection={setActiveTab} />
        )}
      </main>

      {/* Quick Mobile Action Floating Buttons */}
      <div className="quick-contact-bar">
        <a href="https://wa.me/7458976787?text=Hi%2C%20I%20want%20to%20inquire%20about%20a%20repair." target="_blank" rel="noopener noreferrer" className="contact-bubble whatsapp" aria-label="WhatsApp Inquiry">
          <MessageSquare />
        </a>
        {!hideCallBubble && (
          <a href="tel:+7458976787" className="contact-bubble call" aria-label="Call Service Center">
            <Phone />
          </a>
        )}
      </div>

      {/* Mobile Bottom Navigation (Native App Feel) */}
      <nav className="mobile-bottom-nav">
        <div className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Smartphone />
          <span>Home</span>
        </div>
        <div className={`mobile-nav-item ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>
          <Wrench />
          <span>Book</span>
        </div>
        <div className={`mobile-nav-item ${activeTab === 'track' ? 'active' : ''}`} onClick={() => setActiveTab('track')}>
          <Search />
          <span>Track</span>
        </div>
        <div className={`mobile-nav-item ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>
          <Mail />
          <span>Contact</span>
        </div>
      </nav>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <img src="/favicon.png" alt="Reliance Resq Service Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            <span>Reliance Resq Multi Brand Authorised Service center</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Authorized Service Affiliate: <RelianceResqLogo size={10} />
            </span>
          </div>
          <p style={{ marginBottom: '16px', fontSize: '0.8rem' }}>
            Official Motorola Mobile Specialists & Premium Laptop Service Experts (Dell, HP, Asus) in affiliation with Reliance resQ.
          </p>
          <div className="footer-links">
            <span className="footer-link" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>Home</span>
            <span className="footer-link" onClick={() => setActiveTab('services')} style={{ cursor: 'pointer' }}>Services</span>
            <span className="footer-link" onClick={() => setActiveTab('book')} style={{ cursor: 'pointer' }}>Book Repair</span>
            <span className="footer-link" onClick={() => setActiveTab('track')} style={{ cursor: 'pointer' }}>Track Status</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            &copy; {new Date().getFullYear()} Charom Enterprises All rights reserved. All brand logos are property of their respective owners.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ==========================================================================
   1. HOME VIEW
   ========================================================================== */
function HomeView({ setActiveTab, slides, onUploadSlide, setSelectedBrand }) {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero container">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '30px', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>OFFICIAL SERVICE AFFILIATE</span>
          <span style={{ height: '14px', width: '1px', background: 'var(--border-color)' }}></span>
          <RelianceResqLogo size={12} />
        </div>
        <h1 className="hero-title">
          Specialist Care For <br />
          <span className="gradient-text">Motorola & Laptops</span>
        </h1>
        <p className="hero-desc">
          Certified Motorola mobile repair specialists and dedicated engineers for Dell, HP, and Asus laptops. Supported by state-of-the-art diagnostic testing and certified engineers.
        </p>
        <div className="hero-ctas">
          <button className="btn btn-primary" onClick={() => setActiveTab('book')}>
            Book a Repair <ChevronRight size={18} />
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('track')}>
            Track Repair Status <Search size={16} />
          </button>
        </div>
      </section>

      {/* Picture Slideshow */}
      <Slideshow slides={slides} onUploadSlide={onUploadSlide} />

      {/* Brands Selection Section */}
      <section className="section container" style={{ paddingTop: '20px' }}>
        <div className="section-header">
          <h2 className="section-title">Brands We Service</h2>
          <p className="section-desc">
            We focus exclusively on Motorola mobile devices and Dell, HP, Asus laptops to ensure the highest expertise and part availability.
          </p>
        </div>

        <div className="brands-grid">
          {servicesData.slice(0, 4).map((brand) => {
            const LogoComponent = LogoComponents[brand.logoType];
            return (
              <div
                key={brand.id}
                className={`brand-card ${brand.id}`}
                onClick={() => {
                  setSelectedBrand(brand.id);
                  setActiveTab('services');
                }}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <span className={`brand-badge ${brand.badgeClass}`}>{brand.badgeText}</span>
                  <div className="brand-logo-placeholder" style={{ color: brand.accentColor, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
                    {LogoComponent ? <LogoComponent size={52} /> : null}
                  </div>
                  <p className="brand-desc">{brand.desc}</p>
                </div>
                <ul className="brand-features">
                  {brand.features.map((feat, idx) => (
                    <li key={idx}><Check /> {feat}</li>
                  ))}
                </ul>
                <button
                  className="btn btn-secondary btn-block"
                  style={{ fontSize: '0.8rem', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: 'auto' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBrand(brand.id);
                    setActiveTab('services');
                  }}
                >
                  See More <ChevronRight size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 28px', 
              borderRadius: '30px', 
              fontWeight: '700',
              fontSize: '0.9rem',
              boxShadow: 'var(--shadow-sm)'
            }}
            onClick={() => {
              setActiveTab('services');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Show More Brands <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Professional Features Section */}
      <section className="section container" style={{ background: 'rgba(255, 255, 255, 0.01)', borderRadius: '24px', border: '1px solid var(--border-color)', margin: '40px auto' }}>
        <div className="section-header">
          <h2 className="section-title">Why Choose Charom Enterprises?</h2>
          <p className="section-desc">We make repairing your devices fast, transparent, and completely stress-free.</p>
        </div>

        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon-wrapper">
              <Smartphone />
            </div>
            <h3>Motorola Focus</h3>
            <p>Unlike general mobile shops, we are dedicated Motorola specialists. We keep Razr foldable displays, Moto Edge curves, and G-series assemblies ready in stock.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrapper">
              <Laptop />
            </div>
            <h3>Laptop Engineers</h3>
            <p>Our engineers are certified in micro-soldering and advanced diagnosis for Dell, HP, and Asus. We resolve complex motherboard and GPU errors locally.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrapper">
              <Clock />
            </div>
            <h3>Quick Status Tracking</h3>
            <p>No need to keep calling. Get your real-time repair status online anytime. Just enter your phone number or unique Repair Ticket ID.</p>
          </div>
        </div>
      </section>

      {/* Reliance resQ Affiliation Section */}
      <section className="section container" style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid var(--border-color)', margin: '40px auto', padding: '40px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 350px', textAlign: 'left' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(225, 29, 72, 0.1)', color: 'var(--color-resq)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px' }}>
              Strategic Affiliation
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
              Powered by Reliance resQ
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem' }}>
              As an authorized affiliate of <strong>Reliance resQ</strong>, we deliver certified service standards. This strategic partnership brings state-of-the-art diagnostic protocols, manufacturer-approved testing equipment, and nationwide service assurance right to Noida.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} /> Nationwide Warranty Validation across all Reliance resQ networks.
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} /> Technicians trained and certified by OEM partners and resQ labs.
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} /> Direct integration with Reliance Digital service support.
              </li>
            </ul>
          </div>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Authorized Service Platform</span>
            <RelianceResqLogo size={36} />
            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Verified Partner Portal ID: <strong>RESQ-MOTO-9382</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ==========================================================================
   2. SERVICES VIEW
   ========================================================================== */
function ServicesView({ setActiveTab, selectedBrand, setSelectedBrand }) {
  useEffect(() => {
    if (selectedBrand) {
      const element = document.getElementById(`service-card-${selectedBrand}`);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setSelectedBrand(null);
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedBrand, setSelectedBrand]);

  return (
    <div className="container section">
      <div className="section-header">
        <h2 className="section-title">Our Specialized Services</h2>
        <p className="section-desc">Certified support, genuine components, and expert workmanship for every device.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', margin: '40px 0' }}>
        {servicesData.map((brand) => {
          const LogoComponent = LogoComponents[brand.logoType];
          return (
            <div
              key={brand.id}
              id={`service-card-${brand.id}`}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                padding: '35px',
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)',
                scrollMarginTop: '90px',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              className="service-brand-detail-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(2, 132, 199, 0.08)',
                  color: brand.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px'
                }}>
                  {brand.type === 'mobile' ? <Smartphone size={24} /> : <Laptop size={24} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                    {brand.name} Services
                  </h3>
                  <span className={`brand-badge ${brand.badgeClass}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                    {brand.badgeText}
                  </span>
                </div>
                <div style={{ marginLeft: 'auto', color: brand.accentColor }}>
                  {LogoComponent ? <LogoComponent size={40} /> : null}
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {brand.desc} Dedicated tooling, OEM test setups, and diagnostic software are used for all {brand.name} repairs.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {brand.services.map((service, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '0.95rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{service.name}</span>
                    <strong style={{
                      color: service.tagType === 'success' ? '#059669' : 'var(--color-moto)',
                      background: service.tagType === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(2, 132, 199, 0.08)',
                      padding: '6px 12px',
                      borderRadius: '30px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {service.tag}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary" onClick={() => setActiveTab('book')}>
          Book Your Repair Now
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. BOOK REPAIR VIEW (Multi-Step Form)
   ========================================================================== */
function BookRepairView() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    brand: '',
    device_model: '',
    issue_description: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service_type: 'Walk-in' // Default
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleBrandSelect = (brand) => {
    setFormData({ ...formData, brand, device_model: '' });
    setStep(2);
  };

  const handleServiceSelect = (service_type) => {
    setFormData({ ...formData, service_type });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => {
    if (step === 2 && !formData.device_model) {
      setError('Please specify your device model.');
      return;
    }
    if (step === 2 && !formData.issue_description) {
      setError('Please provide a brief description of the issue.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone) {
      setError('Please fill in all contact information.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/repairs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong during submission');
      }

      setSuccessData(data.repair);
      saveRepairToCache(data.repair);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Failed to submit repair request. Make sure the database is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section">
      <div className="booking-card">
        {step < 4 && (
          <div className="form-header">
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>Book a Repair</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Register your device and get your repair ticket instantly.</p>
          </div>
        )}

        {/* Steps Indicator */}
        {step < 4 && (
          <div className="form-steps-indicator">
            <div className={`form-step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              {step > 1 ? <Check size={14} /> : '1'}
            </div>
            <div className={`form-step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              {step > 2 ? <Check size={14} /> : '2'}
            </div>
            <div className={`form-step-dot ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
              {step > 3 ? <Check size={14} /> : '3'}
            </div>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', marginBottom: '20px', alignItems: 'center', textAlign: 'left' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Select Brand */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', textAlign: 'left' }}>Step 1: Select Your Device Brand</h3>
            <div className="brand-select-grid">
              <div className={`brand-option-card ${formData.brand === 'Motorola' ? 'selected' : ''}`} onClick={() => handleBrandSelect('Motorola')}>
                <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <MotorolaLogo size={28} style={{ color: formData.brand === 'Motorola' ? 'var(--color-moto)' : 'var(--text-secondary)' }} />
                </div>
                Motorola (Mobile)
              </div>
              <div className={`brand-option-card ${formData.brand === 'Dell' ? 'selected' : ''}`} onClick={() => handleBrandSelect('Dell')}>
                <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <DellLogo size={28} style={{ color: formData.brand === 'Dell' ? 'var(--color-dell)' : 'var(--text-secondary)' }} />
                </div>
                Dell (Laptop)
              </div>
              <div className={`brand-option-card ${formData.brand === 'HP' ? 'selected' : ''}`} onClick={() => handleBrandSelect('HP')}>
                <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <HpLogo size={28} style={{ color: formData.brand === 'HP' ? 'var(--color-hp)' : 'var(--text-secondary)' }} />
                </div>
                HP (Laptop)
              </div>
              <div className={`brand-option-card ${formData.brand === 'Asus' ? 'selected' : ''}`} onClick={() => handleBrandSelect('Asus')}>
                <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <AsusLogo size={28} style={{ color: formData.brand === 'Asus' ? 'var(--color-asus)' : 'var(--text-secondary)' }} />
                </div>
                Asus (Laptop)
              </div>
              <div className={`brand-option-card ${formData.brand === 'Acer' ? 'selected' : ''}`} onClick={() => handleBrandSelect('Acer')}>
                <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <AcerLogo size={14} style={{ color: formData.brand === 'Acer' ? 'var(--color-acer)' : 'var(--text-secondary)' }} />
                </div>
                Acer (Laptop)
              </div>
              <div className={`brand-option-card ${formData.brand === 'Lenovo' ? 'selected' : ''}`} onClick={() => handleBrandSelect('Lenovo')}>
                <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <LenovoLogo size={14} style={{ color: formData.brand === 'Lenovo' ? 'var(--color-lenovo)' : 'var(--text-secondary)' }} />
                </div>
                Lenovo (Laptop)
              </div>
            </div>

           
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'left', marginTop: '12px' }}>
              * We only repair Motorola mobiles. For laptops, we service Dell, HP, Asus, Acer, and Lenovo.
            </p>
          </div>
        )}

        {/* Step 2: Model & Issue Details */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', textAlign: 'left' }}>Step 2: Device & Issue Details ({formData.brand})</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="device_model">Device Model Name</label>
              <input
                type="text"
                id="device_model"
                name="device_model"
                className="form-input"
                placeholder={formData.brand === 'Motorola' ? 'e.g. Moto Edge 50 Pro, Razr 40 Ultra' : 'e.g. Dell XPS 15 9520, HP Pavilion 14'}
                value={formData.device_model}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="issue_description">Describe the Issue</label>
              <textarea
                id="issue_description"
                name="issue_description"
                className="form-input"
                placeholder="e.g. Screen cracked, battery draining very fast, laptop overheating and shutting down, etc."
                value={formData.issue_description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div className="form-nav-buttons">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                <ChevronLeft size={16} /> Back
              </button>
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact & Service Type */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', textAlign: 'left' }}>Step 3: Contact & Service Preferences</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="customer_name">Full Name</label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                className="form-input"
                placeholder="Your Name"
                value={formData.customer_name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="customer_email">Email Address</label>
                <input
                  type="email"
                  id="customer_email"
                  name="customer_email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="customer_phone">Phone Number</label>
                <input
                  type="tel"
                  id="customer_phone"
                  name="customer_phone"
                  className="form-input"
                  placeholder="10-digit number"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Service Type</label>
              <div className="service-type-grid">
                <div className={`service-type-card ${formData.service_type === 'Walk-in' ? 'selected' : ''}`} onClick={() => handleServiceSelect('Walk-in')}>
                  <Building />
                  <span className="service-type-name">Walk-in</span>
                  <span className="service-type-desc">Bring it to our center</span>
                </div>
                <div className={`service-type-card ${formData.service_type === 'Home Pickup' ? 'selected' : ''}`} onClick={() => handleServiceSelect('Home Pickup')}>
                  <UserCheck />
                  <span className="service-type-name">Home Pickup</span>
                  <span className="service-type-desc">We pick up from your home</span>
                </div>
                <div className={`service-type-card ${formData.service_type === 'Courier' ? 'selected' : ''}`} onClick={() => handleServiceSelect('Courier')}>
                  <FileText />
                  <span className="service-type-name">Courier</span>
                  <span className="service-type-desc">Ship it to us via mail</span>
                </div>
              </div>
            </div>

            <div className="form-nav-buttons">
              <button type="button" className="btn btn-secondary" onClick={prevStep} disabled={loading}>
                <ChevronLeft size={16} /> Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Confirm & Book'} <CheckCircle size={16} />
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Success View */}
        {step === 4 && successData && (
          <div className="booking-success-box">
            <div className="success-icon-wrapper">
              <CheckCircle />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>Repair Booked Successfully!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Your ticket has been generated. Please keep this ID to track status.
            </p>

            <div className="success-ticket-card">
              <span className="success-ticket-label">Your Tracking Ticket ID</span>
              <div className="success-ticket-value">{successData.ticket_id}</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                We have also sent a confirmation to <strong>{successData.customer_email}</strong>.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', fontSize: '0.85rem', textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <div><strong>Device:</strong> {successData.brand} {successData.device_model}</div>
              <div><strong>Name:</strong> {successData.customer_name}</div>
              <div><strong>Service Preference:</strong> {successData.service_type}</div>
              <div><strong>Status:</strong> {successData.status}</div>
            </div>

            <button className="btn btn-secondary" onClick={() => { setStep(1); setFormData({ brand: '', device_model: '', issue_description: '', customer_name: '', customer_email: '', customer_phone: '', service_type: 'Walk-in' }); setSuccessData(null); }}>
              Book Another Repair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   4. TRACK STATUS VIEW
   ========================================================================== */
function TrackStatusView({ setHideCallBubble }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [cachedRepairsList, setCachedRepairsList] = useState([]);
  const [activeDetailsModal, setActiveDetailsModal] = useState(null);

  const handleOpenExternal = (repair) => {
    setActiveDetailsModal(repair);
  };

  useEffect(() => {
    const loadAndRefreshCache = async () => {
      try {
        const cached = JSON.parse(localStorage.getItem('cachedRepairs') || '[]');
        if (cached.length === 0) return;

        setCachedRepairsList(cached);

        const updated = await Promise.all(
          cached.map(async (item) => {
            try {
              const response = await fetch(`${API_BASE}/repairs/${item.ticket_id}`);
              if (response.ok) {
                const updatedRepair = await response.json();
                return updatedRepair;
              }
            } catch (e) {
              console.error(e);
            }
            return item;
          })
        );

        localStorage.setItem('cachedRepairs', JSON.stringify(updated));
        setCachedRepairsList(updated);

        if (setHideCallBubble) {
          const hasDelivered = updated.some(r => r.status.toLowerCase() === 'delivered');
          setHideCallBubble(hasDelivered);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadAndRefreshCache();
  }, [setHideCallBubble]);

  useEffect(() => {
    const checkDirectRoute = () => {
      const isDirectRoute = window.location.pathname.match(/^\/(mobile|laptop)\/([a-zA-Z0-9_-]+)\/?$/);
      const hash = window.location.hash;
      if (isDirectRoute && hash) {
        const ticketId = hash.replace(/^#/, '');
        setSearchQuery(ticketId);
        
        // Trigger search immediately
        setLoading(true);
        setError('');
        setResults([]);
        setHasSearched(true);
        fetch(`${API_BASE}/repairs/search?query=${encodeURIComponent(ticketId)}`)
          .then(res => res.json())
          .then(data => {
            setResults(data);
            setLoading(false);
            if (Array.isArray(data) && data.length > 0) {
              data.forEach(r => saveRepairToCache(r));
              const updated = JSON.parse(localStorage.getItem('cachedRepairs') || '[]');
              setCachedRepairsList(updated);
              if (setHideCallBubble) {
                const hasDelivered = updated.some(x => x.status.toLowerCase() === 'delivered');
                setHideCallBubble(hasDelivered);
              }
            }
          })
          .catch(err => {
            setError('Failed to fetch status');
            setLoading(false);
          });
      }
    };

    checkDirectRoute();
    
    window.addEventListener('hashchange', checkDirectRoute);
    window.addEventListener('popstate', checkDirectRoute);
    return () => {
      window.removeEventListener('hashchange', checkDirectRoute);
      window.removeEventListener('popstate', checkDirectRoute);
    };
  }, [setHideCallBubble]);

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);
    setHasSearched(true);

    try {
      const response = await fetch(`${API_BASE}/repairs/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to perform search');
      }

      setResults(data);
      if (Array.isArray(data) && data.length > 0) {
        const repair = data[0];
        const deviceType = repair.brand.toLowerCase() === 'motorola' ? 'mobile' : 'laptop';
        const brandLower = repair.brand.toLowerCase();
        const newPath = `/${deviceType}/${brandLower}/#${repair.ticket_id}`;
        if (window.location.pathname + window.location.hash !== newPath) {
          window.history.pushState(null, '', newPath);
        }

        data.forEach(repair => saveRepairToCache(repair));
        const updated = JSON.parse(localStorage.getItem('cachedRepairs') || '[]');
        setCachedRepairsList(updated);
        if (setHideCallBubble) {
          const hasDelivered = updated.some(r => r.status.toLowerCase() === 'delivered');
          setHideCallBubble(hasDelivered);
        }
      }
    } catch (err) {
      setError(err.message || 'Error occurred. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { name: 'Received', desc: 'We have registered your device request.' },
    { name: 'Diagnosis', desc: 'Technicians are testing your device components.' },
    { name: 'In Repair', desc: 'Work is currently ongoing. Spare parts applied.' },
    { name: 'Quality Check', desc: 'We are testing the device software & hardware calibration.' },
    { name: 'Ready for Pickup', desc: 'Your device is fully repaired and ready for handover.' },
    { name: 'Delivered', desc: 'Device has been collected or delivered.' }
  ];

  const getStepIndex = (status) => {
    return steps.findIndex(step => step.name.toLowerCase() === status.toLowerCase());
  };

  return (
    <div className="container section">
      <div className="tracker-card">
        <div className="form-header">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>Track Repair Status</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Enter your Ticket ID (e.g. MOTO-XXXXX or LAP-XXXXX) or your registered Phone Number.</p>
        </div>

        <form onSubmit={handleSearch} className="search-bar-wrapper">
          <input
            type="text"
            className="form-input"
            placeholder="e.g. MOTO-8302 or 574897984"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
            {loading ? 'Searching...' : 'Search'} <Search size={16} />
          </button>
        </form>

        {/* Cached / Recently Tracked Repairs Section */}
        {cachedRepairsList.length > 0 && !hasSearched && (
          <div style={{ marginTop: '24px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>Your Recently Tracked Devices</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              {cachedRepairsList.map((repair) => (
                <div
                  key={repair.ticket_id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  className="recent-track-card"
                  onClick={() => {
                    setSearchQuery(repair.ticket_id);
                    setLoading(true);
                    setError('');
                    setHasSearched(true);
                    fetch(`${API_BASE}/repairs/search?query=${encodeURIComponent(repair.ticket_id)}`)
                      .then(res => res.json())
                      .then(data => {
                        setResults(data);
                        setLoading(false);
                        if (Array.isArray(data) && data.length > 0) {
                          const rep = data[0];
                          const deviceType = rep.brand.toLowerCase() === 'motorola' ? 'mobile' : 'laptop';
                          const brandLower = rep.brand.toLowerCase();
                          const newPath = `/${deviceType}/${brandLower}/#${rep.ticket_id}`;
                          if (window.location.pathname + window.location.hash !== newPath) {
                            window.history.pushState(null, '', newPath);
                          }

                          data.forEach(r => saveRepairToCache(r));
                          const updated = JSON.parse(localStorage.getItem('cachedRepairs') || '[]');
                          setCachedRepairsList(updated);
                          if (setHideCallBubble) {
                            const hasDelivered = updated.some(x => x.status.toLowerCase() === 'delivered');
                            setHideCallBubble(hasDelivered);
                          }
                        }
                      })
                      .catch(err => {
                        setError('Failed to fetch status');
                        setLoading(false);
                      });
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>{repair.brand} {repair.device_model}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                      Ticket ID:{' '}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenExternal(repair);
                        }}
                        style={{ color: 'var(--color-moto)', textDecoration: 'underline', fontWeight: 'bold' }}
                      >
                        {repair.ticket_id} <ExternalLink size={10} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                      </span>
                    </p>
                  </div>
                  <span className={`badge badge-${repair.status.replace(/\s+/g, '-')}`}>
                    {repair.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', margin: '20px 0', alignItems: 'center', textAlign: 'left' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {hasSearched && results.length === 0 && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <AlertCircle size={32} style={{ color: 'var(--text-muted)', display: 'block', margin: '0 auto 12px' }} />
            No active repairs found for "{searchQuery}". Check the Ticket ID or phone number spelling.
          </div>
        )}

        {results.length > 0 && (
          <div>
            {results.map((repair) => {
              const currentStepIdx = getStepIndex(repair.status);
              return (
                <div key={repair.id} style={{ borderBottom: results.length > 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: results.length > 1 ? '40px' : '0', marginBottom: results.length > 1 ? '40px' : '0' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ textAlign: 'left' }}>
                      <span className={`badge badge-${repair.status.replace(/\s+/g, '-')}`} style={{ marginBottom: '8px' }}>
                        {repair.status}
                      </span>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{repair.brand} {repair.device_model}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Ticket ID:{' '}
                        <span
                          onClick={() => handleOpenExternal(repair)}
                          style={{ cursor: 'pointer', color: 'var(--color-moto)', textDecoration: 'underline', fontWeight: 'bold' }}
                          title="Open details in new page"
                        >
                          {repair.ticket_id} <ExternalLink size={10} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                        </span>
                      </p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem', textAlign: 'right' }}>
                      <div>Date Booked: {new Date(repair.created_at).toLocaleDateString()}</div>
                      <div>Service preference: {repair.service_type}</div>
                    </div>
                  </div>

                  {/* Timeline Visualizer */}
                  <div className="status-timeline">
                    {steps.map((step, idx) => {
                      const isActive = idx === currentStepIdx;
                      const isCompleted = idx < currentStepIdx;
                      return (
                        <div key={step.name} className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <div className="timeline-title">{step.name}</div>
                            <div className="timeline-desc">{step.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Box */}
                  <div className="ticket-info-summary">
                    <div>
                      <span className="ticket-info-label">Customer Name:</span>
                      <div className="ticket-info-val">{repair.customer_name}</div>
                    </div>
                    <div>
                      <span className="ticket-info-label">Reported Issue:</span>
                      <div className="ticket-info-val" style={{ fontSize: '0.8rem', fontWeight: '400' }}>{repair.issue_description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeDetailsModal && (
        <div className="custom-modal-overlay" onClick={() => setActiveDetailsModal(null)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h3 className="custom-modal-title">Repair Ticket Details</h3>
              <button className="custom-modal-close-btn" onClick={() => setActiveDetailsModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="custom-modal-body">
              <div className="custom-modal-greeting">Greetings from Motorola & Laptop Service Center!</div>
              <p className="custom-modal-desc">
                Below are the complete registered details for this service ticket. You can track its live progress or proceed to view it on the main network portal.
              </p>
              
              <div className="custom-modal-details-grid">
                <div className="custom-modal-detail-item">
                  <span className="custom-modal-label">Ticket ID</span>
                  <span className="custom-modal-value" style={{ color: 'var(--color-moto)' }}>{activeDetailsModal.ticket_id}</span>
                </div>
                <div className="custom-modal-detail-item">
                  <span className="custom-modal-label">Current Status</span>
                  <span className="custom-modal-value">
                    <span className={`badge badge-${activeDetailsModal.status.replace(/\s+/g, '-')}`} style={{ display: 'inline-block', margin: 0 }}>
                      {activeDetailsModal.status}
                    </span>
                  </span>
                </div>
                <div className="custom-modal-detail-item">
                  <span className="custom-modal-label">Device Brand</span>
                  <span className="custom-modal-value">{activeDetailsModal.brand}</span>
                </div>
                <div className="custom-modal-detail-item">
                  <span className="custom-modal-label">Device Model</span>
                  <span className="custom-modal-value">{activeDetailsModal.device_model}</span>
                </div>
                <div className="custom-modal-detail-item">
                  <span className="custom-modal-label">Customer Name</span>
                  <span className="custom-modal-value">{activeDetailsModal.customer_name}</span>
                </div>
                <div className="custom-modal-detail-item">
                  <span className="custom-modal-label">Date Booked</span>
                  <span className="custom-modal-value">{new Date(activeDetailsModal.created_at).toLocaleDateString()}</span>
                </div>
                <div className="custom-modal-detail-item">
                  <span className="custom-modal-label">Service Preference</span>
                  <span className="custom-modal-value">{activeDetailsModal.service_type}</span>
                </div>
                <div className="custom-modal-detail-item">
                  <span className="custom-modal-label">Contact Phone</span>
                  <span className="custom-modal-value">{activeDetailsModal.customer_phone}</span>
                </div>
                <div className="custom-modal-detail-item full-width">
                  <span className="custom-modal-label">Reported Issue</span>
                  <span className="custom-modal-value" style={{ fontWeight: 'normal', fontSize: '0.85rem' }}>{activeDetailsModal.issue_description}</span>
                </div>
              </div>
            </div>
            <div className="custom-modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveDetailsModal(null)}>
                Close
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  const deviceType = activeDetailsModal.brand.toLowerCase() === 'motorola' ? 'mobile' : 'laptop';
                  const brandLower = activeDetailsModal.brand.toLowerCase();
                  const url = `https://charom-resq.com/${deviceType}/${brandLower}/#${activeDetailsModal.ticket_id}`;
                  window.open(url, '_blank');
                }}
              >
                Open on Charom ResQ <ExternalLink size={14} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   5. CONTACT VIEW
   ========================================================================== */
function ContactView() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please provide Name, Email, and Message.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit contact inquiry');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError(err.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section">
      <div className="section-header">
        <h2 className="section-title">Contact Us</h2>
        <p className="section-desc">Reach out for custom service configurations, business contracts, or urgent repair questions.</p>
      </div>

      <div className="contact-layout">
        {/* Left Side: Contact Information */}
        <div className="contact-info-card">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px' }}>Get in Touch</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="contact-method">
                <div className="contact-method-icon">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="contact-method-title">Call Us Directly</div>
                  <div className="contact-method-detail">+91 7458976787 / +91 6394273766</div>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-method-icon">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="contact-method-title">Email Enquiries</div>
                  <a
                    className="contact-method-detail"
                    href="https://google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    charom.ayodhya.ram@gmail.com
                  </a>
                </div>

              </div>

              <a 
                href="https://www.google.com/maps?cid=9724902949827405796" 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-method"
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '16px' }}
              >
                <div className="contact-method-icon">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="contact-method-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Visit Our Center <ExternalLink size={14} style={{ color: 'var(--color-moto)' }} />
                  </div>
                  <div className="contact-method-detail" style={{ textDecoration: 'underline', textDecorationColor: 'rgba(0,0,0,0.1)' }}>
                    Basment floor, gata, Axis bank Charom Enterprises, 55, Raibareli Rd, Naka, Usroo, Faizabad, Uttar Pradesh 224001
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '12px' }}>Operational Hours</h4>
            <ul className="store-hours-list">
              <li><span>Monday - Friday</span> <span>09:30 AM - 07:30 PM</span></li>
              <li><span>Saturday</span> <span>10:00 AM - 05:00 PM</span></li>
              <li><span>Sunday</span> <span style={{ color: '#f87171', fontWeight: '600' }}>Closed</span></li>
            </ul>
          </div>

          <div className="map-placeholder">
            <span>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57002.76682322846!2d82.05812624863282!3d26.754811599999993!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399a09004e0f875f%3A0x86f5cbb5479c67e4!2sMotorola%20Service%20Center%20By%20Charom%20Enterprises%20(Reliance%20ResQ)!5e0!3m2!1sen!2sin!4v1783755031895!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </span>
            <div style={{ marginTop: '12px', textAlign: 'left' }}>
              <a 
                href="https://www.google.com/maps?cid=9724902949827405796" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '0.85rem', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  fontWeight: '700',
                  textDecoration: 'none'
                }}
              >
                Open in Google Maps <ExternalLink size={16} />
              </a>
            </div>
          </div>

        </div>

        {/* Right Side: Message Form */}
        <div className="contact-form-card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', textAlign: 'left' }}>Send Us a Message</h3>

          {error && (
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', marginBottom: '20px', alignItems: 'center', textAlign: 'left' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px 16px', borderRadius: '8px', color: '#34d399', fontSize: '0.85rem', marginBottom: '20px', alignItems: 'center', textAlign: 'left' }}>
              <CheckCircle size={18} />
              <span>Your message has been sent successfully. We will get back to you shortly!</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="contact_name">Full Name</label>
              <input
                type="text"
                id="contact_name"
                name="name"
                className="form-input"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="contact_email">Email Address</label>
                <input
                  type="email"
                  id="contact_email"
                  name="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact_phone">Phone (Optional)</label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="phone"
                  className="form-input"
                  placeholder="10-digit phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact_message">How Can We Help You?</label>
              <textarea
                id="contact_message"
                name="message"
                className="form-input"
                placeholder="Please describe what support or information you need..."
                value={formData.message}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Sending Message...' : 'Send Message'} <CheckCircle size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   6. ADMIN PORTAL VIEW
   ========================================================================== */
function AdminView({ activeSection = 'admin', setActiveSection }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('adminUsername') || '';
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem('adminPassword') || '';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Data lists
  const [repairs, setRepairs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [motoRepairs, setMotoRepairs] = useState([]);
  const [nonMotoRepairs, setNonMotoRepairs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [overviewData, setOverviewData] = useState(null);

  // States
  const [updatingId, setUpdatingId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [warrantyFilter, setWarrantyFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals for CRUD operations
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [currentRepair, setCurrentRepair] = useState(null); // null for Add, object for Edit
  const [repairForm, setRepairForm] = useState({
    brand: 'Motorola',
    device_model: '',
    issue_description: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    service_type: 'Walk-in',
    status: 'Received',
    amount_collected: 0,
    warranty_status: 'Out of Warranty',
    receiving_date: new Date().toISOString().substring(0, 16),
    giving_date: ''
  });

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null); // null for Add, object for Edit
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  // Fetch standard Postgres database repairs & contacts
  const fetchAdminData = async (authPass = password, authUser = username) => {
    if (!authUser || authUser.toLowerCase() !== 'admin') {
      setError('Invalid admin username. Access denied.');
      setIsAuthenticated(false);
      return;
    }

    setLoading(true);
    try {
      const repairsRes = await fetch(`${API_BASE}/admin/repairs`, {
        headers: { 'x-admin-password': authPass }
      });
      if (!repairsRes.ok) {
        if (repairsRes.status === 401 || repairsRes.status === 403) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch data');
      }
      const repairsData = await repairsRes.json();
      setRepairs(repairsData);

      const contactsRes = await fetch(`${API_BASE}/admin/contacts`, {
        headers: { 'x-admin-password': authPass }
      });
      const contactsData = await contactsRes.json();
      if (contactsRes.ok) setContacts(contactsData);

      setIsAuthenticated(true);
      setError('');
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('adminUsername', authUser);
      localStorage.setItem('adminPassword', authPass);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      if (err.message === 'Unauthorized') {
        setError('Invalid admin password.');
        setIsAuthenticated(false);
        localStorage.removeItem('isAdminAuthenticated');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminPassword');
      } else {
        setError('Server connection error. Failed to retrieve data.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch Motorola repairs (JSON)
  const fetchMotoData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/moto`, {
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        const data = await res.json();
        setMotoRepairs(data);
      }
    } catch (e) {
      console.error('Error fetching Motorola repairs:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Non-Motorola repairs (JSON)
  const fetchNonMotoData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/non-moto`, {
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        const data = await res.json();
        setNonMotoRepairs(data);
      }
    } catch (e) {
      console.error('Error fetching laptop repairs:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Expenses (JSON)
  const fetchExpensesData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/expenses`, {
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (e) {
      console.error('Error fetching expenses:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Financial Overview
  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/overview`, {
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        const data = await res.json();
        setOverviewData(data);
      }
    } catch (e) {
      console.error('Error fetching overview details:', e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger login
  const handleLogin = (e) => {
    e.preventDefault();
    fetchAdminData(password, username);
  };

  // Trigger fetches depending on active section
  useEffect(() => {
    if (isAuthenticated && password) {
      // Reset filter states when tab switches
      setSearchFilter('');
      setBrandFilter('');
      setStatusFilter('');
      setWarrantyFilter('');

      if (activeSection === 'admin') fetchAdminData(password, username);
      else if (activeSection === 'moto') fetchMotoData();
      else if (activeSection === 'non-moto') fetchNonMotoData();
      else if (activeSection === 'expenses') fetchExpensesData();
      else if (activeSection === 'overview') fetchOverviewData();
      else if (activeSection === 'messages') fetchAdminData(password, username);
    }
  }, [isAuthenticated, activeSection]);

  // Update Postgres repair status (original dashboard)
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`${API_BASE}/admin/repairs/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setRepairs(repairs.map(r => r.id === parseInt(id) ? { ...r, status: newStatus } : r));
      } else {
        const errData = await response.json();
        alert(errData.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status. Check server connection.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Modal handlers
  const handleOpenRepairModal = (repair = null, isNonMoto = false) => {
    if (repair) {
      setCurrentRepair(repair);
      setRepairForm({
        brand: repair.brand,
        device_model: repair.device_model,
        issue_description: repair.issue_description,
        customer_name: repair.customer_name,
        customer_email: repair.customer_email,
        customer_phone: repair.customer_phone,
        customer_address: repair.customer_address,
        service_type: repair.service_type,
        status: repair.status,
        amount_collected: repair.amount_collected,
        warranty_status: repair.warranty_status,
        receiving_date: repair.receiving_date ? repair.receiving_date.substring(0, 16) : new Date().toISOString().substring(0, 16),
        giving_date: repair.giving_date ? repair.giving_date.substring(0, 16) : ''
      });
    } else {
      setCurrentRepair(null);
      setRepairForm({
        brand: isNonMoto ? 'Dell' : 'Motorola',
        device_model: '',
        issue_description: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        service_type: 'Walk-in',
        status: 'Received',
        amount_collected: 0,
        warranty_status: 'Out of Warranty',
        receiving_date: new Date().toISOString().substring(0, 16),
        giving_date: ''
      });
    }
    setRepairModalOpen(true);
  };

  const handleSaveRepair = async (e) => {
    e.preventDefault();
    const endpoint = repairForm.brand === 'Motorola' ? 'moto' : 'non-moto';
    const isEdit = !!currentRepair;
    const url = isEdit 
      ? `${API_BASE}/admin/${endpoint}/${currentRepair.id}`
      : `${API_BASE}/admin/${endpoint}`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(repairForm)
      });

      if (response.ok) {
        setRepairModalOpen(false);
        if (repairForm.brand === 'Motorola') {
          fetchMotoData();
        } else {
          fetchNonMotoData();
        }
        alert(`Record ${isEdit ? 'updated' : 'created'} successfully.`);
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to save record.');
      }
    } catch (err) {
      alert('Error communicating with backend.');
    }
  };

  const handleDeleteRepair = async (id, isMoto) => {
    if (!window.confirm('Are you sure you want to delete this repair record?')) return;
    const endpoint = isMoto ? 'moto' : 'non-moto';
    try {
      const response = await fetch(`${API_BASE}/admin/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });
      if (response.ok) {
        if (isMoto) fetchMotoData();
        else fetchNonMotoData();
        alert('Record deleted successfully.');
      } else {
        alert('Failed to delete record.');
      }
    } catch (err) {
      alert('Error communicating with backend.');
    }
  };

  const handleOpenExpenseModal = (expense = null) => {
    if (expense) {
      setCurrentExpense(expense);
      setExpenseForm({
        description: expense.description,
        amount: expense.amount,
        expense_date: expense.expense_date ? expense.expense_date.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setCurrentExpense(null);
      setExpenseForm({
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0]
      });
    }
    setExpenseModalOpen(true);
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    const isEdit = !!currentExpense;
    const url = isEdit 
      ? `${API_BASE}/admin/expenses/${currentExpense.id}`
      : `${API_BASE}/admin/expenses`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(expenseForm)
      });

      if (response.ok) {
        setExpenseModalOpen(false);
        fetchExpensesData();
        alert(`Expense ${isEdit ? 'updated' : 'created'} successfully.`);
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to save expense.');
      }
    } catch (err) {
      alert('Error communicating with backend.');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const response = await fetch(`${API_BASE}/admin/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });
      if (response.ok) {
        fetchExpensesData();
        alert('Expense deleted successfully.');
      } else {
        alert('Failed to delete expense.');
      }
    } catch (err) {
      alert('Error communicating with backend.');
    }
  };

  // Filter Postgres repairs locally
  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch =
      repair.ticket_id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      repair.customer_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      repair.customer_phone.includes(searchFilter);
    const matchesBrand = brandFilter ? repair.brand === brandFilter : true;
    const matchesStatus = statusFilter ? repair.status === statusFilter : true;

    return matchesSearch && matchesBrand && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="container section">
        <div className="admin-login-card">
          <div className="success-icon-wrapper" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
            <Lock />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '20px' }}>Enter your admin username and password.</p>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '6px', color: '#f87171', fontSize: '0.8rem', marginBottom: '16px', textAlign: 'left' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="admin_user">Username</label>
              <input
                type="text"
                id="admin_user"
                className="form-input"
                placeholder="Enter username (default: admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="admin_pass">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="admin_pass"
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '48px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Authenticating...' : 'Authenticate'} <ChevronRight size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>Management Panel</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Logged in as admin ({username})</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => {
            setIsAuthenticated(false);
            setUsername('');
            setPassword('');
            localStorage.removeItem('isAdminAuthenticated');
            localStorage.removeItem('adminUsername');
            localStorage.removeItem('adminPassword');
            setActiveSection('admin');
          }} 
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Logout <LogOut size={14} />
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button 
          className={`admin-tab ${activeSection === 'admin' ? 'active' : ''}`} 
          onClick={() => setActiveSection('admin')}
          style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: activeSection === 'admin' ? 'var(--color-moto)' : 'transparent', color: activeSection === 'admin' ? '#fff' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          📋 Service Tickets ({repairs.length})
        </button>
        <button 
          className={`admin-tab ${activeSection === 'moto' ? 'active' : ''}`} 
          onClick={() => setActiveSection('moto')}
          style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: activeSection === 'moto' ? 'var(--color-moto)' : 'transparent', color: activeSection === 'moto' ? '#fff' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          📱 Motorola Database ({motoRepairs.length})
        </button>
        <button 
          className={`admin-tab ${activeSection === 'non-moto' ? 'active' : ''}`} 
          onClick={() => setActiveSection('non-moto')}
          style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: activeSection === 'non-moto' ? 'var(--color-moto)' : 'transparent', color: activeSection === 'non-moto' ? '#fff' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          💻 Laptop Database ({nonMotoRepairs.length})
        </button>
        <button 
          className={`admin-tab ${activeSection === 'expenses' ? 'active' : ''}`} 
          onClick={() => setActiveSection('expenses')}
          style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: activeSection === 'expenses' ? 'var(--color-moto)' : 'transparent', color: activeSection === 'expenses' ? '#fff' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          💸 Operational Expenses ({expenses.length})
        </button>
        <button 
          className={`admin-tab ${activeSection === 'overview' ? 'active' : ''}`} 
          onClick={() => setActiveSection('overview')}
          style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: activeSection === 'overview' ? 'var(--color-moto)' : 'transparent', color: activeSection === 'overview' ? '#fff' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          📊 Profit & Loss Overview
        </button>
        <button 
          className={`admin-tab ${activeSection === 'messages' ? 'active' : ''}`} 
          onClick={() => setActiveSection('messages')}
          style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: activeSection === 'messages' ? 'var(--color-moto)' : 'transparent', color: activeSection === 'messages' ? '#fff' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          ✉️ Inquiries ({contacts.length})
        </button>
      </div>

      {/* Repairs Tab (Original) */}
      {activeSection === 'admin' && (
        <div>
          {/* Filters Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search ticket ID, customer name or phone..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{ flex: 2, minWidth: '200px', padding: '8px 12px', fontSize: '0.85rem' }}
              />

              <select
                className="form-input"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                style={{ flex: 1, minWidth: '120px', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="">All Brands</option>
                <option value="Motorola">Motorola</option>
                <option value="Dell">Dell</option>
                <option value="HP">HP</option>
                <option value="Asus">Asus</option>
              </select>

              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ flex: 1, minWidth: '150px', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="">All Statuses</option>
                <option value="Received">Received</option>
                <option value="Diagnosis">Diagnosis</option>
                <option value="In Repair">In Repair</option>
                <option value="Quality Check">Quality Check</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          {filteredRepairs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
              No repair tickets match the filter criteria.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Customer Name</th>
                    <th>Contact Info</th>
                    <th>Device</th>
                    <th>Service Type</th>
                    <th>Date Booked</th>
                    <th>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRepairs.map((repair) => (
                    <tr key={repair.id}>
                      <td style={{ fontWeight: '700', color: 'var(--color-moto)' }}>{repair.ticket_id}</td>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{repair.customer_name}</td>
                      <td>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{repair.customer_phone}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{repair.customer_email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{repair.brand} {repair.device_model}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={repair.issue_description}>
                          {repair.issue_description}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem' }}>{repair.service_type}</span>
                      </td>
                      <td>{new Date(repair.created_at).toLocaleDateString()}</td>
                      <td>
                        <select
                          className="status-select"
                          value={repair.status}
                          disabled={updatingId === repair.id}
                          onChange={(e) => handleStatusChange(repair.id, e.target.value)}
                        >
                          <option value="Received">Received</option>
                          <option value="Diagnosis">Diagnosis</option>
                          <option value="In Repair">In Repair</option>
                          <option value="Quality Check">Quality Check</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Motorola repairs Tab */}
      {activeSection === 'moto' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', textAlign: 'left' }}>Motorola Registry (moto.json)</h3>
            <button className="btn btn-primary" onClick={() => handleOpenRepairModal(null, false)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              + Add Motorola Record
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search model, customer name or phone..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{ flex: 2, minWidth: '200px', padding: '8px 12px', fontSize: '0.85rem' }}
              />
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ flex: 1, minWidth: '150px', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="">All Statuses</option>
                <option value="Received">Received</option>
                <option value="Diagnosis">Diagnosis</option>
                <option value="In Repair">In Repair</option>
                <option value="Quality Check">Quality Check</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Delivered">Delivered</option>
              </select>
              <select
                className="form-input"
                value={warrantyFilter}
                onChange={(e) => setWarrantyFilter(e.target.value)}
                style={{ flex: 1, minWidth: '150px', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="">All Warranties</option>
                <option value="In Warranty">In Warranty</option>
                <option value="Out of Warranty">Out of Warranty</option>
              </select>
            </div>
          </div>

          {motoRepairs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
              No Motorola repair tickets found. Click "+ Add Motorola Record" to add one.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Model</th>
                    <th>Customer Name</th>
                    <th>Phone / Address</th>
                    <th>Warranty</th>
                    <th>Dates (Recv to Delv)</th>
                    <th>Amount (₹)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {motoRepairs
                    .filter(r => {
                      const matchesSearch = r.device_model.toLowerCase().includes(searchFilter.toLowerCase()) || 
                                            r.customer_name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                                            r.customer_phone.includes(searchFilter);
                      const matchesStatus = statusFilter ? r.status === statusFilter : true;
                      const matchesWarranty = warrantyFilter ? r.warranty_status === warrantyFilter : true;
                      return matchesSearch && matchesStatus && matchesWarranty;
                    })
                    .map((repair) => (
                      <tr key={repair.id}>
                        <td style={{ fontWeight: '700', color: 'var(--color-moto)' }}>{repair.ticket_id}</td>
                        <td style={{ fontWeight: '600' }}>{repair.device_model}</td>
                        <td>{repair.customer_name}</td>
                        <td>
                          <div style={{ fontSize: '0.75rem', fontWeight: '600' }}>{repair.customer_phone}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={repair.customer_address}>
                            {repair.customer_address || 'No Address'}
                          </div>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontWeight: '600',
                            background: repair.warranty_status === 'In Warranty' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            color: repair.warranty_status === 'In Warranty' ? '#10b981' : '#ef4444' 
                          }}>
                            {repair.warranty_status}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.75rem' }}>Recv: {repair.receiving_date ? new Date(repair.receiving_date).toLocaleDateString() : 'N/A'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delv: {repair.giving_date ? new Date(repair.giving_date).toLocaleDateString() : 'Pending'}</div>
                        </td>
                        <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{parseFloat(repair.amount_collected || 0).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${repair.status?.toLowerCase().replace(/\s+/g, '-')}`} style={{ 
                            fontSize: '0.75rem', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontWeight: '600',
                            background: 'rgba(2, 132, 199, 0.1)', 
                            color: 'var(--color-moto)' 
                          }}>
                            {repair.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleOpenRepairModal(repair, false)} style={{ background: 'none', border: 'none', color: 'var(--color-moto)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Edit</button>
                            <button onClick={() => handleDeleteRepair(repair.id, true)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Laptop / Non-Motorola repairs Tab */}
      {activeSection === 'non-moto' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', textAlign: 'left' }}>Laptop & Other Devices Registry (non-moto.json)</h3>
            <button className="btn btn-primary" onClick={() => handleOpenRepairModal(null, true)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              + Add Laptop Record
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search brand, model, customer name or phone..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{ flex: 2, minWidth: '200px', padding: '8px 12px', fontSize: '0.85rem' }}
              />
              <select
                className="form-input"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                style={{ flex: 1, minWidth: '120px', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="">All Brands</option>
                <option value="Dell">Dell</option>
                <option value="HP">HP</option>
                <option value="Asus">Asus</option>
                <option value="Acer">Acer</option>
                <option value="Lenovo">Lenovo</option>
              </select>
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ flex: 1, minWidth: '120px', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="">All Statuses</option>
                <option value="Received">Received</option>
                <option value="Diagnosis">Diagnosis</option>
                <option value="In Repair">In Repair</option>
                <option value="Quality Check">Quality Check</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Delivered">Delivered</option>
              </select>
              <select
                className="form-input"
                value={warrantyFilter}
                onChange={(e) => setWarrantyFilter(e.target.value)}
                style={{ flex: 1, minWidth: '120px', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="">All Warranties</option>
                <option value="In Warranty">In Warranty</option>
                <option value="Out of Warranty">Out of Warranty</option>
              </select>
            </div>
          </div>

          {nonMotoRepairs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
              No Laptop / non-Motorola repair tickets found. Click "+ Add Laptop Record" to add one.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Brand & Model</th>
                    <th>Customer Name</th>
                    <th>Phone / Address</th>
                    <th>Warranty</th>
                    <th>Dates (Recv to Delv)</th>
                    <th>Amount (₹)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {nonMotoRepairs
                    .filter(r => {
                      const matchesSearch = r.brand.toLowerCase().includes(searchFilter.toLowerCase()) ||
                                            r.device_model.toLowerCase().includes(searchFilter.toLowerCase()) || 
                                            r.customer_name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                                            r.customer_phone.includes(searchFilter);
                      const matchesBrand = brandFilter ? r.brand === brandFilter : true;
                      const matchesStatus = statusFilter ? r.status === statusFilter : true;
                      const matchesWarranty = warrantyFilter ? r.warranty_status === warrantyFilter : true;
                      return matchesSearch && matchesBrand && matchesStatus && matchesWarranty;
                    })
                    .map((repair) => (
                      <tr key={repair.id}>
                        <td style={{ fontWeight: '700', color: 'var(--color-moto)' }}>{repair.ticket_id}</td>
                        <td style={{ fontWeight: '600' }}>
                          <span style={{ color: `var(--color-${repair.brand?.toLowerCase()})`, marginRight: '4px' }}>[{repair.brand}]</span>
                          {repair.device_model}
                        </td>
                        <td>{repair.customer_name}</td>
                        <td>
                          <div style={{ fontSize: '0.75rem', fontWeight: '600' }}>{repair.customer_phone}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={repair.customer_address}>
                            {repair.customer_address || 'No Address'}
                          </div>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontWeight: '600',
                            background: repair.warranty_status === 'In Warranty' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            color: repair.warranty_status === 'In Warranty' ? '#10b981' : '#ef4444' 
                          }}>
                            {repair.warranty_status}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.75rem' }}>Recv: {repair.receiving_date ? new Date(repair.receiving_date).toLocaleDateString() : 'N/A'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delv: {repair.giving_date ? new Date(repair.giving_date).toLocaleDateString() : 'Pending'}</div>
                        </td>
                        <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{parseFloat(repair.amount_collected || 0).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${repair.status?.toLowerCase().replace(/\s+/g, '-')}`} style={{ 
                            fontSize: '0.75rem', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontWeight: '600',
                            background: 'rgba(2, 132, 199, 0.1)', 
                            color: 'var(--color-moto)' 
                          }}>
                            {repair.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleOpenRepairModal(repair, true)} style={{ background: 'none', border: 'none', color: 'var(--color-moto)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Edit</button>
                            <button onClick={() => handleDeleteRepair(repair.id, false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Expenses Tab */}
      {activeSection === 'expenses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', textAlign: 'left' }}>Operational Expenses Log (overall.json)</h3>
            <button className="btn btn-primary" onClick={() => handleOpenExpenseModal(null)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              + Add Expense Record
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by description (e.g. Rent, Spare display, Coffee)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
            />
          </div>

          {expenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
              No operational expenses logged yet. Click "+ Add Expense Record" to add one.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Description</th>
                    <th>Amount (₹)</th>
                    <th>Expense Date</th>
                    <th>Logged At</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses
                    .filter(e => e.description.toLowerCase().includes(searchFilter.toLowerCase()))
                    .map((exp) => (
                      <tr key={exp.id}>
                        <td style={{ fontWeight: '700', color: 'var(--text-muted)' }}>#{exp.id}</td>
                        <td style={{ fontWeight: '600' }}>{exp.description}</td>
                        <td style={{ fontWeight: '700', color: '#ef4444' }}>₹{parseFloat(exp.amount || 0).toFixed(2)}</td>
                        <td>{new Date(exp.expense_date).toLocaleDateString()}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(exp.created_at || exp.expense_date).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleOpenExpenseModal(exp)} style={{ background: 'none', border: 'none', color: 'var(--color-moto)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Edit</button>
                            <button onClick={() => handleDeleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Financial Overview Tab */}
      {activeSection === 'overview' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', textAlign: 'left' }}>Financial P&L Overview</h3>
          
          {overviewData ? (
            <div>
              {/* Stat Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                
                {/* Moto Card */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(2, 132, 199, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-moto)', marginBottom: '16px' }}>
                    <Smartphone size={20} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Motorola Income</span>
                  <h4 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '4px 0 2px' }}>₹{parseFloat(overviewData.motoRevenue).toFixed(2)}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>From {overviewData.motoCount} repair records</p>
                </div>

                {/* Laptop Card */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(2, 132, 199, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-moto)', marginBottom: '16px' }}>
                    <Laptop size={20} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Laptop/Other Income</span>
                  <h4 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '4px 0 2px' }}>₹{parseFloat(overviewData.nonMotoRevenue).toFixed(2)}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>From {overviewData.nonMotoCount} repair records</p>
                </div>

                {/* Total Revenue Card */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '16px' }}>
                    <CheckCircle size={20} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Total Revenue</span>
                  <h4 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '4px 0 2px', color: '#10b981' }}>₹{parseFloat(overviewData.totalRevenue).toFixed(2)}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Sum of all service earnings</p>
                </div>

                {/* Expenses Card */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
                    <AlertCircle size={20} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Total Expenses</span>
                  <h4 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '4px 0 2px', color: '#ef4444' }}>₹{parseFloat(overviewData.totalExpenses).toFixed(2)}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>From {overviewData.expensesCount} logged items</p>
                </div>

              </div>

              {/* Profit & Loss Main Panel */}
              <div style={{ 
                background: overviewData.netProfit >= 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                borderRadius: '24px',
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                marginBottom: '40px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }}></div>

                <span style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.9 }}>
                  NET CENTER BALANCE
                </span>
                <h2 style={{ fontSize: '3.5rem', fontWeight: '900', margin: '12px 0 8px', letterSpacing: '-1.5px', textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                  {overviewData.netProfit >= 0 ? '+' : '-'}₹{Math.abs(parseFloat(overviewData.netProfit)).toFixed(2)}
                </h2>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  padding: '6px 16px', 
                  borderRadius: '30px', 
                  fontSize: '0.85rem', 
                  fontWeight: '700' 
                }}>
                  {overviewData.netProfit >= 0 ? '🟢 OPERATIONAL PROFIT' : '🔴 OPERATIONAL LOSS'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: '600' }}>PROFIT MARGIN</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '4px' }}>
                      {overviewData.totalRevenue > 0 ? ((overviewData.netProfit / overviewData.totalRevenue) * 100).toFixed(1) : '0.0'}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: '600' }}>TOTAL REPAIRS RECORDED</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '4px' }}>
                      {overviewData.motoCount + overviewData.nonMotoCount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: '600' }}>EXPENSE-TO-REVENUE RATIO</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '4px' }}>
                      {overviewData.totalRevenue > 0 ? ((overviewData.totalExpenses / overviewData.totalRevenue) * 100).toFixed(1) : '0.0'}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading overview details...</div>
          )}
        </div>
      )}

      {/* Contact Messages Management */}
      {activeSection === 'messages' && (
        <div>
          {contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
              No contact inquiries received yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '150px' }}>Sender</th>
                    <th style={{ width: '180px' }}>Contact Info</th>
                    <th>Message</th>
                    <th style={{ width: '120px' }}>Date Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((msg) => (
                    <tr key={msg.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{msg.name}</td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>{msg.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{msg.phone || 'No Phone'}</div>
                      </td>
                      <td style={{ color: 'var(--text-primary)', fontSize: '0.8rem', whiteSpace: 'pre-wrap', lineHeight: '1.4', textAlign: 'left' }}>{msg.message}</td>
                      <td>{new Date(msg.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Repair Record Modal (Add/Edit) */}
      {repairModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>
                {currentRepair ? `Edit Ticket ${currentRepair.ticket_id}` : `Add New Repair Record`}
              </h3>
              <button onClick={() => setRepairModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            <form onSubmit={handleSaveRepair}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', textAlign: 'left' }}>
                {/* Brand selection */}
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  {repairForm.brand === 'Motorola' ? (
                    <input type="text" className="form-input" value="Motorola" disabled style={{ background: '#f1f5f9' }} />
                  ) : (
                    <select 
                      className="form-input" 
                      value={repairForm.brand} 
                      onChange={(e) => setRepairForm({ ...repairForm, brand: e.target.value })}
                      required
                    >
                      <option value="Dell">Dell</option>
                      <option value="HP">HP</option>
                      <option value="Asus">Asus</option>
                      <option value="Acer">Acer</option>
                      <option value="Lenovo">Lenovo</option>
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Device Model</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Moto Edge 50 Ultra or Latitude 5420"
                    value={repairForm.device_model} 
                    onChange={(e) => setRepairForm({ ...repairForm, device_model: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={repairForm.customer_name} 
                    onChange={(e) => setRepairForm({ ...repairForm, customer_name: e.target.value })} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Customer Phone</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    value={repairForm.customer_phone} 
                    onChange={(e) => setRepairForm({ ...repairForm, customer_phone: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Customer Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={repairForm.customer_email} 
                  onChange={(e) => setRepairForm({ ...repairForm, customer_email: e.target.value })} 
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Customer Address</label>
                <textarea 
                  className="form-input" 
                  value={repairForm.customer_address} 
                  onChange={(e) => setRepairForm({ ...repairForm, customer_address: e.target.value })} 
                  style={{ minHeight: '60px' }}
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Issue Description</label>
                <textarea 
                  className="form-input" 
                  value={repairForm.issue_description} 
                  onChange={(e) => setRepairForm({ ...repairForm, issue_description: e.target.value })} 
                  style={{ minHeight: '60px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Warranty Status</label>
                  <select 
                    className="form-input" 
                    value={repairForm.warranty_status} 
                    onChange={(e) => setRepairForm({ ...repairForm, warranty_status: e.target.value })}
                  >
                    <option value="Out of Warranty">Out of Warranty (OOW)</option>
                    <option value="In Warranty">In Warranty</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount Collected (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={repairForm.amount_collected} 
                    onChange={(e) => setRepairForm({ ...repairForm, amount_collected: parseFloat(e.target.value) || 0 })} 
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Service Type</label>
                  <select 
                    className="form-input" 
                    value={repairForm.service_type} 
                    onChange={(e) => setRepairForm({ ...repairForm, service_type: e.target.value })}
                  >
                    <option value="Walk-in">Walk-in</option>
                    <option value="Home Pickup">Home Pickup</option>
                    <option value="Courier">Courier</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Repair Status</label>
                  <select 
                    className="form-input" 
                    value={repairForm.status} 
                    onChange={(e) => setRepairForm({ ...repairForm, status: e.target.value })}
                  >
                    <option value="Received">Received</option>
                    <option value="Diagnosis">Diagnosis</option>
                    <option value="In Repair">In Repair</option>
                    <option value="Quality Check">Quality Check</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Receiving Date</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    value={repairForm.receiving_date} 
                    onChange={(e) => setRepairForm({ ...repairForm, receiving_date: e.target.value })} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Giving Date (Delivery)</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    value={repairForm.giving_date} 
                    onChange={(e) => setRepairForm({ ...repairForm, giving_date: e.target.value })} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Record</button>
                <button type="button" className="btn btn-secondary" onClick={() => setRepairModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal (Add/Edit) */}
      {expenseModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '450px', padding: '28px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>
                {currentExpense ? `Edit Expense #${currentExpense.id}` : `Log New Expense`}
              </h3>
              <button onClick={() => setExpenseModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            <form onSubmit={handleSaveExpense}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Description</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Rent, Spare screen Moto G54, Electricity"
                  value={expenseForm.description} 
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Amount (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="0.00"
                  value={expenseForm.amount} 
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || '' })} 
                  min="0.01"
                  step="0.01"
                  required 
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Expense Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={expenseForm.expense_date} 
                  onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Expense</button>
                <button type="button" className="btn btn-secondary" onClick={() => setExpenseModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
