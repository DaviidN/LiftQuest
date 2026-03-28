import { useState } from 'react';
import type { Workout } from './types/workout.types';
import { calculate1RM, calculateLevel, getXPForNextLevel } from './utils/calculations';
import { ACHIEVEMENTS } from './constants/achievements';
import { CircleQuestionMark } from 'lucide-react';

import { Header } from './components/layout/Header';
import { LevelCard } from './components/layout/LevelCard';
import { Navigation } from './components/layout/Navigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { WorkoutList } from './components/workouts/WorkoutList';
import { AddWorkoutModal } from './components/workouts/AddWorkoutModal';
import { AchievementGrid } from './components/achievements/AchievementGrid';
import { AchievementNotification } from './components/common/AchievementNotification';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './context/userSessContext';

const WorkoutTracker = () => {
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  const { userSess, setUserSess } = useAuth();

  const checkAchievements = (newWorkouts: Workout[]) => {
    const unlocked: string[] = [...(userSess?.unlockedAchievements ?? [])];
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

    // New PR
    const hasNewPR = newWorkouts.some(w => w.type === 'strength' && w.prAchieved);
    if (hasNewPR && !unlocked.includes('NEW_PR')) {
      unlocked.push('NEW_PR');
      newUnlocks.push('NEW_PR');
    }

    // 5 PRs in a month
    const lastMonthPRs = newWorkouts
      .filter(w => {
        const diff = Date.now() - new Date(w.date).getTime();
        return w.type === 'strength' && w.prAchieved && diff < 30 * 24 * 60 * 60 * 1000;
      });

    if (lastMonthPRs.length >= 5 && !unlocked.includes('PR_MADNESS')) {
      unlocked.push('PR_MADNESS');
      newUnlocks.push('PR_MADNESS');
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
      setNewAchievement(newUnlocks[0]);
      setTimeout(() => setNewAchievement(null), 3000);
    }
      return unlocked;
  };

  const addWorkout = (workout: Workout) => {
    let xpEarned = 0; // Base XP for workout
    let newPR = false;

    // XP calculation based on workout type
    if (workout.type === 'strength') {
    workout.exercises.forEach(ex => {

      // Calculate 1RM for each set and find the best one
        const best1RM = ex.sets.reduce((max, set) => {
          const rm = calculate1RM(set.weight, set.reps);
          return rm > max ? rm : max;
        }, 0);

        // Previous best 1RM for this exercise
        const previousBest = userSess?.workouts
          .filter(w => w.type === 'strength')
          .flatMap(w => w.exercises)
          .filter(e => e.name === ex.name)
          .reduce((max, e) => {
            const rm = e.sets.reduce((m, s) => {
              const r = calculate1RM(s.weight, s.reps);
              return r > m ? r : m;
            }, 0);
            return rm > max ? rm : max;
          }, 0) ?? 0;
        
        // Bonus XP for new PR
        if (best1RM > previousBest && previousBest > 0) {
          xpEarned += 20;
          newPR = true;
        }

        // Base XP based on intensity for each set
        ex.sets.forEach(set => {
          const estimated1RM = calculate1RM(set.weight, set.reps);
          const intensity = set.weight / estimated1RM;

          let setXP = set.weight * set.reps * (1 + intensity);

          // Bonus for heavy singles/doubles/triples
          if (set.reps <= 3) {
            setXP *= 1.3;
          }

          xpEarned += Math.floor(setXP / 10);
        });
      });
    } else {
      // Airbike XP based on calories, time, and intensity
      const calPerMin = workout.calories / (workout.time / 60);
      const airBikeXP = workout.calories * 0.5 + calPerMin * 5 + workout.time * 0.2;
      xpEarned = Math.floor(airBikeXP / 10); // Scale down for balance
    }

    const newWorkouts = [...(userSess?.workouts ?? []), { ...workout, id: Date.now(), xpEarned, prAchieved: newPR }];
    const unlocked = checkAchievements(newWorkouts);

    // Update session
    if (userSess) {
      const mergedAchievements = Array.from(new Set([
        ...userSess.unlockedAchievements,
        ...unlocked,
        ...(newPR ? ['NEW_PR'] : [])
      ]));

    const updatedSess = {
      ...userSess,
      workouts: newWorkouts,
      totalXP: userSess.totalXP + xpEarned,
      unlockedAchievements: mergedAchievements
    };

    setUserSess(updatedSess);
    localStorage.setItem('session', JSON.stringify(updatedSess));
    }
  };

  const totalXP = userSess?.totalXP || 0;
  const level = calculateLevel(totalXP);
  const xpForNext = getXPForNextLevel(level);
  const xpProgress = ((totalXP - (level ** 2 * 100)) / (xpForNext - (level ** 2 * 100))) * 100;

  // Calculate stats
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
      <div className="min-h-screen w-screen max-sm:w-full mx-auto px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Achievement Notification */}
      {newAchievement && (
        <AchievementNotification
        achievementName={ACHIEVEMENTS.find(a => a.id === newAchievement)?.name || ''}
        />
      )}

      {/* Header */}
      <Header user={userSess} onHeaderBtnClick={() => !userSess ? setShowAuthModal(true) : setShowAddWorkout(true)} />

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
        onAdd={addWorkout}
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