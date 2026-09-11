import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { User as UserIcon, HardHat, Shield, ArrowRight, Loader2, Phone, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'citizen' | 'worker' | 'authority'>('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [phone, setPhone] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Citizen auth states
  const [citizenStep, setCitizenStep] = useState(0); // 0=phone, 1=otp, 2=aadhaar
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [citizenName, setCitizenName] = useState('');
  const [otp, setOtp] = useState('');



  const handleSendOTP = async () => {
    if (phone.length < 10 || (!isLoginMode && citizenName.length < 2)) {
      setError('Please enter valid details.');
      return;
    }
    setLoading(true);
    setError('');
    // Mock: simulate OTP sent after a brief delay
    setTimeout(() => {
      setCitizenStep(1);
      setLoading(false);
    }, 800);
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 4) return;
    setLoading(true);
    setError('');
    // Mock: accept '123456' or any 6-digit OTP for demo
    setTimeout(() => {
      if (otp === '123456' || otp.length === 6) {
        const mockUser = { _id: 'citizen-' + phone, phone: `+91${phone}`, name: citizenName || 'Citizen User', role: 'CITIZEN' as const };
        if (isLoginMode) {
          login('mock-citizen-token-' + Date.now(), mockUser);
          navigate('/citizen');
        } else {
          setCitizenStep(2);
        }
      } else {
        setError('Invalid OTP. Use 123456 for demo.');
      }
      setLoading(false);
    }, 800);
  };

  const handleAadhaarVerify = async () => {
    const dobInput = document.getElementById('aadhaar-dob') as HTMLInputElement;
    const fileInput = document.getElementById('aadhaar-pdf') as HTMLInputElement;
    const dob = dobInput?.value;
    const pdfFile = fileInput?.files?.[0];

    if (!citizenName || citizenName.length < 2) {
      setError('Please enter your full name as on Aadhaar.');
      return;
    }
    if (!dob) {
      setError('Please enter your date of birth.');
      return;
    }
    if (!pdfFile) {
      setError('Please select your Aadhaar PDF file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('phone', `+91${phone}`);
      formData.append('fullName', citizenName);
      formData.append('dateOfBirth', dob);
      formData.append('file', pdfFile);

      const res = await fetch('/api/v1/aadhaar/verify', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        login(data.data.accessToken, data.data.user);
        navigate('/citizen');
      } else {
        throw new Error(data.error?.message || 'Aadhaar verification failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Aadhaar verification failed. Check your name/DOB or PDF.');
    } finally {
      setLoading(false);
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'citizen') {
      if (citizenStep === 0) return handleSendOTP();
      if (citizenStep === 1) return handleVerifyOTP();
      if (citizenStep === 2) return handleAadhaarVerify();
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (activeTab === 'worker') {
        const res = await fetch('/api/v1/auth/worker-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ worker_id: workerId, password })
        });
        const data = await res.json();
        if (data.success) {
          login(data.data.accessToken, data.data.user);
          navigate('/worker');
        } else {
          throw new Error(data.error?.message || "Invalid worker credentials");
        }
        return;
      }

      if (activeTab === 'authority') {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          login(data.data.accessToken, data.data.user);
          navigate('/authority');
        } else {
          throw new Error(data.error?.message || "Invalid credentials");
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden pt-20">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-surface/80 backdrop-blur-xl border border-border rounded-[2rem] p-8 shadow-2xl relative z-10"
      >
        <div className="flex gap-2 mb-8 bg-background p-1 rounded-full border border-border">
          {[
            { id: 'citizen', icon: UserIcon, label: 'Citizen' },
            { id: 'worker', icon: HardHat, label: 'Worker' },
            { id: 'authority', icon: Shield, label: 'Authority' },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-zinc-800 text-foreground shadow-sm'
                  : 'text-muted hover:text-muted hover:bg-surface'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {activeTab === 'citizen' && 'Citizen Access'}
            {activeTab === 'worker' && 'Contractor Portal'}
            {activeTab === 'authority' && 'Command Center'}
          </h1>
          <p className="text-sm text-muted">
            {activeTab === 'citizen' && 'Enter your mobile number to access civic services.'}
            {activeTab === 'worker' && 'Enter your assigned Worker ID and PIN.'}
            {activeTab === 'authority' && 'Secure authorization required for gov officials.'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {activeTab === 'citizen' && citizenStep === 0 && (
            <div className="space-y-4">
              {!isLoginMode && (
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Full Legal Name</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground outline-none focus:border-primary/50 transition-colors placeholder-zinc-700"
                    placeholder="Enter your full name"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Mobile Number</label>
                <div className="flex items-center bg-background border border-border rounded-xl px-4 py-3.5">
                  <span className="text-muted font-bold mr-3">+91</span>
                  <input
                    type="tel"
                    className="bg-transparent outline-none flex-1 text-foreground font-mono placeholder-zinc-700"
                    placeholder="99999 99999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                  />
                </div>
              </div>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-medium">
                  {error}
                </motion.p>
              )}
              <button
                type="button"
                disabled={loading}
                onClick={handleSendOTP}
                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-foreground rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                {isLoginMode ? 'Send Secure OTP' : 'Sign Up & Send OTP'}
              </button>
              <p className="text-center text-sm font-bold text-muted">
                {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  {isLoginMode ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </div>
          )}

          {activeTab === 'citizen' && citizenStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-muted text-sm">We sent a secure code to +91{phone}</p>
              </div>
              <input
                type="text"
                placeholder="• • • • • •"
                className="w-full p-4 text-center tracking-[0.5em] text-2xl bg-background border border-border rounded-xl outline-none font-bold text-foreground"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-medium text-center">
                  {error}
                </motion.p>
              )}
              <button
                type="button"
                disabled={loading}
                onClick={handleVerifyOTP}
                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-foreground rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Verify OTP
              </button>
            </div>
          )}

          {activeTab === 'citizen' && citizenStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <ShieldCheck className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-foreground mb-1">Aadhaar Verification</h2>
                <p className="text-muted text-sm">Upload your Aadhaar PDF to cryptographically verify your identity.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Full Name (as on Aadhaar)</label>
                <input
                  type="text"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground outline-none focus:border-primary/50 transition-colors placeholder-zinc-700"
                  placeholder="e.g. ABHINAV KUMAR"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Date of Birth</label>
                <input
                  type="date"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground outline-none focus:border-primary/50 transition-colors placeholder-zinc-700 font-mono"
                  id="aadhaar-dob"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Aadhaar PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  id="aadhaar-pdf"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-muted outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-zinc-800 file:text-foreground hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-medium text-center">
                  {error}
                </motion.p>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={handleAadhaarVerify}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-foreground rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                Verify Aadhaar & Enter
              </button>
            </div>
          )}

          {activeTab === 'worker' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Worker ID</label>
                <input
                  type="text"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground outline-none focus:border-primary/50 transition-colors font-mono placeholder-zinc-700"
                  placeholder="e.g. W-882"
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">PIN / Password</label>
                <input
                  type="password"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground outline-none focus:border-primary/50 transition-colors placeholder-zinc-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {activeTab === 'authority' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Gov Email</label>
                <input
                  type="email"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground outline-none focus:border-primary/50 transition-colors placeholder-zinc-700"
                  placeholder="admin@civicpulse.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground outline-none focus:border-primary/50 transition-colors placeholder-zinc-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {error && activeTab !== 'citizen' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-medium text-center">
              {error}
            </motion.p>
          )}

          {activeTab !== 'citizen' && (
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 mt-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'worker' ? 'bg-yellow-500 hover:bg-yellow-400 text-black' :
                  'bg-red-600 hover:bg-red-500 text-foreground'
                } disabled:opacity-50`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Authorize Access <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
};
