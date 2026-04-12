import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppLayout.css';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarOpen ? 'sidebar-wrapper open' : 'sidebar-wrapper'}>
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="app-main">
        <Topbar onMenuToggle={() => setSidebarOpen(s => !s)} />
        <main className="app-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
