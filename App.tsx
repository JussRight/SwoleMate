
import React, { useState, useEffect } from 'react';
import { UserProfile, Meal, WorkoutSession, Language, Theme, NutritionGoal, WaterLog } from './types';
import { Onboarding } from './components/Onboarding';
import { Profile } from './components/Profile';
import { Nutrition } from './components/Nutrition';
import { Workouts } from './components/Workouts';
import { TRANSLATIONS } from './constants';
import { User, Dumbbell, Apple } from 'lucide-react';

const App: React.FC = () => {
  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  
  // Changed default tab to Profile as it's now first
  const [activeTab, setActiveTab] = useState<'profile' | 'workout' | 'nutrition'>('profile');
  const [language, setLanguage] = useState<Language>(Language.RU);
  const [theme, setTheme] = useState<Theme>(Theme.DARK); // Default to Dark

  // --- Persistence & Initialization ---
  useEffect(() => {
    const storedUser = localStorage.getItem('fitbot_user');
    const storedMeals = localStorage.getItem('fitbot_meals');
    const storedWorkouts = localStorage.getItem('fitbot_workouts');
    const storedWater = localStorage.getItem('fitbot_water');
    const storedLang = localStorage.getItem('fitbot_lang');
    const storedTheme = localStorage.getItem('fitbot_theme');

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedMeals) setMeals(JSON.parse(storedMeals));
    if (storedWorkouts) setWorkouts(JSON.parse(storedWorkouts));
    if (storedWater) setWaterLogs(JSON.parse(storedWater));
    if (storedLang) setLanguage(storedLang as Language);
    if (storedTheme) setTheme(storedTheme as Theme);

    // @ts-ignore
    if (!storedUser && window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name) {
       // Onboarding handles this
    }

    setLoading(false);
  }, []);

  // --- Effects for Theme ---
  useEffect(() => {
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fitbot_theme', theme);
  }, [theme]);

  // --- Handlers ---
  const handleOnboardingComplete = (profile: UserProfile, lang: Language, thm: Theme) => {
    setUser(profile);
    setLanguage(lang);
    setTheme(thm);
    localStorage.setItem('fitbot_user', JSON.stringify(profile));
    localStorage.setItem('fitbot_lang', lang);
    localStorage.setItem('fitbot_theme', thm);
  };

  const updateSettings = (l: Language, t: Theme) => {
      setLanguage(l);
      setTheme(t);
      localStorage.setItem('fitbot_lang', l);
      localStorage.setItem('fitbot_theme', t);
  };

  const updateUser = (u: UserProfile) => {
      setUser(u);
      localStorage.setItem('fitbot_user', JSON.stringify(u));
  };
  
  const setNutritionGoal = (goal: NutritionGoal) => {
      if (!user) return;
      const updatedUser = { ...user, nutritionGoal: goal };
      updateUser(updatedUser);
  };

  const setWorkoutGoal = (goal: number) => {
      if (!user) return;
      const updatedUser = { ...user, monthlyWorkoutGoal: goal };
      updateUser(updatedUser);
  };

  const addMeal = (meal: Meal) => {
      const updated = [...meals, meal];
      setMeals(updated);
      localStorage.setItem('fitbot_meals', JSON.stringify(updated));
  };
  
  const updateMeal = (meal: Meal) => {
      const updated = meals.map(m => m.id === meal.id ? meal : m);
      setMeals(updated);
      localStorage.setItem('fitbot_meals', JSON.stringify(updated));
  };

  const deleteMeal = (id: string) => {
      const updated = meals.filter(m => m.id !== id);
      setMeals(updated);
      localStorage.setItem('fitbot_meals', JSON.stringify(updated));
  };

  const addWorkout = (workout: WorkoutSession) => {
      const updated = [...workouts, workout];
      setWorkouts(updated);
      localStorage.setItem('fitbot_workouts', JSON.stringify(updated));
  };

  const updateWorkout = (workout: WorkoutSession) => {
      const updated = workouts.map(w => w.id === workout.id ? workout : w);
      setWorkouts(updated);
      localStorage.setItem('fitbot_workouts', JSON.stringify(updated));
  };
  
  const deleteWorkout = (id: string) => {
      const updated = workouts.filter(w => w.id !== id);
      setWorkouts(updated);
      localStorage.setItem('fitbot_workouts', JSON.stringify(updated));
  };

  // --- Water Handlers ---
  
  const updateWater = (date: string, amount: number) => {
    const others = waterLogs.filter(l => l.date !== date);
    // If we want to store 0, we can, or we can filter it out. 
    // Keeping 0 is fine for consistency.
    const updated = [...others, { date, amount }];
    setWaterLogs(updated);
    localStorage.setItem('fitbot_water', JSON.stringify(updated));
  };

  // --- Render ---

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center text-primary">Loading...</div>;

  // Onboarding Flow
  if (!user || !user.isOnboarded) {
    // @ts-ignore
    const tgName = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name;
    return <Onboarding onComplete={handleOnboardingComplete} initialName={tgName} />;
  }

  // Main App Flow
  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-dark text-gray-100 font-sans selection:bg-primary selection:text-black">
      
      <main className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-dark flex flex-col">
        <div className="flex-1 overflow-auto no-scrollbar">
            {activeTab === 'profile' && (
                <Profile 
                    user={user} 
                    language={language} 
                    theme={theme}
                    meals={meals}
                    workouts={workouts}
                    onUpdateUser={updateUser}
                    onUpdateSettings={updateSettings}
                />
            )}
            {activeTab === 'workout' && (
                <Workouts 
                    workouts={workouts} 
                    userGoal={user.monthlyWorkoutGoal}
                    language={language} 
                    onAddWorkout={addWorkout}
                    onUpdateWorkout={updateWorkout}
                    onDeleteWorkout={deleteWorkout}
                    onSetGoal={setWorkoutGoal}
                />
            )}
            {activeTab === 'nutrition' && (
                <Nutrition 
                    meals={meals}
                    userGoal={user.nutritionGoal}
                    language={language}
                    onAddMeal={addMeal}
                    onUpdateMeal={updateMeal}
                    onDeleteMeal={deleteMeal}
                    onSetGoal={setNutritionGoal}
                    waterLogs={waterLogs}
                    onUpdateWater={updateWater}
                />
            )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-darkCard/90 backdrop-blur-lg border-t border-gray-800 pb-safe">
          <div className="max-w-md mx-auto flex justify-around items-center h-20 px-4">
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'profile' ? 'text-primary scale-110' : 'text-gray-500 hover:text-gray-300'}`}
            >
               <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-primary/10 shadow-[0_0_10px_rgba(179,217,0,0.2)]' : ''}`}>
                 <User size={24} className={activeTab === 'profile' ? 'fill-current' : ''} />
               </div>
              <span className="text-[10px] font-bold tracking-wide">{t.profile}</span>
            </button>

            <button 
              onClick={() => setActiveTab('workout')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'workout' ? 'text-primary scale-110' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'workout' ? 'bg-primary/10 shadow-[0_0_10px_rgba(179,217,0,0.2)]' : ''}`}>
                 <Dumbbell size={24} className={activeTab === 'workout' ? 'fill-current' : ''} />
              </div>
              <span className="text-[10px] font-bold tracking-wide">{t.workout}</span>
            </button>

            <button 
              onClick={() => setActiveTab('nutrition')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'nutrition' ? 'text-primary scale-110' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'nutrition' ? 'bg-primary/10 shadow-[0_0_10px_rgba(179,217,0,0.2)]' : ''}`}>
                 <Apple size={24} className={activeTab === 'nutrition' ? 'fill-current' : ''} />
              </div>
              <span className="text-[10px] font-bold tracking-wide">{t.nutrition}</span>
            </button>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
