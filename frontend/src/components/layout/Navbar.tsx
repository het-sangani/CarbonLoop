import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Layers, 
  Search, 
  SlidersHorizontal, 
  Menu, 
  X, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { name: 'Marketplace', path: '/marketplace', icon: Search },
    { name: 'Matching Engine', path: '/matching', icon: SlidersHorizontal },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#080b11]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand & Sidebar Trigger */}
        <div className="flex items-center gap-4">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800/80 hover:text-white lg:hidden"
              title="Toggle Sidebar"
            >
              <Layers className="h-5 w-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 shadow-glow-emerald">
              <Activity className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Carbon<span className="text-emerald-400">Loop</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 -mt-1 font-medium">
                CCUS Exchange
              </span>
            </div>
          </Link>

          {/* Network Status Badge */}
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Network Live: <strong>1.4M tCO₂/yr</strong> indexed</span>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              isActive('/') 
                ? 'bg-slate-800/80 text-emerald-400 shadow-sm' 
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            Overview
          </Link>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-slate-800/80 text-emerald-400 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 border border-slate-800 rounded-lg px-2.5 py-1.5 bg-slate-900/50">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>ISO 14064 Aligned</span>
          </div>
          <Link
            to="/marketplace"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-450 px-4 py-2 text-sm font-semibold text-slate-950 transition-all shadow-glow-emerald hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explore Market</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#0c1017] px-4 py-4 md:hidden">
          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              Overview
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-800">
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-center text-sm font-semibold text-slate-950 shadow-glow-emerald"
              >
                Explore Market
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
