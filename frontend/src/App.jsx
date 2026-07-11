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
  UserCheck
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

const LogoComponents = {
  MotorolaLogo,
  DellLogo,
  HpLogo,
  AsusLogo
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

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.charom-resq.com/api';

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
    return window.location.pathname === '/admin' ? 'admin' : 'home';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

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
      if (window.location.pathname === '/admin') {
        setActiveTab('admin');
      } else {
        setActiveTab((prev) => prev === 'admin' ? 'home' : prev);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Update path on tab selection
  useEffect(() => {
    if (activeTab === 'admin') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else {
      if (window.location.pathname === '/admin') {
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
            <MotorolaLogo size={28} style={{ color: 'var(--color-moto)', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: '1.1' }}>Motorola Service Center</span>
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
        {activeTab === 'track' && <TrackStatusView />}
        {activeTab === 'contact' && <ContactView />}
        {activeTab === 'admin' && <AdminView />}
      </main>

      {/* Quick Mobile Action Floating Buttons */}
      <div className="quick-contact-bar">
        <a href="https://wa.me/918795427739?text=Hi%2C%20I%20want%20to%20inquire%20about%20a%20repair." target="_blank" rel="noopener noreferrer" className="contact-bubble whatsapp" aria-label="WhatsApp Inquiry">
          <MessageSquare />
        </a>
        <a href="tel:+918795427739" className="contact-bubble call" aria-label="Call Service Center">
          <Phone />
        </a>
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
            <MotorolaLogo size={22} style={{ color: 'var(--color-moto)' }} />
            <span>Motorola Service Center</span>
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
          {servicesData.map((brand) => {
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
                <MotorolaLogo size={28} style={{ display: 'block', margin: '0 auto 8px', color: formData.brand === 'Motorola' ? 'var(--color-moto)' : 'var(--text-secondary)' }} />
                Motorola (Mobile)
              </div>
              <div className={`brand-option-card ${formData.brand === 'Dell' ? 'selected' : ''}`} onClick={() => handleBrandSelect('Dell')}>
                <DellLogo size={28} style={{ display: 'block', margin: '0 auto 8px', color: formData.brand === 'Dell' ? 'var(--color-dell)' : 'var(--text-secondary)' }} />
                Dell (Laptop)
              </div>
              <div className={`brand-option-card ${formData.brand === 'HP' ? 'selected' : ''}`} onClick={() => handleBrandSelect('HP')}>
                <HpLogo size={28} style={{ display: 'block', margin: '0 auto 8px', color: formData.brand === 'HP' ? 'var(--color-hp)' : 'var(--text-secondary)' }} />
                HP (Laptop)
              </div>
              <div className={`brand-option-card ${formData.brand === 'Asus' ? 'selected' : ''}`} onClick={() => handleBrandSelect('Asus')}>
                <AsusLogo size={28} style={{ display: 'block', margin: '0 auto 8px', color: formData.brand === 'Asus' ? 'var(--color-asus)' : 'var(--text-secondary)' }} />
                Asus (Laptop)
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'left', marginTop: '12px' }}>
              * We only repair Motorola mobiles. For laptops, we service Dell, HP, and Asus.
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
function TrackStatusView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
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
            placeholder="e.g. MOTO-8302 or 8795427739"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
            {loading ? 'Searching...' : 'Search'} <Search size={16} />
          </button>
        </form>

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
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ticket ID: {repair.ticket_id}</p>
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
                  <div className="contact-method-detail">+91 7458976787 / +91 8795427739</div>
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

              <div className="contact-method">
                <div className="contact-method-icon">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="contact-method-title">Visit Our Center</div>
                  <div className="contact-method-detail">
                    Basment floor, gata, Axis bank Charom Enterprises, 55, Raibareli Rd, Naka, Usroo, Faizabad, Uttar Pradesh 224001
                  </div>
                </div>
              </div>
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
function AdminView() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [repairs, setRepairs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeAdminTab, setActiveAdminTab] = useState('repairs'); // 'repairs', 'messages'
  const [updatingId, setUpdatingId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple default matching backend env
      setIsAuthenticated(true);
      setError('');
      fetchAdminData();
    } else {
      setError('Invalid admin password.');
    }
  };

  // Fetch all bookings and contacts
  const fetchAdminData = async () => {
    try {
      // Get repairs
      const repairsRes = await fetch(`${API_BASE}/admin/repairs`, {
        headers: { 'x-admin-password': password }
      });
      const repairsData = await repairsRes.json();
      if (repairsRes.ok) setRepairs(repairsData);

      // Get contacts
      const contactsRes = await fetch(`${API_BASE}/admin/contacts`, {
        headers: { 'x-admin-password': password }
      });
      const contactsData = await contactsRes.json();
      if (contactsRes.ok) setContacts(contactsData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  // Trigger fetch updates when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  // Update repair status
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
        // Update local state
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

  // Filter repairs locally
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '20px' }}>Enter the admin password configured in your environment.</p>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '6px', color: '#f87171', fontSize: '0.8rem', marginBottom: '16px', textAlign: 'left' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin_pass">Password</label>
              <input
                type="password"
                id="admin_pass"
                className="form-input"
                placeholder="Enter password (default: admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Authenticate <ChevronRight size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, textAlign: 'left' }}>Management Panel</h2>
        <button className="btn btn-secondary" onClick={() => setIsAuthenticated(false)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          Logout <LogOut size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${activeAdminTab === 'repairs' ? 'active' : ''}`} onClick={() => setActiveAdminTab('repairs')}>
          Repair Tickets ({repairs.length})
        </button>
        <button className={`admin-tab ${activeAdminTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveAdminTab('messages')}>
          Contact Messages ({contacts.length})
        </button>
      </div>

      {/* Repair Tickets Management */}
      {activeAdminTab === 'repairs' && (
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

      {/* Contact Messages Management */}
      {activeAdminTab === 'messages' && (
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
                      <td style={{ color: 'var(--text-primary)', fontSize: '0.8rem', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{msg.message}</td>
                      <td>{new Date(msg.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
