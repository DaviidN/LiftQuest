import React from 'react';
import { Plus, LogIn } from 'lucide-react';
import { Button } from '../UI/Button';
import { UserMenu } from './UserMenu';
import type { Session } from '../../context/userSessContext';

interface HeaderProps {
  user: Session | undefined;
  onHeaderBtnClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onHeaderBtnClick}) => {

  function Logout () {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-between w-full mb-6 pt-2">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent pb-1 pr-2">
        Lift Quest
      </h1>
      {user == null ?
      <>
        <Button onClick={onHeaderBtnClick} icon={LogIn}>
          Login / Sign up
        </Button>
      </>
       : 
      <>
        <div className="flex items-center justify-between gap-4">
          <Button onClick={onHeaderBtnClick} icon={Plus}>
            New Workout
          </Button>
          <UserMenu username={user.name} onLogout={Logout} />
        </div>
      </>
    }
    </div>
  );
};