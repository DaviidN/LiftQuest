import React, { useState } from "react";
import { X, Mail, User, Trash2, Lock } from "lucide-react";
import { Button } from "../UI/Button";
import { useAuth } from "../../context/userSessContext";
import { useLocation } from "wouter";
import { api } from "../../services/api";

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
}) => {
    
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [, setLocation] = useLocation();
    const { userSess, setUserSess } = useAuth();

    const handleDeleteProfile = async () =>{
        try{
            await api.deleteProfile();
            localStorage.removeItem('authToken');
            localStorage.removeItem('session');
            setUserSess(undefined);
            setLocation('/');
            onClose();
        } catch(err: any) {
            console.error('Failed to delete account:', err); 
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-secondary rounded-2xl max-w-lg w-full shadow-2xl border border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold">
                Settings
            </h2>
            <Button
                onClick={onClose}
                variant="tertiary"
            >
                <X className="w-6 h-6" />
            </Button>
            </div>
            {/*Settings Body*/}
            <div className="p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                   Account
                </h3>
                <div className="bg-slate-700/50 rounded-lg p-4 mb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                            <Mail size={20} className="text-slate-400 mt-0.5"/>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Email</p>
                                <p className="font-medium">{userSess?.email}</p>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setLocation("/update-user?field=email")}
                            >    
                            Update
                        </Button>
                    </div>
                </div>    
                <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                            <User size={20} className="text-slate-400 mt-0.5"/>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Username</p>
                                <p className="font-medium">{userSess?.username}</p>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setLocation("/update-user?field=username")}
                            >
                            Change
                        </Button>
                    </div>
                </div>
                {/* Security Section */}
                <div className="mt-3 pt-2 border-t border-slate-500">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Security
                    </h3>

                    <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                            <Lock size={20} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Password</p>
                                <p className="font-medium">••••••••</p>
                            </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setLocation("/update-user?field=password")}
                            >
                            Change
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Danger Zone */}
                {showDeleteConfirm ? 
                    <div className="mt-6 pt-2 border-t border-slate-500">
                        <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">
                            Danger zone
                        </h3>
                        <p className="text-sm text-red-400 pb-2">
                            This action cannot be undone! All your workouts, achievements, and data will be permanently deleted!
                        </p>
                        <div className="flex flex-row justify-between">
                            <Button 
                                variant="ghost" 
                                className="text-red-500 hover:bg-red-500/20"
                                onClick={() => handleDeleteProfile()}
                            >
                                <Trash2 size={18}/>
                                Delete Forever
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>

                :
                    <div className="mt-6 pt-2 border-t border-slate-500">
                        <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">
                            Danger zone
                        </h3>
                        <Button 
                            variant="ghost" 
                            className="text-red-500 hover:bg-red-500/20"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <Trash2 size={18}/>
                            Delete Account
                        </Button>
                    </div>
                }
            </div>
        </div>
        </div>
    );
};