import type { Workout } from '../types/workout.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    totalXP: number;
    isEmailVerified: boolean;
  };
}

export interface SignupResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    totalXP: number;
    isEmailVerified: boolean;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  totalXP: number;
  createdAt: string;
  isEmailVerified: boolean;
  _count: {
    workouts: number;
    unlockedAchievements: number;
  };
}

let onUnauthorized: () => void = () => {};  

export const setUnauthorizedHandler = (fn: () => void) => {                                                                                               
  onUnauthorized = fn;
};

const handleLogout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("session");
  onUnauthorized();
};

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

const handleResponse = async (response: Response, defaultMessage: string) => {
  if (!response.ok) {
    if (response.status === 401) {
      const error = await response.json();
      handleLogout();
      throw new Error(error.message);
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || defaultMessage);
  }
  return response.json();
};

// API calls
export const api = {
  // Auth
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  async signup(email: string, password: string, username: string): Promise<SignupResponse> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  },

  // User
  async getProfile(): Promise<UserProfile> {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response, 'Failed to get profile');
  },

  async getStats() {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/stats`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response, 'Failed to get stats');
  },

  async deleteProfile() {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/delete`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response, 'Failed to delete profile');
  },

  async updateEmail(currentPassword: string, email: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/email`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ email, currentPassword }),
    });
    return handleResponse(response, 'Failed to update email');
  },

  async updateUsername(username: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/username`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username }),
    });
    return handleResponse(response, 'Failed to change username');
  },

  async resetPassword(newPassword: string, token: string) {
    const response = await fetch(`${API_URL}/users/reset-password?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset failed');
    }
    return response.json();
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(response, 'Failed to update password');
  },

  // Workouts
  async getWorkouts() {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/workouts`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response, 'Failed to get workouts');
  },

  async createWorkout(workout: Workout) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/workouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(workout),
    });
    return handleResponse(response, 'Failed to create workout');
  },

  async deleteWorkout(workoutId: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/workouts/${workoutId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response, 'Failed to delete workout');
  },

  async getVolumeData(days: number = 30) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/workouts/volume?days=${days}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response, 'Failed to get volume data');
  },

  // Achievements
  async getAchievements() {
    const response = await fetch(`${API_URL}/achievements`);
    if (!response.ok) throw new Error('Failed to get achievements');
    return response.json();
  },

  async getUserAchievements() {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/achievements/user`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response, 'Failed to get user achievements');
  },

  async checkAchievements() {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/achievements/check`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response, 'Failed to check achievements');
  },

  // Email 
  async verifyEmail(token: string): Promise<{ message: string; token?: string; user?: { id: string; email: string; username: string; totalXP: number; isEmailVerified: boolean } }> {
    const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Email verification failed');
    }

    return response.json();
  },

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to resend verification email');
    }

    return response.json();
  },

  async requestEmail(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/users/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    return response.json();
  },
};