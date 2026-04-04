import { createContext, useContext, useEffect, useState } from "react";
import type { Workout } from '../types/workout.types';

export interface Session {
    id: string;
    email: string;
    username: string;
    token: string;
    workouts: Workout[];
    totalXP: number;
    unlockedAchievements: string[];
}

type AuthContextType = {
    userSess: Session | undefined;
    setUserSess: (val: Session | undefined) => void;
    isLoading: boolean;
    setIsLoading: (val: boolean) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [userSess, setUserSess] = useState<Session | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSession = async () => {
            const token = localStorage.getItem("authToken");
            const storedSession = localStorage.getItem("session");
            
            if (token && storedSession) {
                try {
                    setUserSess(JSON.parse(storedSession));
                } catch (error) {
                    console.error("Failed to parse session:", error);
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("session");
                }
            }
            setIsLoading(false);
        };

        loadSession();
    }, []);

    // Save to localStorage whenever userSess changes
    useEffect(() => {
        if (userSess) {
            localStorage.setItem("session", JSON.stringify(userSess));
        } else {
            localStorage.removeItem("session");
        }
    }, [userSess]);

    return (
        <AuthContext.Provider value={{ userSess, setUserSess, isLoading, setIsLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
};