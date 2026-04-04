const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// const API_URL = 'https://liftquest-be-production.up.railway.app/api';

// Types
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    totalXP: number;
  };
}

export interface SignupResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    totalXP: number;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  totalXP: number;
  createdAt: string;
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
};