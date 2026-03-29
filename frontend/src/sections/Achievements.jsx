import React, { useState, useEffect, useRef } from 'react';

// --- 1. Monochrome Theme Configuration ---
const theme = {
  bg: '#030812',          // Deepest Black/Blue
  cardBg: 'rgba(255, 255, 255, 0.02)',
  border: 'rgba(255, 255, 255, 0.08)',
  text: '#cbd5e1',        // Light Slate (Primary)
  textDim: '#64748b',     // Dark Slate (Secondary)
  white: '#ffffff',       // Highlight
  success: '#10B981',     // Subtle Green (Only for status indicators)
  fontDisplay: '"Orbitron", sans-serif',
  fontCode: '"Share Tech Mono", monospace',
};

// --- 2. SVG Icons (No Emojis) ---
const TrophyIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0 0 5H18" />
    <path d="M4 22h16" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

// --- 3. Hooks (Animation Logic) ---
const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        if (options.once) observer.disconnect();
      }
    }, { threshold: 0.1, ...options });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, isInView];
};

const Counter = ({ value, suffix = '+' }) => {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView({ once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(value);
    const duration = 1500;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// --- 4. UI Components ---

// Minimal Card Wrapper
const Card = ({ children, style, delay = 0 }) => {
  const [ref, isInView] = useInView({ once: true });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${isHovered ? theme.white : theme.border}`,
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(20px)',
        ...style
      }}
    >
      {children}
    </div>
  );
};

// Hover Text Effect (Smooth color shift, no glitch)
const HoverText = ({ children }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <span 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        transition: 'color 0.3s ease',
        color: isHovered ? theme.white : 'inherit',
        cursor: 'default'
      }}
    >
      {children}
    </span>
  );
};

// --- 5. Main Component ---

export default function Achievements() {
  const events = [
    { name: 'Cyber Odyssey 2024', location: '1337 KHOURIBGA' },
    { name: 'SparkSec Summit v1.0', location: 'UEMF' },
    { name: 'MCSC V12', location: 'ENSIAS RABAT' },
    { name: 'Alumni Day GTR', location: 'ENSA FES' }
  ];

  const sessions = [
    'Binary Exploitation', 'Web Hacking', 'Steganography',
    'Cloud Security', 'Network Analysis', 'SQL Injection'
  ];

  return (
    <section style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: theme.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8rem 0',
      color: theme.text,
      fontFamily: theme.fontCode
    }}>
      
      {/* Clean Header */}
      <div style={{ textAlign: 'center', marginBottom: '5rem', width: '100%' }}>
        <h2 style={{ 
            fontFamily: theme.fontDisplay, 
            fontSize: '3rem', 
            marginBottom: '1rem',
            color: theme.white,
            letterSpacing: '-2px'
        }}>
          HALL OF FAME
        </h2>
        <p style={{ 
            color: theme.textDim, 
            fontSize: '0.9rem', 
            letterSpacing: '2px',
            textTransform: 'uppercase' 
        }}>
          Excellence in Engineering & Security
        </p>
      </div>

      {/* Bento Grid */}
      <div style={{
        width: '90%',
        maxWidth: '1200px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, minmax(180px, auto))',
        gap: '1rem' // Tight spacing for dashboard feel
      }}>

        {/* 1. Media Feature (2M) */}
        <Card delay={0} style={{ gridColumn: 'span 2', gridRow: 'span 2', padding: 0, border: 'none' }}>
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format" 
            alt="Media Coverage"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              position: 'absolute', top: 0, left: 0,
              opacity: 0.2, 
              filter: 'grayscale(100%)' // Strict B&W
            }}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem',
            background: 'linear-gradient(to top, #030812, transparent)'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: theme.white, fontSize: '0.7rem', fontWeight: 'bold',
              letterSpacing: '1px', marginBottom: '1rem',
              border: `1px solid ${theme.border}`,
              padding: '6px 12px',
              width: 'fit-content',
              background: 'rgba(0,0,0,0.5)'
            }}>
              <PlayIcon /> FEATURED ON 2M TV
            </div>
            <h2 style={{ fontFamily: theme.fontDisplay, fontSize: '1.75rem', marginBottom: '0.5rem', color: theme.white }}>
              <HoverText>CyberTech Day V2.0</HoverText>
            </h2>
            <p style={{ color: theme.textDim, fontSize: '0.9rem', lineHeight: '1.6' }}>
              National coverage highlighting SecOps Club's impact on engineering education in Morocco.
            </p>
          </div>
        </Card>

        {/* 2. LinkedIn Stats */}
        <Card delay={100} style={{ alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', fontWeight: 700, fontFamily: theme.fontDisplay, color: theme.white, lineHeight: 1 }}>
            <Counter value={1229} />
          </div>
          <span style={{ color: theme.textDim, fontSize: '0.75rem', marginTop: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            LinkedIn Community
          </span>
        </Card>

        {/* 3. CTF Platform (Clean Status) */}
        <Card delay={150} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {/* Minimal Status Indicator */}
            <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: theme.textDim }}>SYSTEM STATUS</span>
                <span style={{ width: '6px', height: '6px', backgroundColor: theme.success, borderRadius: '50%' }}></span>
            </div>

            <div>
                <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: theme.fontDisplay, color: theme.white, lineHeight: 1 }}>
                    <Counter value={400} />
                </div>
                <div style={{ color: theme.text, fontSize: '1rem', marginTop: '0.5rem' }}>
                    Active CTF Users
                </div>
                <div style={{ color: theme.textDim, fontSize: '0.75rem', marginTop: '0.5rem', borderTop: `1px solid ${theme.border}`, paddingTop: '0.5rem' }}>
                    Proprietary Platform
                </div>
            </div>
        </Card>

        {/* 4. On Tour / Events List */}
        <Card delay={200} style={{ gridRow: 'span 2', justifyContent: 'flex-start' }}>
          <h3 style={{
            fontFamily: theme.fontDisplay, fontSize: '1rem', marginBottom: '1.5rem',
            color: theme.white, display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            // RECENT EVENTS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {events.map((e, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 400, color: theme.text, fontSize: '0.9rem' }}>{e.name}</div>
                <div style={{ fontSize: '0.7rem', color: theme.textDim, marginTop: '2px' }}>{e.location}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* 5. First Place Winner (Strict B&W) */}
        <Card delay={250} style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ 
                color: theme.white,
                border: `1px solid ${theme.border}`,
                padding: '1rem',
                display: 'flex', alignItems: 'center', justifyItems: 'center'
            }}>
                <TrophyIcon />
            </div>
            <div>
              <div style={{ 
                color: theme.textDim, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.25rem' 
              }}>
                Competition Results
              </div>
              <h4 style={{ fontFamily: theme.fontDisplay, fontSize: '1.5rem', marginBottom: '0.5rem', color: theme.white }}>
                Team "Old Timers"
              </h4>
              <p style={{ color: theme.text, fontSize: '0.85rem', marginBottom: '1rem' }}>
                Secured 1st Place at SecOps CTF, Alumni Day CTF & CyberTech Day V2.0.
              </p>
              <div style={{ fontSize: '0.75rem', color: theme.textDim }}>
                Abdennour Chahat  /  Anas Magane
              </div>
            </div>
          </div>
        </Card>

        {/* 6. Training Modules */}
        <Card delay={300} style={{ gridColumn: 'span 2' }}>
          <h3 style={{ fontFamily: theme.fontDisplay, fontSize: '1rem', marginBottom: '1.25rem', color: theme.white }}>
            // TRAINING MODULES
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {sessions.map((s, i) => (
              <span key={i} style={{
                padding: '0.4rem 0.8rem',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: `1px solid ${theme.border}`,
                fontSize: '0.75rem',
                color: theme.textDim,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.white;
                e.currentTarget.style.color = theme.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.color = theme.textDim;
              }}
              >
                {s}
              </span>
            ))}
          </div>
        </Card>

        {/* 7. Dedication (Minimal) */}
        <Card delay={350} style={{ alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: theme.fontDisplay, color: theme.white }}>
            100%
          </div>
          <span style={{ color: theme.textDim, fontSize: '0.7rem', marginTop: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Commitment
          </span>
        </Card>

      </div>

      {/* Footer Quote */}
      <div style={{ marginTop: '6rem', opacity: 0.4, fontSize: '0.85rem', letterSpacing: '3px' }}>
        FIND. UNDERSTAND. <span style={{ color: theme.white }}>SECURE.</span>
      </div>
      
    </section>
  );
}