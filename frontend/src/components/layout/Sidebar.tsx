import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  SlidersHorizontal, 
  Building2, 
  Factory, 
  PlusCircle, 
  Truck, 
  Info,
  X,
  LogIn
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sections = [
    {
      title: 'Marketplace Navigation',
      items: [
        { label: 'Overview Home', path: '/', icon: Compass },
        { label: 'CO₂ Marketplace', path: '/marketplace', icon: Building2 },
        { label: 'Match Results (ABC ⟷ GreenFuel)', path: '/matches/MATCH-101', icon: SlidersHorizontal },
        { label: 'Transaction Status (Live)', path: '/transactions/TXN-8801', icon: Truck },
      ]
    },
    {
      title: 'Supplier Hub (ABC Cement)',
      items: [
        { label: 'Supplier Dashboard', path: '/dashboard/supplier', icon: Factory },
        { label: 'Create Supply Listing', path: '/supplier/create-listing', icon: PlusCircle },
      ]
    },
    {
      title: 'Buyer Hub (GreenFuel)',
      items: [
        { label: 'Buyer Dashboard', path: '/dashboard/buyer', icon: Building2 },
        { label: 'Create Requirement', path: '/buyer/create-requirement', icon: PlusCircle },
      ]
    },
    {
      title: 'Identity & Access',
      items: [
        { label: 'Sign In / Switch Org', path: '/auth', icon: LogIn },
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
                <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.title}
                </h3>
                <div className="space-y-0.5">
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
                          `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                          }`
                        }
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Match Preview Badge */}
            <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 to-slate-950/90 p-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Info className="h-3.5 w-3.5" />
                <span>Active Prototype Match</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                <strong>ABC Cement</strong> (500t @ 96%) matched with <strong>GreenFuel</strong> (300t @ 95%) with 96% score.
              </p>
            </div>
          </div>

          {/* Bottom status */}
          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span>Rule-Based Match Engine</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              CarbonLoop Gujarat CCUS Pilot
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
