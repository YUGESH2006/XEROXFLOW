import {
  Coins,
  History,
  LogOut,
  Moon,
  PlusCircle,
  Printer,
  ShieldAlert,
  Smartphone,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenProfile,
  darkMode,
  setDarkMode,
  isMobileFrame,
  setIsMobileFrame,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/95 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab(currentUser?.role === 'admin' ? 'admin' : 'dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2A5282] border border-slate-700 flex items-center justify-center text-[#FF8C42] shadow-inner group-hover:scale-105 transition-transform">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#FF8C42] bg-clip-text text-transparent">
                XeroxFlow
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded bg-[#FF8C42]/20 text-[#FF8C42] border border-[#FF8C42]/30">
                Campus Print
              </span>
            </div>
          </div>

          {/* Navigation Items (Desktop) */}
          {currentUser && (
            <nav className="hidden md:flex items-center space-x-1">
              {currentUser.role === 'admin' ? (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'admin'
                      ? 'bg-[#1E3A5F] text-white border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-[#FF8C42]" />
                  Admin Queue & Panel
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'dashboard'
                        ? 'bg-[#1E3A5F] text-white border border-slate-700'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('new-order')}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === 'new-order'
                        ? 'bg-[#FF8C42] text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    New Print Order
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === 'history'
                        ? 'bg-[#1E3A5F] text-white border border-slate-700'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <History className="w-4 h-4 text-slate-400" />
                    Order History
                  </button>
                  <button
                    onClick={() => setActiveTab('track')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'track'
                        ? 'bg-[#1E3A5F] text-white border border-slate-700'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Track Order
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Loyalty Points Pill (For Students/Staff) */}
            {currentUser && currentUser.role !== 'admin' && (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all text-xs sm:text-sm font-medium"
                title="View Loyalty Points History"
              >
                <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>{currentUser.points} Pts</span>
              </button>
            )}

            {/* Mobile View Switcher Toggle */}
            <button
              onClick={() => setIsMobileFrame((prev) => !prev)}
              className={`p-2 rounded-lg border text-xs sm:text-sm transition-colors flex items-center gap-1 ${
                isMobileFrame
                  ? 'bg-[#FF8C42]/20 text-[#FF8C42] border-[#FF8C42]/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title={isMobileFrame ? 'Switch to Desktop Layout' : 'Switch to Mobile App Preview'}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">{isMobileFrame ? 'Mobile View' : 'Full Layout'}</span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* User Profile Button / Logout */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1E3A5F] text-[#FF8C42] font-semibold flex items-center justify-center border border-slate-700 text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{currentUser.role} ({currentUser.username})</p>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile Navigation Subbar */}
        {currentUser && (
          <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs font-medium">
            {currentUser.role === 'admin' ? (
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-1 px-3 rounded ${activeTab === 'admin' ? 'text-[#FF8C42] font-bold bg-slate-800' : 'text-slate-400'}`}
              >
                Admin Queue
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-1 px-2 rounded ${activeTab === 'dashboard' ? 'text-[#FF8C42] font-bold bg-slate-800' : 'text-slate-400'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('new-order')}
                  className={`py-1 px-2.5 rounded flex items-center gap-1 ${activeTab === 'new-order' ? 'text-[#FF8C42] font-bold bg-slate-800' : 'text-slate-400'}`}
                >
                  <PlusCircle className="w-3.5 h-3.5" /> New Order
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-1 px-2 rounded ${activeTab === 'history' ? 'text-[#FF8C42] font-bold bg-slate-800' : 'text-slate-400'}`}
                >
                  History
                </button>
                <button
                  onClick={() => setActiveTab('track')}
                  className={`py-1 px-2 rounded ${activeTab === 'track' ? 'text-[#FF8C42] font-bold bg-slate-800' : 'text-slate-400'}`}
                >
                  Track Order
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
