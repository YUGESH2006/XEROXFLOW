import { FormEvent, useState } from 'react';
import {
  GraduationCap,
  KeyRound,
  Lock,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { pbService } from '../../services/pocketbase';
import { User, UserRole } from '../../types';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Form Fields
  const [username, setUsername] = useState('21CS042');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('3rd Year');
  const [dob, setDob] = useState('2003-05-14');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 1-Click Demo Login Quick Handler
  const handleDemoLogin = async (demoUsername: string, role: UserRole) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await pbService.getUserByUsername(demoUsername, role);
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMsg('Demo user not found.');
      }
    } catch {
      setErrorMsg('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLoginMode) {
        // Login Flow
        if (!username.trim() || !password.trim()) {
          setErrorMsg('Please enter your username and password.');
          setLoading(false);
          return;
        }

        const user = await pbService.getUserByUsername(username, selectedRole);
        if (user) {
          onLoginSuccess(user);
        } else {
          // If user doesn't exist, auto-create student or staff demo session
          const newUser = await pbService.createUser({
            name: username.toUpperCase() + ' User',
            username: username.trim(),
            role: selectedRole,
            phone: phone || '+91 98765 00000',
            department: department || 'General Engineering',
            year: selectedRole === 'student' ? '3rd Year' : undefined,
            dob: dob,
            points: 50,
            walletBalance: 200,
          });
          onLoginSuccess(newUser);
        }
      } else {
        // Signup Flow
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (!username.trim() || !name.trim() || !phone.trim()) {
          setErrorMsg('Please fill in all required fields.');
          setLoading(false);
          return;
        }

        const existing = await pbService.getUserByUsername(username);
        if (existing) {
          setErrorMsg('Username / Roll No already registered. Please login.');
          setLoading(false);
          return;
        }

        const newUser = await pbService.createUser({
          name: name.trim(),
          username: username.trim(),
          role: selectedRole,
          phone: phone.trim(),
          department: department,
          year: selectedRole === 'student' ? year : undefined,
          dob: selectedRole === 'student' ? dob : undefined,
          points: selectedRole === 'student' ? 50 : 100, // Welcome Bonus Points!
          walletBalance: 250,
        });

        onLoginSuccess(newUser);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg('Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1E3A5F] to-[#2A5282] text-[#FF8C42] shadow-xl border border-slate-700 mb-4">
          <Printer className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome to <span className="text-[#FF8C42]">XeroxFlow</span>
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Campus High-Speed Xerox & Document Printing Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800">
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('student');
                  setUsername('21CS042');
                  setPassword('password123');
                }}
                className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'student'
                    ? 'bg-[#1E3A5F] text-white shadow-md font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-[#FF8C42]" />
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('staff');
                  setUsername('STF-809');
                  setPassword('password123');
                }}
                className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'staff'
                    ? 'bg-[#1E3A5F] text-white shadow-md font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4 text-[#FF8C42]" />
                Faculty/Staff
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setUsername('ADMIN01');
                  setPassword('admin123');
                }}
                className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-[#1E3A5F] text-white shadow-md font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#FF8C42]" />
                Admin
              </button>
            </div>
          </div>

          {/* Quick Demo Login Preset Buttons */}
          <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Accounts
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400">Pre-seeded & Ready</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('21CS042', 'student')}
                className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/50 rounded-lg text-[11px] font-medium text-slate-800 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors text-center"
              >
                🎓 Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('STF-809', 'staff')}
                className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/50 rounded-lg text-[11px] font-medium text-slate-800 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors text-center"
              >
                👨‍🏫 Faculty Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('ADMIN01', 'admin')}
                className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/50 rounded-lg text-[11px] font-medium text-slate-800 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors text-center"
              >
                🛡️ Admin Demo
              </button>
            </div>
          </div>

          {/* Mode Selector (Login vs Signup) */}
          {selectedRole !== 'admin' && (
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setIsLoginMode(true)}
                className={`flex-1 py-2.5 text-center text-sm font-medium border-b-2 transition-colors ${
                  isLoginMode
                    ? 'border-[#FF8C42] text-[#FF8C42] font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Account Login
              </button>
              <button
                type="button"
                onClick={() => setIsLoginMode(false)}
                className={`flex-1 py-2.5 text-center text-sm font-medium border-b-2 transition-colors ${
                  !isLoginMode
                    ? 'border-[#FF8C42] text-[#FF8C42] font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                New Registration
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Identifier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {selectedRole === 'student'
                  ? 'Roll Number / Registration No'
                  : selectedRole === 'staff'
                  ? 'Staff Employee ID'
                  : 'Admin ID'}
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    selectedRole === 'student'
                      ? 'e.g. 21CS042'
                      : selectedRole === 'staff'
                      ? 'e.g. STF-809'
                      : 'ADMIN01'
                  }
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Signup Additional Fields */}
            {!isLoginMode && selectedRole !== 'admin' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {selectedRole === 'student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Academic Year
                      </label>
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent text-slate-900 dark:text-white"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Post Graduate">Post Graduate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {!isLoginMode && selectedRole !== 'admin' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#1E3A5F] to-[#2A5282] text-white font-semibold rounded-xl shadow-md hover:from-[#162C48] hover:to-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-[#FF8C42] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLoginMode || selectedRole === 'admin' ? (
                <>
                  <UserCheck className="w-4 h-4 text-[#FF8C42]" /> Login to Dashboard
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-[#FF8C42]" /> Register & Get 50 Bonus Points
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
