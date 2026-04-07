import { useState, useEffect } from 'react';
import { useSearch, useLocation } from 'wouter';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/UI/Button';

type VerificationStatus = 'loading' | 'success' | 'error';

export const VerifyEmail = () => {
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');
  const [, setLocation] = useLocation();
  const searchString = useSearch();

  useEffect(() => {
    const verifyToken = async () => {
      const params = new URLSearchParams(searchString);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await api.verifyEmail(token);
        setStatus('success');
        setMessage(response.message);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed');
      }
    };

    verifyToken();
  }, [searchString]);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-primary-from via-primary-via to-primary-to flex items-center justify-center p-4">
      <div className="bg-secondary rounded-2xl max-w-md w-full shadow-2xl border border-slate-700 p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Verifying your email...</h1>
            <p className="text-gray-400">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <Button
              variant="primary"
              onClick={() => setLocation('/')}
              fullWidth
            >
              Go to App
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <Button
              variant="primary"
              onClick={() => setLocation('/')}
              fullWidth
            >
              Go to App
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
