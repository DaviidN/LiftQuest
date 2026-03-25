import { createContext, useContext, useEffect, useState } from "react";
import type { Workout } from '../types/workout.types';

export interface Session {
    id: number;
    token: string;
    name: string;
    workouts: Workout[];
    totalXP: number;
    unlockedAchievements: string[];
}

type AuthContextType = {
    userSess: Session | undefined;
    setUserSess: (val: Session | undefined) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [userSess, setUserSess] = useState<Session | undefined>(undefined);

    useEffect(() => {
        const stored = localStorage.getItem("session");
        if (stored) setUserSess(JSON.parse(stored));
    }, []);


    return (
        <AuthContext.Provider value={{ userSess, setUserSess }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
};