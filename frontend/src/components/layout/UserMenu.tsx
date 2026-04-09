import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, CheckCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { useAuth } from '../../context/userSessContext';
import { useAuthActions } from '../../hooks/userAuthActions';

interface UserMenuProps {
  showAccount: () => void
}

export const UserMenu: React.FC<UserMenuProps> = ({ showAccount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { userSess } = useAuth();
  const { logout } = useAuthActions();  

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        className="bg-slate-700 hover:bg-slate-600"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold" >
          {userSess ? userSess.username.charAt(0).toUpperCase() : 'G'}
        </div>
        <span className="font-medium">{userSess ? userSess.username : 'Guest'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-secondary border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-700">
            <div className='flex items-center gap-2'>
              <CheckCircle size={18} className={`mt-[-2px] ${
                userSess?.isEmailVerified
                ? `text-green-500`
                : `text-slate-500`
              } `}/>
              <p className="text-sm font-medium">{userSess?.username}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Manage your account</p>
          </div>
          {/* User settings */}
          <div className="border-t border-slate-700">
            <Button
              fullWidth
              menu
              size='md'
              variant='tertiary'
              onClick={() => {
                setIsOpen(false);
                showAccount();
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-400 border-none"
            >
              <User size={16} />
              <span className="text-sm font-medium">Settings</span>
            </Button>
          </div>
          {/* Logout */}
          <div className="border-t border-slate-700">
            <Button
              fullWidth
              menu
              size='md'
              variant='tertiary'
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="bg-slate-800 hover:bg-red-500/10 text-red-400 border-none"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Logout</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};