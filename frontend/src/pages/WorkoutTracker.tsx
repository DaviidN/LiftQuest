import { useState, useEffect } from 'react';
import { useAuth } from '../context/userSessContext';
import type { Workout, StrengthWorkout, CardioWorkout } from '../types/workout.types';
import { calculateLevel, getXPForNextLevel } from '../utils/calculations';
import { api } from '../services/api';
import { CircleQuestionMark } from 'lucide-react';
import { ACHIEVEMENTS } from '../constants/achievements';
import { calculate1RM } from '../utils/calculations';

import { Header } from '../components/layout/Header';
import { LevelCard } from '../components/layout/LevelCard';
import { Navigation } from '../components/layout/Navigation';
import { Dashboard } from '../components/dashboard/Dashboard';
import { WorkoutList } from '../components/workouts/WorkoutList';
import { AddWorkoutModal } from '../components/workouts/AddWorkoutModal';
import { AchievementGrid } from '../components/achievements/AchievementGrid';
import { AchievementNotification } from '../components/common/AchievementNotification';
import { AuthModal } from '../components/user/AuthModal';
import { SettingsModal } from '../components/user/SettingsModal';

import { useAuthActions } from '../hooks/userAuthActions';

export const WorkoutTracker = () => {
  const [achievements, setAchievements] = useState<{ code: string; name: string; icon: string }[]>([]);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  const { userSess, isLoading } = useAuth();
  const { addWorkout } = useAuthActions();

  // Load achievements on mount if user is logged in
  useEffect(() => {
    const fetchAchievements = async () => {
      if (!userSess) return;

      try {
        const data = await api.getAchievements();
        setAchievements(data);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    };
    fetchAchievements();
    }, [userSess]);


  const handleAddWorkout = async (workout: Workout): Promise<void> => {
    try {
      const result = await addWorkout(workout);

      // Check for new achievements
      if (result.unlockedAchievements.length > 0) {
        setNewAchievement(result.unlockedAchievements[0]);
        setTimeout(() => setNewAchievement(null), 3000);
      }

      setShowAddWorkout(false);
    } catch (error) {
      throw error;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-primary-from via-primary-via to-primary-to flex items-center justify-center text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Calculate stats
  const totalXP = userSess?.totalXP || 0;
  const level = calculateLevel(totalXP);
  const xpForNext = getXPForNextLevel(level);
  const xpProgress = ((totalXP - (level ** 2 * 100)) / (xpForNext - (level ** 2 * 100))) * 100;

  const workouts = userSess?.workouts || [];
  const strengthWorkouts = workouts.filter((w): w is StrengthWorkout => w.type === 'strength');
  const cardioWorkouts = workouts.filter((w): w is CardioWorkout => w.type === 'cardio');

  const workoutStreak = (() => {
    if (workouts.length === 0) return { current: 0, best: 0 };
    const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let best = 1;
    let current = 1;
    let lastDate = new Date(sorted[0].date);

    for (let i = 1; i < sorted.length; i++) {
      const workoutDate = new Date(sorted[i].date);
      const diff = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        current++;
        best = Math.max(best, current);
        lastDate = workoutDate;
      } else if (diff > 1){
        lastDate = workoutDate
        break;
      }
    }
    return {current, best};
  })();

  const last30 = (w: { date: string }) =>
    Date.now() - new Date(w.date).getTime() < 30 * 24 * 60 * 60 * 1000;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' });

  const strengthVolumeData = strengthWorkouts
    .filter(last30)
    .map(w => ({
      date: formatDate(w.date),
      volume: w.exercises.reduce((sum, ex) =>
        sum + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0
      )
    }));

  const cardioCaloriesData = cardioWorkouts
    .filter(last30)
    .map(w => ({
      date: formatDate(w.date),
      calories: w.calories
    }));

  return (
    <div className="min-h-screen w-screen max-sm:w-full mx-auto px-4 bg-gradient-to-br from-primary-from via-primary-via to-primary-to">
      {/* Achievement Notification */}
      {newAchievement && (
        <AchievementNotification
          achievementName={achievements.find(a => a.code === newAchievement)?.name || ''}
        />
      )}

      {/* Header */}
      <div className="w-full mb-6 p-2">
        <Header
          onHeaderBtnClick={userSess ? () => setShowAddWorkout(true) : () => setShowAuthModal(true)}
          showAccount={() => setShowAccountModal(true)}
        />
      </div>

      {userSess ?
        <>
          <div className="w-full mb-6 p-2">
            <LevelCard
              level={level}
              totalXP={totalXP}
              xpForNext={xpForNext}
              xpProgress={xpProgress}
              />
          </div>

          {/* Navigation */}
          <div className="w-full mb-6 p-2">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main Content */}
          <div className="w-full p-2">
            {activeTab === 'dashboard' && (
              <Dashboard
              strengthWorkouts={strengthWorkouts.length}
              cardioWorkouts={cardioWorkouts.length}
              workoutStreak={workoutStreak}
              strengthData={strengthVolumeData}
              cardioData={cardioCaloriesData}
              />
            )}

            {activeTab === 'workouts' && (
              <WorkoutList workouts={workouts} calculate1RM={calculate1RM} />
            )}

            {activeTab === 'achievements' && (
              <AchievementGrid
              achievements={ACHIEVEMENTS}
              unlockedAchievements={userSess?.unlockedAchievements}
              />
            )}
          </div>
        </>

        :
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
          <CircleQuestionMark className="w-16 h-16 mx-auto mb-4 "/>
          <p>Login to start your workout journey!</p>
        </div>
      }

      {/* Add Workout Modal */}
      {showAddWorkout && (
        <AddWorkoutModal
          onClose={() => setShowAddWorkout(false)}
          onAdd={handleAddWorkout}
        />
      )}
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
        />
      )}
      {/* User Settings Modal */}
      {showAccountModal && (
        <SettingsModal
          onClose={() => setShowAccountModal(false)}
        />
      )}
    </div>
  );
};
