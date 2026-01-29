import { useState, useEffect } from 'react';
import type { Workout } from './types/workout.types';
import { calculate1RM, calculateLevel, getXPForNextLevel } from './utils/calculations';
import { ACHIEVEMENTS } from './constants/achievements';

import { Header } from './components/layout/Header';
import { LevelCard } from './components/layout/LevelCard';
import { Navigation } from './components/layout/Navigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { WorkoutList } from './components/workouts/WorkoutList';
import { AddWorkoutModal } from './components/workouts/AddWorkoutModal';
import { AchievementGrid } from './components/achievements/AchievementGrid';
import { AchievementNotification } from './components/common/AchievementNotification';

const WorkoutTracker = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newAchievement, setNewAchievement] = useState<string | null>(null);+

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('workoutData');
    if (saved) {
      const data = JSON.parse(saved);
      setWorkouts(data.workouts || []);
      setTotalXP(data.totalXP || 0);
      setUnlockedAchievements(data.unlockedAchievements || []);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('workoutData', JSON.stringify({
      workouts,
      totalXP,
      unlockedAchievements
    }));
  }, [workouts, totalXP, unlockedAchievements]);

  const checkAchievements = (newWorkouts: Workout[], earnedXP: number) => {
    const unlocked: string[] = [...unlockedAchievements];
    let newUnlocks: string[] = [];

    // First workout
    if (newWorkouts.length === 1 && !unlocked.includes('FIRST_WORKOUT')) {
      unlocked.push('FIRST_WORKOUT');
      newUnlocks.push('FIRST_WORKOUT');
    }

    // 3 workouts in a week
    const lastWeek = newWorkouts.filter(w => {
      const diff = Date.now() - new Date(w.date).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    });
    if (lastWeek.length >= 3 && !unlocked.includes('THREE_IN_WEEK')) {
      unlocked.push('THREE_IN_WEEK');
      newUnlocks.push('THREE_IN_WEEK');
    }

    // 100 total workouts
    if (newWorkouts.length >= 100 && !unlocked.includes('TOTAL_100')) {
      unlocked.push('TOTAL_100');
      newUnlocks.push('TOTAL_100');
    }

    // 10 airbike workouts
    const airbikeCount = newWorkouts.filter(w => w.type === 'airbike').length;
    if (airbikeCount >= 10 && !unlocked.includes('AIRBIKE_BEAST')) {
      unlocked.push('AIRBIKE_BEAST');
      newUnlocks.push('AIRBIKE_BEAST');
    }

    if (newUnlocks.length > 0) {
      setUnlockedAchievements(unlocked);
      setNewAchievement(newUnlocks[0]);
      setTimeout(() => setNewAchievement(null), 3000);
    }
  };

  const addWorkout = (workout: Workout) => {
    let xpEarned = 50; // Base XP for workout
    
    if (workout.type === 'strength') {
      xpEarned += workout.exercises.length * 10;
      
      // Check for new PR
      workout.exercises.forEach(ex => {
        const best1RM = ex.sets.reduce((max, set) => {
          const rm = calculate1RM(set.weight, set.reps);
          return rm > max ? rm : max;
        }, 0);
        
        const previousBest = workouts
          .filter(w => w.type === 'strength')
          .flatMap(w => w.exercises)
          .filter(e => e.name === ex.name)
          .reduce((max, e) => {
            const rm = e.sets.reduce((m, s) => {
              const r = calculate1RM(s.weight, s.reps);
              return r > m ? r : m;
            }, 0);
            return rm > max ? rm : max;
          }, 0);
        
        if (best1RM > previousBest && previousBest > 0) {
          xpEarned += 20;
          if (!unlockedAchievements.includes('NEW_PR')) {
            setUnlockedAchievements([...unlockedAchievements, 'NEW_PR']);
            setNewAchievement('NEW_PR');
            setTimeout(() => setNewAchievement(null), 3000);
          }
        }
      });
    } else {
      xpEarned += 30; // Bonus for cardio
    }

    const newWorkouts = [...workouts, { ...workout, id: Date.now(), xpEarned }];
    setWorkouts(newWorkouts);
    setTotalXP(totalXP + xpEarned);
    checkAchievements(newWorkouts, xpEarned);
    setShowAddWorkout(false);
  };

  const level = calculateLevel(totalXP);
  const xpForNext = getXPForNextLevel(level);
  const xpProgress = ((totalXP - (level ** 2 * 100)) / (xpForNext - (level ** 2 * 100))) * 100;

  // Calculate stats
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

  // Prepare chart data
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      {/* Achievement Notification */}
      {newAchievement && (
        <AchievementNotification
          achievementName={ACHIEVEMENTS.find(a => a.id === newAchievement)?.name || ''}
        />
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <Header onAddWorkout={() => setShowAddWorkout(true)} />
        <LevelCard
          level={level}
          totalXP={totalXP}
          xpForNext={xpForNext}
          xpProgress={xpProgress}
        />
      </div>

      {/* Navigation */}
      <div className="max-w-6xl mx-auto mb-6">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
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
            unlockedAchievements={unlockedAchievements}
          />
        )}
      </div>

      {/* Add Workout Modal */}
      {showAddWorkout && (
        <AddWorkoutModal
          onClose={() => setShowAddWorkout(false)}
          onAdd={addWorkout}
        />
      )}
    </div>
  );
};

export default WorkoutTracker;