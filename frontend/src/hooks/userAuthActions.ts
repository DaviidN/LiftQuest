import { useEffect, useRef } from 'react';
import { useAuth } from '../context/userSessContext';
import { api } from '../services/api';
import type { Workout } from '../types/workout.types';
import type { Session } from '../context/userSessContext';

export const useAuthActions = () => {
    const { userSess, setUserSess } = useAuth();
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.login(email, password);
        
        localStorage.setItem('authToken', response.token);
        
        // Fetch full user data
        const [workouts, userAchievements] = await Promise.all([
            api.getWorkouts(),
            api.getUserAchievements(),
        ]);

        const session = {
            id: response.user.id,
            email: response.user.email,
            username: response.user.username,
            token: response.token,
            workouts: workouts,
            totalXP: response.user.totalXP,
            unlockedAchievements: userAchievements.map((ua: any) => ua.achievement.code),
        };

        if (isMounted.current) {
            setUserSess(session);
        }
        
        return session;
    };

    const signup = async (email: string, password: string, username: string) => {
        const response = await api.signup(email, password, username);
        
        localStorage.setItem('authToken', response.token);

        const session = {
            id: response.user.id,
            email: response.user.email,
            username: response.user.username,
            token: response.token,
            workouts: [],
            totalXP: response.user.totalXP,
            unlockedAchievements: [],
        };

        if (isMounted.current) {
            setUserSess(session);
        }

        return session;
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('session');
        if (isMounted.current) {
            setUserSess(undefined);
        }
    };

    const addWorkout = async (workout: Workout) => {
        const newWorkout = await api.createWorkout(workout);
        // Check for new achievements
        const unlockedAchievements = await api.checkAchievements();

        // Fetch updated data
        const [profile, workouts, userAchievements] = await Promise.all([
            api.getProfile(),
            api.getWorkouts(),
            api.getUserAchievements(),
        ]);

        if (isMounted.current && userSess) {
            const updatedSession: Session = {
                ...userSess,
                workouts: workouts,
                totalXP: profile.totalXP,
                unlockedAchievements: userAchievements.map((ua: any) => ua.achievement.code),
            };
            setUserSess(updatedSession);
        }

        return { newWorkout, unlockedAchievements };
    };

    const refreshSession = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const [profile, workouts, userAchievements] = await Promise.all([
            api.getProfile(),
            api.getWorkouts(),
            api.getUserAchievements(),
        ]);

        if (isMounted.current) {
            setUserSess({
                id: profile.id,
                email: profile.email,
                username: profile.username,
                token: token,
                workouts: workouts,
                totalXP: profile.totalXP,
                unlockedAchievements: userAchievements.map((ua: any) => ua.achievement.code),
            });
        }
    };

    return {
        login,
        signup,
        logout,
        addWorkout,
        refreshSession,
    };
};