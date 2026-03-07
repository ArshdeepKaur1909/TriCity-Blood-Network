import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MapPin, Award, Bell, Droplet, 
  Calendar, ShieldCheck, ChevronRight, Activity,
  CheckCircle2, Loader2, QrCode
} from 'lucide-react';

// --- MOCK DONOR DATA ---
const DONOR = {
  name: 'Alex Sharma',
  type: 'O-',
  status: 'ELIGIBLE',
  livesSaved: 12,
  donations: 4,
};

const NEARBY_CENTERS = [
  { name: 'GMCH-32', distance: '3.2 km', demand: 'CRITICAL (O- Match)', time: '10 min drive' },
  { name: 'PGIMER', distance: '8.5 km', demand: 'STABLE', time: '22 min drive' },
  { name: 'Fortis Mohali', distance: '12.1 km', demand: 'LOW', time: '35 min drive' },
];

const BADGES = [
  { id: 'b1', name: 'First Blood', desc: 'Completed first donation.', icon: <Droplet size={18} color="var(--red)" />, active: true },
  { id: 'b2', name: 'Universal Hero', desc: 'Donated O- during a Code Red.', icon: <Award size={18} color="var(--amber)" />, active: true },
  { id: 'b3', name: 'Night Owl', desc: 'Donated between 10PM and 4AM.', icon: <Activity size={18} color="var(--blue)" />, active: false },
  { id: 'b4', name: 'City Savior', desc: 'Donated 5+ times in one year.', icon: <ShieldCheck size={18} color="var(--green)" />, active: false },
];

export default function DonorPortal() {
  // --- DYNAMIC STATE ---
  const [liveAlert, setLiveAlert] = useState(false);
  const [bookingState, setBookingState] = useState<'IDLE' | 'PROCESSING' | 'CONFIRMED'>('IDLE');

  // Simulate a live emergency alert coming in from the War Room after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setLiveAlert(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Handle the gamified booking flow
  const handleBooking = () => {
    setBookingState('PROCESSING');
    
    // Simulate AI network handshake
    setTimeout(() => {
      setBookingState('CONFIRMED');
    }, 1800);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', fontFamily: 'var(--font-body)', paddingBottom: 80, color: 'var(--text-1)' }}>
      
      {/* --- HEADER --- */}
      <header style={{ 
        background: 'var(--bg-card)', borderBottom: '2px solid var(--text-1)', 
        padding: '16px 32px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', 
        alignItems: 'center', position: 'sticky', top: 0, zIndex: 40, boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={16} color="white" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
            Hemo<span style={{ color: 'var(--red)' }}>Globe</span> Donor
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--green-light)', border: '1px solid var(--green-border)', padding: '6px 12px', borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'blink 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{DONOR.status} TO DONATE</span>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-border)', border: '2px solid var(--text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>
            AS
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* --- DYNAMIC ACTIVE ALERT BANNER --- */}
        <AnimatePresence>
          {liveAlert && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -20 }} 
              animate={{ opacity: 1, height: 'auto', y: 0 }} 
              className="overflow-hidden"
            >
              <div style={{ 
                background: bookingState === 'CONFIRMED' ? 'var(--green)' : 'var(--red)', 
                color: 'white', padding: '24px', borderRadius: 4, 
                boxShadow: bookingState === 'CONFIRMED' ? '0 10px 30px rgba(5, 150, 105, 0.3)' : '0 10px 30px rgba(220,38,38,0.3)', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
                transition: 'background 0.5s ease, box-shadow 0.5s ease'
              }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: '50%' }}>
                    {bookingState === 'CONFIRMED' ? <CheckCircle2 size={24} /> : <Bell size={24} style={{ animation: 'pulse-ring 2s infinite' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.9, marginBottom: 4 }}>
                      {bookingState === 'CONFIRMED' ? 'Slot Confirmed — Fast Track Active' : 'Targeted Code Red Alert'}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                      {bookingState === 'CONFIRMED' 
                        ? <>Please proceed directly to <span style={{ fontWeight: 900, textDecoration: 'underline' }}>GMCH-32</span>.</> 
                        : <>GMCH-32 is critically low on <span style={{ fontWeight: 900, textDecoration: 'underline' }}>{DONOR.type}</span>. You are a perfect match.</>
                      }
                    </div>
                  </div>
                </div>
                
                {/* Dynamic Button State */}
                {bookingState === 'IDLE' && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBooking}
                    style={{ 
                      background: 'white', color: 'var(--red)', border: 'none', padding: '14px 24px', 
                      fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 2, boxShadow: 'var(--shadow-sm)'
                    }}>
                    Book Emergency Slot
                  </motion.button>
                )}
                
                {bookingState === 'PROCESSING' && (
                  <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Securing Slot...
                  </div>
                )}

                {bookingState === 'CONFIRMED' && (
                  <button style={{ 
                    background: 'white', color: 'var(--green)', border: 'none', padding: '14px 24px', 
                    fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 2, boxShadow: 'var(--shadow-sm)',
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <QrCode size={16} /> View Digital Pass
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {/* --- LEFT COLUMN: PROFILE & BADGES --- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Impact Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-display)', margin: 0 }}>{DONOR.name}</h2>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Universal Donor</p>
                </div>
                <div style={{ width: 64, height: 64, border: '3px solid var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--red-light)', borderRadius: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{DONOR.type}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, borderTop: '1px solid var(--bg-border)', paddingTop: 24 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>
                    {bookingState === 'CONFIRMED' ? DONOR.livesSaved + 3 : DONOR.livesSaved}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Lives Saved</div>
                </div>
                <div style={{ width: 1, background: 'var(--bg-border)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>
                     {bookingState === 'CONFIRMED' ? DONOR.donations + 1 : DONOR.donations}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Donations</div>
                </div>
              </div>
            </div>

            {/* Gamification Badges */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={14} color="var(--amber)" /> Achievement Badges
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {BADGES.map(badge => (
                  <motion.div 
                    key={badge.id} 
                    animate={
                      // If they booked an emergency slot, unlock the Night Owl badge dynamically for the demo!
                      (!badge.active && bookingState === 'CONFIRMED' && badge.id === 'b3') 
                        ? { opacity: 1, filter: 'none', backgroundColor: 'var(--bg-subtle)' } 
                        : {}
                    }
                    style={{ 
                    border: `1px solid ${badge.active ? 'var(--bg-border)' : 'var(--bg-border-2)'}`, 
                    background: badge.active ? 'var(--bg-subtle)' : 'var(--bg-page)', 
                    padding: 16, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 8,
                    opacity: badge.active ? 1 : 0.4, filter: badge.active ? 'none' : 'grayscale(100%)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ background: 'var(--bg-card)', padding: 6, borderRadius: '50%', border: '1px solid var(--bg-border)' }}>
                        {badge.icon}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-1)' }}>{badge.name}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-2)', marginTop: 2 }}>{badge.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: LIVE NETWORK & APPOINTMENTS --- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={14} color="var(--text-2)" /> Nearby Centers
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {NEARBY_CENTERS.map((center, i) => (
                  <motion.div 
                    key={i} 
                    animate={
                      // If GMCH-32 is booked, turn it green!
                      (bookingState === 'CONFIRMED' && center.name === 'GMCH-32')
                      ? { backgroundColor: 'var(--green-light)', borderColor: 'var(--green-border)' }
                      : {}
                    }
                    style={{ 
                    border: '1px solid var(--bg-border)', padding: 16, borderRadius: 4, 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: center.demand.includes('CRITICAL') ? 'var(--red-light)' : 'var(--bg-card)',
                    borderColor: center.demand.includes('CRITICAL') ? 'var(--red-border)' : 'var(--bg-border)'
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-1)' }}>{center.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)' }}>{center.distance} ({center.time})</span>
                      </div>
                      
                      {/* Change the status pill based on booking */}
                      {(bookingState === 'CONFIRMED' && center.name === 'GMCH-32') ? (
                        <div style={{ 
                          display: 'inline-block', marginTop: 8, fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 8px', border: '1px solid var(--green)', background: 'var(--green)', color: 'white'
                        }}>
                          SLOT RESERVED
                        </div>
                      ) : (
                        <div style={{ 
                          display: 'inline-block', marginTop: 8, fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 8px', border: '1px solid',
                          background: center.demand.includes('CRITICAL') ? 'var(--red)' : 'var(--bg-subtle)',
                          color: center.demand.includes('CRITICAL') ? 'white' : 'var(--text-2)',
                          borderColor: center.demand.includes('CRITICAL') ? 'var(--red)' : 'var(--bg-border)'
                        }}>
                          {center.demand}
                        </div>
                      )}
                    </div>
                    <button style={{ 
                      width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: (bookingState === 'CONFIRMED' && center.name === 'GMCH-32') ? 'var(--green)' : center.demand.includes('CRITICAL') ? 'var(--red)' : 'var(--text-1)', 
                      color: 'var(--bg-card)', border: 'none', borderRadius: '50%', cursor: 'pointer'
                    }}>
                      <ChevronRight size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Past Donations */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={14} color="var(--text-2)" /> Donation History
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--bg-border)' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-1)' }}>Whole Blood</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>GMCH-32 Mobile Camp</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>2025-11-10</div>
                  <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Verified</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}