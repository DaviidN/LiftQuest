import React from 'react';
import { Plus, LogIn } from 'lucide-react';
import { Button } from '../UI/Button';
import { UserMenu } from './UserMenu';
import type { Session } from '../../context/userSessContext';

interface HeaderProps {
  user: Session | undefined;
  onHeaderBtnClick: () => void;
  logOut: () => void;
}


export const Header: React.FC<HeaderProps> = ({ user, onHeaderBtnClick, logOut }) => {

  return (
    <div className="flex items-center justify-between w-full mb-6 pt-2">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-heading-from to-heading-to bg-clip-text text-transparent pb-1 pr-2">
        Lift Quest
      </h1>
      <div className="flex items-center justify-between gap-4">
        <Button onClick={onHeaderBtnClick} icon={user ? Plus : LogIn}>
          { user ? "New Workout" : "Login / Sign up"}
        </Button>
        { user && <UserMenu username={user.username} isVerified={user.isEmailVerified} onLogout={logOut} />}
      </div>
    </div>
  );
};