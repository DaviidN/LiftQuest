import { useEffect, useState } from 'react';
import { useSearch, useLocation } from 'wouter';
import { Loader2, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/userSessContext';
import { Button } from '../components/UI/Button';

type Status = 'loading' | 'error';

interface UserAchievement {
  achievement: { code: string };
}

export const OAuthCallback = () => {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { setUserSess } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(searchString);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('No token received from Google');
        return;
      }

      try {
        localStorage.setItem('authToken', token);

        const [profile, workouts, userAchievements] = await Promise.all([
          api.getProfile(),
          api.getWorkouts(),
          api.getUserAchievements(),
        ]);

        setUserSess({
          id: profile.id,
          email: profile.email,
          username: profile.username,
          token,
          workouts,
          totalXP: profile.totalXP,
          isEmailVerified: profile.isEmailVerified,
          unlockedAchievements: userAchievements.map((ua: UserAchievement) => ua.achievement.code),
        });

        setLocation('/');
      } catch (err: any) {
        localStorage.removeItem('authToken');
        setStatus('error');
        setMessage(err.message || 'Login failed');
      }
    };

    handleCallback();
  }, [searchString]);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-primary-from via-primary-via to-primary-to flex items-center justify-center p-4">
      <div className="bg-secondary rounded-2xl max-w-md w-full shadow-2xl border border-slate-700 p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={64} className="mx-auto mb-4 text-purple-400 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Signing you in...</h1>
            <p className="text-gray-400">Please wait.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={64} className="mx-auto mb-4 text-red-400" />
            <h1 className="text-2xl font-bold mb-2">Login Failed</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <Button variant="primary" onClick={() => setLocation('/')} fullWidth>
              Back to App
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
