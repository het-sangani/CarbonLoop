import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Factory, 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Building
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [role, setRole] = useState<'supplier' | 'buyer'>('supplier');
  const [email, setEmail] = useState('rajesh.varma@abccement.com');
  const [password, setPassword] = useState('••••••••••••');
  const [orgName, setOrgName] = useState('ABC Cement Ltd');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'supplier') {
        navigate('/dashboard/supplier');
      } else {
        navigate('/dashboard/buyer');
      }
    }, 600);
  };

  const setDemoSupplier = () => {
    setRole('supplier');
    setEmail('rajesh.varma@abccement.com');
    setOrgName('ABC Cement');
    setMode('signin');
  };

  const setDemoBuyer = () => {
    setRole('buyer');
    setEmail('procurement@greenfuel.in');
    setOrgName('GreenFuel SynTech');
    setMode('signin');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-glow-emerald mx-auto">
            <Activity className="h-6 w-6 text-slate-950 font-bold" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {mode === 'signin' ? 'Sign in to CarbonLoop' : 'Register Organization'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {mode === 'signin' 
              ? 'Access verified CCUS stream telemetry and matchmaking' 
              : 'Join the industrial carbon utilization network'}
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="glass-panel rounded-xl p-3 space-y-2 border-emerald-500/20 bg-slate-900/60">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
            ⚡ Quick Demo Logins
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={setDemoSupplier}
              className={`text-left rounded-lg p-2 border transition-all text-xs ${
                role === 'supplier' 
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' 
                  : 'border-white/5 bg-black/40 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-semibold flex items-center gap-1">
                <Factory className="h-3 w-3" />
                ABC Cement
              </div>
              <span className="text-[10px] text-slate-400">Supplier (500t)</span>
            </button>

            <button
              type="button"
              onClick={setDemoBuyer}
              className={`text-left rounded-lg p-2 border transition-all text-xs ${
                role === 'buyer' 
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300' 
                  : 'border-white/5 bg-black/40 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-semibold flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                GreenFuel
              </div>
              <span className="text-[10px] text-slate-400">Buyer (300t)</span>
            </button>
          </div>
        </div>

        {/* Card Form */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border-white/10 relative">
          
          {/* Signin / Register Toggle */}
          <div className="flex rounded-xl bg-slate-900/90 p-1 mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Organization Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('supplier')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                    role === 'supplier'
                      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                      : 'border-white/5 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <Factory className="h-4 w-4" />
                  <span>CO₂ Supplier</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                    role === 'buyer'
                      ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-400'
                      : 'border-white/5 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>CO₂ Buyer</span>
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Company / Entity Legal Name</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. ABC Cement Ltd"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Corporate Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Password</label>
                {mode === 'signin' && (
                  <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                    Forgot key?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 shadow-glow-emerald transition-all hover:bg-emerald-450 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'signin' ? `Enter as ${role === 'supplier' ? 'Supplier' : 'Buyer'}` : 'Complete Registration'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Guarantee */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Industrial credentials encrypted and ISO-14064 verifiable</span>
          </div>

        </div>

      </div>
    </div>
  );
};
