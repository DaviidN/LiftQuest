import React, { useState } from "react";
import { X, Mail, Lock, User } from "lucide-react";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { useAuthActions } from "../../hooks/userAuthActions";


interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [passVis, setPassVis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    username: false,
  });

  const { login, signup } = useAuthActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, username: true });
    
    if (!email || !password) return;
    if (mode === 'signup' && !username) return;

    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, username);
      }
      
      onClose();
    } catch (err: any) {
      setError(`${err.message.charAt(0).toUpperCase() + err.message.slice(1)}!` || 'Authentication failed!');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setEmail('');
    setPassword('');
    setUsername('');
    setTouched({ email: false, password: false, username: false }); // Reset touched on mode switch
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-secondary rounded-2xl max-w-md w-full shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold">
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </h2>
          <Button
            onClick={onClose}
            variant="tertiary"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-4 bg-slate-900/50">
          <Button 
            onClick={() => switchMode()}
            variant={mode === 'login' ? 'primary' : 'ghost'}
            className="flex-1"
          >
            Login
          </Button>
          <Button
            onClick={() => switchMode()}
            variant={mode === 'signup' ? 'primary' : 'ghost'}
            className="flex-1"
          >
            Sign Up
          </Button>
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
                <Input
                  type="text"
                  auth
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`pl-11 ${
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
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-11 ${
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
              <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 p-1 rounded-xl text-gray-400 hover:cursor-pointer hover:text-gray-300 hover:bg-slate-800" onClick={() => setPassVis(!passVis)}/>
              <Input
                auth
                type={ passVis ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-11 ${
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
            variant='primary'
            fullWidth
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
          <p className="text-gray-400 text-sm flex px-4 justify-center items-center gap-2">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Button
              variant="tertiary"
              onClick={switchMode}
              size="sm"
            >
              {mode === 'login' ? 'Sign up' : 'Log In'}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};