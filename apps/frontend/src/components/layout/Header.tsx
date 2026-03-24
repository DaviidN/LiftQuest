import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../UI/Button';
import type { Session } from '../../App';
  
interface HeaderProps {
  user: Session[];
  onHeaderBtnClick: () => void;
}

function Logout () {
        localStorage.clear();
        window.location.reload();
};

export const Header: React.FC<HeaderProps> = ({ user, onHeaderBtnClick }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent pb-1">
        Lift Quest
      </h1>
      {user[0] == null ?
      <>
        <Button onClick={onHeaderBtnClick} icon={Plus}>
          Login
        </Button>
      </>
       : 
      <>
        <div className="flex items-center justify-between gap-4">
          <Button onClick={Logout} icon={Plus}>
            Logout
          </Button>
          <Button onClick={onHeaderBtnClick} icon={Plus}>
            New Workout
          </Button>
        </div>
      </>
    }
    </div>
  );
};