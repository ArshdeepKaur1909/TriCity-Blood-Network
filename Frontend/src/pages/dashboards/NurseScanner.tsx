import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Droplet, Scan, CheckCircle2, XCircle, ArrowRight, RefreshCcw, Lock, AlertTriangle } from 'lucide-react';

type ScanStep = 'IDLE' | 'SCAN_PATIENT' | 'PATIENT_LOCKED' | 'SCAN_BAG' | 'ANALYZING' | 'MATCH' | 'FATAL';

export default function NurseScanner() {
  const [step, setStep] = useState<ScanStep>('IDLE');
  const [scannedBag, setScannedBag] = useState<{ id: string, type: string } | null>(null);
  const [loadingText, setLoadingText] = useState('INITIATING...');

  // Mock Patient Data
  const PATIENT = { id: 'PAT-7742', name: 'James Holden', dob: '1984-06-12', blood: 'O-' };

  // --- STATE MACHINE HANDLERS ---
  const startPatientScan = () => {
    setStep('SCAN_PATIENT');
    setTimeout(() => setStep('PATIENT_LOCKED'), 1500); 
  };

  const startBagScan = () => setStep('SCAN_BAG');

  const simulateScan = (isMatch: boolean) => {
    setStep('ANALYZING');
    setScannedBag(isMatch ? { id: 'UNIT-883A', type: 'O-' } : { id: 'UNIT-912X', type: 'A+' });
    
    // Cool Cybernetic Loading Sequence
    const steps = ['DECRYPTING HASH...', 'QUERYING LEDGER...', 'VERIFYING ANTIGENS...', 'FINALIZING...'];
    steps.forEach((text, i) => {
      setTimeout(() => setLoadingText(text), (i + 1) * 450);
    });

    setTimeout(() => {
      setStep(isMatch ? 'MATCH' : 'FATAL');
      setLoadingText('INITIATING...');
    }, 2200);
  };

  const reset = () => {
    setStep('IDLE');
    setScannedBag(null);
  };

  // --- DYNAMIC HUD VIEWFINDER ---
  const Viewfinder = ({ title, type }: { title: string, type: 'patient' | 'bag' }) => (
    <motion.div 
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} 
      animate={{ opacity: 1, backdropFilter: 'blur(12px)' }} 
      exit={{ opacity: 0 }} 
      style={{ position: 'absolute', inset: 0, background: 'rgba(3, 7, 18, 0.85)', zIndex: 50, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: '60px 24px 20px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900, letterSpacing: '0.2em', fontFamily: 'var(--font-display)', margin: '0 0 8px 0' }}>
          {title}
        </h2>
        <p style={{ color: '#06b6d4', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Scan size={14} className="animate-pulse" /> ALIGN BARCODE IN FRAME
        </p>
      </div>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 260, height: 260 }}>
          {/* HUD Corners */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTop: '3px solid #06b6d4', borderLeft: '3px solid #06b6d4' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTop: '3px solid #06b6d4', borderRight: '3px solid #06b6d4' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottom: '3px solid #06b6d4', borderLeft: '3px solid #06b6d4' }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottom: '3px solid #06b6d4', borderRight: '3px solid #06b6d4' }} />
          
          {/* Scanning Laser */}
          <motion.div 
            animate={{ top: ['0%', '98%', '0%'] }} 
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            style={{ position: 'absolute', left: 10, right: 10, height: 2, background: '#ef4444', boxShadow: '0 0 15px 3px rgba(239,68,68,0.8)' }} 
          />
        </div>
      </div>

      {/* BIG EASY DEMO BUTTONS */}
      {type === 'bag' && (
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => simulateScan(true)} style={{ width: '100%', padding: 18, background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: 8, cursor: 'pointer' }}>
            DEMO: PERFECT MATCH (O-)
          </button>
          <button onClick={() => simulateScan(false)} style={{ width: '100%', padding: 18, background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: 8, cursor: 'pointer' }}>
            DEMO: FATAL MISMATCH (A+)
          </button>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#000', fontFamily: 'var(--font-body)', display: 'flex', justifyContent: 'center' }}>
      
      {/* MOBILE DEVICE CONTAINER */}
      <div style={{ width: '100%', maxWidth: 480, background: '#09090b', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* --- APP HEADER --- */}
        <header style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 8, background: '#06b6d4', borderRadius: 8 }}>
              <Lock color="#000" size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Bedside Guard</div>
              <div style={{ fontSize: 10, color: '#06b6d4', fontFamily: 'var(--font-mono)', marginTop: 2, letterSpacing: '0.05em' }}>RN-4092 · ENCRYPTED</div>
            </div>
          </div>
        </header>

        {/* --- MAIN UI --- */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>

          <AnimatePresence>
            {step === 'SCAN_PATIENT' && <Viewfinder title="WRISTBAND TARGET" type="patient" />}
            {step === 'SCAN_BAG' && <Viewfinder title="BLOOD TAG TARGET" type="bag" />}
          </AnimatePresence>

          {/* MAIN DASHBOARD */}
          <AnimatePresence>
            {(step === 'IDLE' || step === 'PATIENT_LOCKED') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* PATIENT CARD */}
                <motion.div layout style={{ padding: 24, borderRadius: 16, border: `1px solid ${step === 'PATIENT_LOCKED' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`, background: step === 'PATIENT_LOCKED' ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: step === 'IDLE' ? 0 : 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <User color={step === 'PATIENT_LOCKED' ? '#10b981' : '#a1a1aa'} size={20} />
                      <span style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 11, color: step === 'PATIENT_LOCKED' ? '#10b981' : '#a1a1aa' }}>
                        Patient Identity
                      </span>
                    </div>
                    {step === 'PATIENT_LOCKED' && <CheckCircle2 color="#10b981" size={20} />}
                  </div>

                  {step === 'IDLE' ? (
                    <motion.button 
                      whileTap={{ scale: 0.95 }} onClick={startPatientScan} 
                      style={{ width: '100%', padding: 20, marginTop: 20, background: '#fff', color: '#000', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 12, border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                    >
                      <Scan size={16} /> Tap to Scan Wristband
                    </motion.button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <h3 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: '#fff', fontFamily: 'var(--font-display)' }}>{PATIENT.name}</h3>
                        <p style={{ fontSize: 12, color: '#a1a1aa', fontFamily: 'var(--font-mono)', margin: '4px 0 0 0' }}>{PATIENT.id}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.1em' }}>Verified Needs</span>
                        <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1, marginTop: 4 }}>{PATIENT.blood}</div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* BLOOD BAG CARD */}
                <motion.div layout style={{ padding: 24, borderRadius: 16, flex: 1, display: 'flex', flexDirection: 'column', border: `1px solid ${step === 'PATIENT_LOCKED' ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.05)'}`, background: step === 'PATIENT_LOCKED' ? 'rgba(6,182,212,0.05)' : 'rgba(255,255,255,0.01)', opacity: step === 'PATIENT_LOCKED' ? 1 : 0.3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <Droplet color={step === 'PATIENT_LOCKED' ? '#06b6d4' : '#a1a1aa'} size={20} />
                    <span style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 11, color: step === 'PATIENT_LOCKED' ? '#06b6d4' : '#a1a1aa' }}>
                      Donor Unit
                    </span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {step === 'IDLE' ? (
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AWAITING PATIENT LOCK</p>
                    ) : (
                      <motion.button 
                        initial={{ scale: 0.9 }} animate={{ scale: 1 }} whileTap={{ scale: 0.95 }}
                        onClick={startBagScan} 
                        style={{ width: '100%', padding: '24px', background: '#06b6d4', color: '#000', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: 13, border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: '0 0 30px rgba(6,182,212,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
                      >
                        <Scan size={24} /> SCAN BLOOD BAG
                      </motion.button>
                    )}
                  </div>
                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* HACKER LOADING SCREEN */}
          {step === 'ANALYZING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
              <ShieldCheck size={64} color="#06b6d4" style={{ animation: 'pulse-ring 1s infinite', marginBottom: 32 }} />
              <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, color: '#fff' }}>Cross-Matching</h2>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#06b6d4', letterSpacing: '0.1em' }}>{loadingText}</p>
            </motion.div>
          )}

          {/* --- RESULTS: PERFECT MATCH --- */}
          <AnimatePresence>
            {step === 'MATCH' && (
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'absolute', inset: 0, background: '#10b981', zIndex: 70, display: 'flex', flexDirection: 'column', color: '#fff' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
                  <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.1 }}>
                    <CheckCircle2 size={120} color="#fff" style={{ marginBottom: 24, filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.6))' }} />
                  </motion.div>
                  <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 8, fontFamily: 'var(--font-display)' }}>Match Secured</h1>
                  <p style={{ color: '#10b981', background: '#fff', padding: '6px 16px', borderRadius: 4, fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 40, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>Safe to Transfuse</p>
                  
                  <div style={{ width: '100%', background: 'rgba(0,0,0,0.15)', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.3)', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                      <span style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Patient Requires</span>
                      <span style={{ fontWeight: 900, fontSize: 24, fontFamily: 'var(--font-mono)' }}>{PATIENT.blood}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Donor Tag Scanned</span>
                      <span style={{ fontWeight: 900, fontSize: 24, fontFamily: 'var(--font-mono)' }}>{scannedBag?.type}</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0 24px 40px' }}>
                  <button onClick={reset} style={{ width: '100%', padding: 24, background: '#000', color: '#10b981', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 14, border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    FINISH PROTOCOL <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- RESULTS: FATAL MISMATCH --- */}
          <AnimatePresence>
            {step === 'FATAL' && (
              <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ position: 'absolute', inset: 0, background: '#ef4444', zIndex: 70, display: 'flex', flexDirection: 'column', color: '#fff', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 40px)' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.6) 100%)' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
                    <AlertTriangle size={120} color="#fff" style={{ marginBottom: 24, filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.8))', animation: 'pulse-ring 0.8s infinite' }} />
                  </motion.div>
                  <h1 style={{ fontSize: 38, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 12, fontFamily: 'var(--font-display)', lineHeight: 1 }}>Fatal Mismatch</h1>
                  <p style={{ color: '#ef4444', background: '#fff', padding: '8px 24px', borderRadius: 4, fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 40, boxShadow: '0 0 30px rgba(255,255,255,0.4)' }}>DO NOT TRANSFUSE</p>
                  
                  <div style={{ width: '100%', background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 24, border: '2px solid rgba(255,255,255,0.5)', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px dashed rgba(255,255,255,0.3)' }}>
                      <span style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 11, color: '#fca5a5' }}>Patient Requires</span>
                      <span style={{ fontWeight: 900, fontSize: 24, fontFamily: 'var(--font-mono)' }}>{PATIENT.blood}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 11, color: '#fca5a5' }}>Unit Scanned</span>
                      <span style={{ fontWeight: 900, fontSize: 24, fontFamily: 'var(--font-mono)' }}>{scannedBag?.type}</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0 24px 40px', background: 'rgba(0,0,0,0.6)', paddingTop: 20 }}>
                  <button onClick={reset} style={{ width: '100%', padding: 24, background: '#000', color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 13, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <RefreshCcw size={18} /> QUARANTINE & RESET
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}