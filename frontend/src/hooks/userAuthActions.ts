import { useAuth } from '../context/userSessContext';
import { api } from '../services/api';
import type { Workout } from '../types/workout.types';
import type { Session } from '../context/userSessContext';

export const useAuthActions = () => {
    const { userSess, setUserSess } = useAuth();

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
            isEmailVerified: response.user.isEmailVerified,
            unlockedAchievements: userAchievements.map((ua: any) => ua.achievement.code),
        };

        setUserSess(session);
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
            isEmailVerified: response.user.isEmailVerified,
            unlockedAchievements: [],
        };

        setUserSess(session);
        return session;
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('session');
        setUserSess(undefined);
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

        if (userSess) {
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

    return {
        login,
        signup,
        logout,
        addWorkout
    };
};