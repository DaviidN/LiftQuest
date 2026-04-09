import React from 'react';
import { Plus, LogIn } from 'lucide-react';
import { Button } from '../UI/Button';
import { UserMenu } from './UserMenu';
import { useAuth } from '../../context/userSessContext';

interface HeaderProps {
  onHeaderBtnClick: () => void;
  showAccount: () => void;
}


export const Header: React.FC<HeaderProps> = ({ onHeaderBtnClick, showAccount }) => {

  const { userSess } = useAuth();
  
  return (
    <div className="flex items-center justify-between w-full mb-6 pt-2">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-heading-from to-heading-to bg-clip-text text-transparent pb-1 pr-2">
        Lift Quest
      </h1>
      <div className="flex items-center justify-between gap-4">
        <Button onClick={onHeaderBtnClick} icon={userSess ? Plus : LogIn}>
          { userSess ? "New Workout" : "Login / Sign up"}
        </Button>
        { userSess && <UserMenu showAccount={showAccount}/>}
      </div>
    </div>
  );
};