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

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

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
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get profile');
    }

    return response.json();
  },

  async getStats() {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get stats');
    }

    return response.json();
  },

    async deleteProfile(userId: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/delete/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete profile');
    }

    return response.json();
  },

    async updateEmail(currentPassword: string,email: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/email`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ email, currentPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update email');
    }

    return response.json();
  },

  async updateUsername(username: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/username`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change username');
    }

    return response.json();
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update password');
    }

    return response.json();
  },

  // Workouts
  async getWorkouts() {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/workouts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get workouts');
    }

    return response.json();
  },

  async createWorkout(workout: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/workouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(workout),
    });

    if (!response.ok) {
      throw new Error('Failed to create workout');
    }

    return response.json();
  },

  async deleteWorkout(workoutId: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/workouts/${workoutId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete workout');
    }

    return response.json();
  },

  async getVolumeData(days: number = 30) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/workouts/volume?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get volume data');
    }

    return response.json();
  },

  // Achievements
  async getAchievements() {
    const response = await fetch(`${API_URL}/achievements`);

    if (!response.ok) {
      throw new Error('Failed to get achievements');
    }

    return response.json();
  },

  async getUserAchievements() {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/achievements/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user achievements');
    }

    return response.json();
  },

  async checkAchievements() {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/achievements/check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check achievements');
    }

    return response.json();
  },

  // Email verification
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
};