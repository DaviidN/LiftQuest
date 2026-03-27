export const calculate1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30)); // Epley formula
};

export const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100));

export const getXPForNextLevel = (currentLevel: number) => ((currentLevel + 1) ** 2) * 100;