import { useState, useEffect } from 'react';
import { useAuth } from './context/userSessContext';
import type { Workout } from './types/workout.types';
import { calculateLevel, getXPForNextLevel } from './utils/calculations';
import { api } from './services/api';
import { CircleQuestionMark } from 'lucide-react';
import { ACHIEVEMENTS } from './constants/achievements';
import { calculate1RM } from './utils/calculations';

import { Header } from './components/layout/Header';
import { LevelCard } from './components/layout/LevelCard';
import { Navigation } from './components/layout/Navigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { WorkoutList } from './components/workouts/WorkoutList';
import { AddWorkoutModal } from './components/workouts/AddWorkoutModal';
import { AchievementGrid } from './components/achievements/AchievementGrid';
import { AchievementNotification } from './components/common/AchievementNotification';
import { AuthModal } from './components/auth/AuthModal';

import { useAuthActions } from './hooks/userAuthActions';

const WorkoutTracker = () => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  const { userSess, isLoading } = useAuth();
  const { logout, addWorkout } = useAuthActions();
  
  // Load achievements on mount and after adding a workout
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const data = await api.getAchievements();
        setAchievements(data);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    };
    fetchAchievements();
  }, []);

 const handleAddWorkout = async (workout: Workout) => {
    try {
      const result = await addWorkout(workout);

      // Check for new achievements
      if (result.unlockedAchievements.length > 0) {
        setNewAchievement(result.unlockedAchievements[0]);
        setTimeout(() => setNewAchievement(null), 3000);
      }

      setShowAddWorkout(false);
    } catch (error) {
      console.error('Failed to add workout:', error);
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
  const strengthWorkouts = workouts.filter(w => w.type === 'strength');
  const airbikeWorkouts = workouts.filter(w => w.type === 'airbike');

  const currentStreak = (() => {
    if (workouts.length === 0) return 0;
    const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    let lastDate = new Date(sorted[0].date);

    for (let workout of sorted) {
      const workoutDate = new Date(workout.date);
      const diff = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 1) {
        streak++;
        lastDate = workoutDate;
      } else {
        break;
      }
    }
    return streak;
  })();

  const last30Days = workouts
    .filter(w => {
      const diff = Date.now() - new Date(w.date).getTime();
      return diff < 30 * 24 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const volumeData = last30Days
    .filter(w => w.type === 'strength')
    .map(w => ({
      date: new Date(w.date).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' }),
      volume: w.exercises.reduce((sum, ex) =>
        sum + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0
      )
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
          logOut={logout} 
          user={userSess}        
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
              airbikeWorkouts={airbikeWorkouts.length}
              currentStreak={currentStreak}
              volumeData={volumeData}
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
          <CircleQuestionMark className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400">Login to start your workout journey!</p>
        </div>
      }

      {/* Add Workout Modal */}
      {showAddWorkout && (
        <AddWorkoutModal
          onClose={() => setShowAddWorkout(false)}
          onAdd={handleAddWorkout}
        />
      )}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default WorkoutTracker;