
import { GoogleGenAI } from "@google/genai";
import { UserProfile, Meal, WorkoutSession, Language } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY || '';
  // In a real production app, we should handle missing keys gracefully,
  // but for this demo context we assume it exists or fail hard.
  return new GoogleGenAI({ apiKey });
};

export const analyzeProgress = async (
  user: UserProfile,
  meals: Meal[],
  workouts: WorkoutSession[],
  lang: Language
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Prepare data summary
    const today = new Date().toISOString().split('T')[0];
    const todaysMeals = meals.filter(m => m.date === today);
    const totalCals = todaysMeals.reduce((acc, m) => acc + m.calories, 0);
    const totalProtein = todaysMeals.reduce((acc, m) => acc + m.protein, 0);
    
    const prompt = `
      Act as a professional fitness coach.
      User Profile:
      - Age: ${user.age}
      - Height: ${user.height}cm
      - Weight: ${user.weight}kg
      - Goal: ${user.goal}
      - Activity Level: ${user.activityLevel}
      
      Data for Today (${today}):
      - Total Calories Eaten: ${totalCals}
      - Total Protein Eaten: ${totalProtein}g
      - Workouts logged today: ${workouts.filter(w => w.date === today).length}
      
      Provide a very concise (max 3 sentences) analysis and advice for the user based on their goal.
      Reply in ${lang === Language.RU ? 'Russian' : 'English'}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || (lang === Language.RU ? 'Не удалось получить ответ.' : 'Could not generate response.');
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === Language.RU 
      ? 'Ошибка соединения с AI. Проверьте API ключ.' 
      : 'Connection error with AI. Check API key.';
  }
};
