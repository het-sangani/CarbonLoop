import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  SlidersHorizontal, 
  Building2, 
  Factory, 
  MapPin, 
  Cpu, 
  Info,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sections = [
    {
      title: 'Platform Navigation',
      items: [
        { label: 'Marketplace Home', path: '/', icon: Compass },
        { label: 'Feedstock & Streams', path: '/marketplace', icon: Building2 },
        { label: 'Matching Algorithm', path: '/matching', icon: SlidersHorizontal },
      ]
    },
    {
      title: 'Facility Types',
      items: [
        { label: 'Capture Point Sources', path: '/marketplace?type=emitter', icon: Factory },
        { label: 'Utilization Off-takers', path: '/marketplace?type=offtaker', icon: Cpu },
        { label: 'Transport Hubs', path: '/marketplace?type=logistics', icon: MapPin },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-white/10 bg-[#090d14]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4 overflow-y-auto">
          <div className="space-y-6">
            
            {/* Header in mobile */}
            <div className="flex items-center justify-between lg:hidden pb-2 border-b border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation</span>
              <button 
                onClick={onClose}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Section Lists */}
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={itemIdx}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={({ isActive }) => 
                          `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                          }`
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quick Summary Card */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Info className="h-4 w-4" />
                <span>Weighted Match Engine</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Multi-parameter scoring accounts for CO₂ purity, state, volume, transport radius, and economics.
              </p>
            </div>
          </div>

          {/* Bottom links */}
          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Engine Status</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Operational
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              CarbonLoop Protocol v0.1.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
