import { useState, useEffect } from 'react';
import { useSearch, useLocation } from 'wouter';
import { CheckCircle, XCircle, Loader2, X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { useAuth } from '../context/userSessContext';

type FieldVariant = 'email' | 'username' | 'password' | 'request' | 'password_reset';

type Status = 'idle' | 'loading' | 'success' | 'error';



const FIELD_TITLES: Record<FieldVariant, string> = {
    email: 'Email Update',
    username: 'Change Username',
    password: 'Change Password',
    request: 'Request Password Change',
    password_reset: 'Password Reset'
};

const FIELD_LABELS: Record<FieldVariant, string> = {
    email: 'New Email',
    username: 'New Username',
    password: 'New Password',
    request: 'Your Email',
    password_reset: 'New Password'
};

const ICONS: Record<string, LucideIcon> = {
    email: Mail,
    username: User,
    password: Lock, 
    request: Mail,
    password_reset: Lock
}

export const UpdateUser = () => {
    const searchString = useSearch();
    const [, setLocation] = useLocation();
    const { userSess, setUserSess } = useAuth();

    const [field, setField] = useState<FieldVariant | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [value, setValue] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [status, setStatus] = useState<Status>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const IconComponent = (field? ICONS[field] : null) || Lock

    useEffect(() => {
        const params = new URLSearchParams(searchString);
        setToken(params.get('token'));
        const f = params.get('field');                                                                             
        const validFields: FieldVariant[] = ['email', 'username', 'password', 'request', 'password_reset'];                                     
        setField(validFields.includes(f as FieldVariant) ? (f as FieldVariant) : null);  
    }, [searchString]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!field) return;

        if ((field === 'password' || field === 'password_reset') && value !== confirmPassword) {
            setStatus('error');
            setErrorMessage('Passwords do not match.');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            if (field === 'email') {
                const res = await api.updateEmail(confirmPassword, value);
                if (userSess && res.token) {
                    localStorage.setItem('authToken', res.token);
                    setUserSess({ ...userSess, email: res.user.email, isEmailVerified: res.user.isEmailVerified });
                }
            } else if (field === 'username') {
                const res = await api.updateUsername(value);
                if (userSess && res.user) {
                    setUserSess({ ...userSess, username: res.user.username });
                }
            } else if (field === 'password') {
                await api.updatePassword(currentPassword, value);
            } else if (field === 'request'){
                await api.requestEmail(value);
            } else if (field === 'password_reset'){
                if(token) 
                await api.resetPassword(value, token);
            }
            setStatus('success');
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Something went wrong.');
        }
    };

    if ((!field || field === 'password_reset' && !token)) {
        return (
            <div className="min-h-screen w-screen bg-gradient-to-br from-primary-from via-primary-via to-primary-to flex items-center justify-center text-white p-4">
                <div className="relative flex flex-col text-center max-w-md">
                    <h1 className="text-8xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
                        404
                    </h1>
                    <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
                    <p className="text-slate-400 mb-8">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <Button
                        onClick={() => setLocation('/')}
                        variant="tertiary"
                        size="sm"
                        className="absolute -top-10 -right-20"
                    >
                        <X />
                        Back to dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-primary-from via-primary-via to-primary-to flex items-center justify-center p-4">
            <div className="bg-secondary rounded-2xl max-w-md w-full shadow-2xl border border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">{FIELD_TITLES[field]}</h2>
                    <Button onClick={() => setLocation('/')} variant="tertiary">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center gap-4 py-6 text-center">
                            <CheckCircle className="w-14 h-14 text-green-400" />
                            <p className="text-lg font-semibold text-white">
                                {field === 'email' && 'Email updated successfully!'}
                                {field === 'username' && 'Username changed successfully!'}
                                {(field === 'password' || field === 'password_reset') && 'Password changed successfully!'}
                                {field === 'request' && 'If an account exists for this email, you will receive a reset link shortly!'}
                            </p>
                            <Button onClick={() => setLocation('/')} variant="primary" size="sm">
                                Back to dashboard
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {field === 'password' && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-slate-400">Current Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 p-1 rounded-xl text-slate-400"/>
                                        <Input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                            auth
                                            className="pl-11"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowCurrentPassword((p) => !p)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 !p-1 text-slate-400"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-slate-400">{FIELD_LABELS[field]}</label>
                                <div className="relative">
                                    <IconComponent className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 p-1 rounded-xl text-slate-400"/>
                                    <Input
                                        type={(field === 'password' || field === 'password_reset') ? (showPassword ? 'text' : 'password') : (field === 'email' || field === 'request') ? 'email' : 'text'}
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder={field === 'email' ? 'Enter new email' : field === 'username' ? 'Enter new username' : field === 'request' ? 'Enter your email' : 'Enter new password'}
                                        auth
                                        className="pl-11"
                                    />
                                    {(field === 'password' || field === 'password_reset') && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowPassword((p) => !p)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 !p-1 text-slate-400"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {(field === 'password' || field === 'email' || field === 'password_reset') && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-slate-400">{field === 'email' ? "Password for confirmation " : "Confirm New Password"}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 p-1 rounded-xl text-slate-400"/>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder={field === 'email' ? "Enter password" : "Confirm New Password"}
                                            auth
                                            className="pl-11"
                                        />
                                    </div>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">
                                    <XCircle className="w-4 h-4 shrink-0" />
                                    {errorMessage}
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                            {field === 'request' ? "Sending..." : "Saving..."}
                                    </>
                                ) : (
                                    field === 'request' ? "Send email" : "Save changes"
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
