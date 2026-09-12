import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine if sidebar should be shown by default on desktop
  const showDesktopSidebar = location.pathname.startsWith('/marketplace');

  return (
    <div className="flex min-h-screen flex-col bg-[#080b11] text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation */}
      <Navbar 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        isSidebarOpen={sidebarOpen}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1">
        {(showDesktopSidebar || sidebarOpen) && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        )}

        <main className={`flex-1 overflow-x-hidden ${showDesktopSidebar ? 'lg:pl-0' : ''}`}>
          {children || <Outlet />}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
