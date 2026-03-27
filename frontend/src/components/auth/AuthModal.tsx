import React, { useState } from "react";
import { X, Mail, Lock, User } from "lucide-react";
import { Button } from "../UI/Button";
import { useAuth } from "../../context/userSessContext";

interface AuthModalProps {
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  loading = false,
  error = null,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    username: false,
  });

  const { setUserSess } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, username: true });
    
    if (!email || !password) return;
    if (mode === 'signup' && !username) return;

    if (mode === 'login') {
      // Mock login function
      const mockSession = {
        id: 1,
        token: 'mock-token',
        name: "username",
        workouts: [],
        totalXP: 0,
        unlockedAchievements: []
      };
      localStorage.setItem('session', JSON.stringify(mockSession));
      setUserSess(mockSession);
      onClose();
    } else {
      // Mock signup function (same as login for demo)
      const mockSession = {
        id: 1,
        token: 'mock-token',
        name: "username",
        workouts: [],
        totalXP: 0,
        unlockedAchievements: []
      };
      localStorage.setItem('session', JSON.stringify(mockSession));
      setUserSess(mockSession);
      onClose();
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setTouched({ email: false, password: false, username: false });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            {mode === 'login' ? 'Přihlášení' : 'Registrace'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-4 bg-slate-900/50">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setTouched({ ...touched, username: true })}
                  className={`w-full bg-slate-700 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                    touched.username && !username
                      ? 'ring-2 ring-red-500 focus:ring-red-500'
                      : 'focus:ring-purple-500'
                  }`}
                />
              </div>
              {touched.username && !username && (
                <p className="text-red-400 text-sm mt-1">User name is required</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                className={`w-full bg-slate-700 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                  touched.email && !email
                    ? 'ring-2 ring-red-500 focus:ring-red-500'
                    : 'focus:ring-purple-500'
                }`}
              />
            </div>
            {touched.email && !email && (
              <p className="text-red-400 text-sm mt-1">Email is required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                className={`w-full bg-slate-700 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                  touched.password && !password
                    ? 'ring-2 ring-red-500 focus:ring-red-500'
                    : 'focus:ring-purple-500'
                }`}
              />
            </div>
            {touched.password && !password && (
              <p className="text-red-400 text-sm mt-1">Password is required</p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading || !email || !password || (mode === 'signup' && !username)}
            className="mt-6"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </div>
            ) : mode === 'login' ? (
              'Log In'
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="p-6 pt-0 text-center">
          <p className="text-gray-400 text-sm">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={switchMode}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};