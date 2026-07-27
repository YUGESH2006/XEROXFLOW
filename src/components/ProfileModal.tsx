import { Coins, GraduationCap, Phone, ShieldCheck, User as UserIcon, Wallet, X } from 'lucide-react';
import { User } from '../types';

interface ProfileModalProps {
  currentUser: User;
  onClose: () => void;
}

export function ProfileModal({ currentUser, onClose }: ProfileModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1E3A5F] text-[#FF8C42] font-bold text-xl flex items-center justify-center border border-slate-700">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{currentUser.name}</h2>
            <p className="text-xs text-slate-500 capitalize">
              {currentUser.role} • ID: {currentUser.username}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Coins className="w-4 h-4 text-amber-400" /> Loyalty Points
            </div>
            <p className="text-xl font-extrabold">{currentUser.points} Pts</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">₹{(currentUser.points / 10).toFixed(2)} Equivalent Value</p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300">
              <Wallet className="w-4 h-4 text-blue-400" /> Campus Wallet
            </div>
            <p className="text-xl font-extrabold">₹{currentUser.walletBalance.toFixed(2)}</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400">Pre-loaded Balance</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Department:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{currentUser.department}</span>
          </div>
          {currentUser.year && (
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Academic Year:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{currentUser.year}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Phone Contact:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{currentUser.phone}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Account Registered:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {new Date(currentUser.created).toLocaleDateString()}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#1E3A5F] text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
}
