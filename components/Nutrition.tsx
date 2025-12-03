
import React, { useState, useMemo, useEffect } from 'react';
import { Meal, Language, NutritionGoal, WaterLog } from '../types';
import { TRANSLATIONS } from '../constants';
import { DateScroller } from './DateScroller';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Plus, Trash2, Edit2, Target, Droplets, Minus } from 'lucide-react';

interface NutritionProps {
  meals: Meal[];
  userGoal?: NutritionGoal;
  language: Language;
  onAddMeal: (meal: Meal) => void;
  onUpdateMeal: (meal: Meal) => void;
  onDeleteMeal: (id: string) => void;
  onSetGoal: (goal: NutritionGoal) => void;
  waterLogs: WaterLog[];
  onUpdateWater: (date: string, amount: number) => void;
}

export const Nutrition: React.FC<NutritionProps> = ({ 
  meals, userGoal, language, onAddMeal, onUpdateMeal, onDeleteMeal, onSetGoal,
  waterLogs, onUpdateWater
}) => {
  const t = TRANSLATIONS[language];
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mealForm, setMealForm] = useState<Partial<Meal>>({});
  
  // Goal Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState<NutritionGoal>({
    calories: 2000,
    protein: 150,
    fats: 60,
    carbs: 250
  });

  useEffect(() => {
    // Show goal modal if no goal is set when entering this tab
    if (!userGoal) {
      setShowGoalModal(true);
    }
  }, [userGoal]);

  const daysMeals = useMemo(() => meals.filter(m => m.date === selectedDate), [meals, selectedDate]);
  
  const dailyWater = useMemo(() => {
    return waterLogs.find(l => l.date === selectedDate)?.amount || 0;
  }, [waterLogs, selectedDate]);

  // Calculate indicators for DateScroller
  const dateIndicators = useMemo(() => {
    const indicators: Record<string, 'success' | 'warning' | 'neutral'> = {};
    
    // Group meals by date
    const mealsByDate = meals.reduce((acc, meal) => {
        if (!acc[meal.date]) acc[meal.date] = 0;
        acc[meal.date] += meal.calories;
        return acc;
    }, {} as Record<string, number>);

    Object.keys(mealsByDate).forEach(date => {
        const cals = mealsByDate[date];
        if (userGoal && cals >= userGoal.calories * 0.9) {
            indicators[date] = 'success';
        } else if (cals > 0) {
            indicators[date] = 'warning'; // Warning means logged but not goal hit
        }
    });
    
    return indicators;
  }, [meals, userGoal]);

  const stats = useMemo(() => {
    return daysMeals.reduce((acc, curr) => ({
      calories: acc.calories + curr.calories,
      protein: acc.protein + curr.protein,
      fats: acc.fats + curr.fats,
      carbs: acc.carbs + curr.carbs
    }), { calories: 0, protein: 0, fats: 0, carbs: 0 });
  }, [daysMeals]);

  const handleEditClick = (meal: Meal) => {
    setEditingId(meal.id);
    setMealForm(meal);
    setIsAdding(true);
  };

  const handleSaveMeal = () => {
    if (mealForm.name && mealForm.calories) {
      const mealData: Meal = {
        id: editingId || Date.now().toString(),
        date: selectedDate,
        name: mealForm.name,
        calories: Number(mealForm.calories),
        protein: Number(mealForm.protein || 0),
        fats: Number(mealForm.fats || 0),
        carbs: Number(mealForm.carbs || 0),
      };

      if (editingId) {
        onUpdateMeal(mealData);
      } else {
        onAddMeal(mealData);
      }
      
      setIsAdding(false);
      setEditingId(null);
      setMealForm({});
    }
  };

  const handleSaveGoal = () => {
    onSetGoal(goalForm);
    setShowGoalModal(false);
  };

  const renderProgressBar = (current: number, target: number, colorClass: string) => {
    const percent = Math.min(100, (current / (target || 1)) * 100);
    return (
      <div className="h-2 w-full bg-gray-800 rounded-full mt-1 overflow-hidden">
        <div className={`h-full ${colorClass}`} style={{ width: `${percent}%` }} />
      </div>
    );
  };

  if (showGoalModal) {
    return (
      <div className="fixed inset-0 z-50 bg-dark flex items-center justify-center p-4">
        <div className="w-full bg-darkCard p-6 rounded-3xl border border-gray-800">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Target size={24} />
            <h2 className="text-xl font-bold">{t.setNutritionGoal}</h2>
          </div>
          <div className="space-y-4">
            <Input label={t.calories} type="number" value={goalForm.calories} onChange={e => setGoalForm({...goalForm, calories: Number(e.target.value)})} />
            <Input label={t.protein} type="number" value={goalForm.protein} onChange={e => setGoalForm({...goalForm, protein: Number(e.target.value)})} />
            <Input label={t.fats} type="number" value={goalForm.fats} onChange={e => setGoalForm({...goalForm, fats: Number(e.target.value)})} />
            <Input label={t.carbs} type="number" value={goalForm.carbs} onChange={e => setGoalForm({...goalForm, carbs: Number(e.target.value)})} />
            <Button fullWidth onClick={handleSaveGoal}>{t.save}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen bg-dark">
      <div className="sticky top-0 bg-dark z-10 pt-4 px-4 border-b border-gray-900 pb-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">{t.nutrition}</h2>
          <button onClick={() => setShowGoalModal(true)} className="p-2 bg-darkCard rounded-full text-primary border border-gray-800">
            <Target size={20} />
          </button>
        </div>
        <DateScroller 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate} 
            language={language} 
            indicators={dateIndicators}
        />
      </div>

      <div className="px-4 space-y-6 mt-4">
        {/* Daily Goal Card */}
        {userGoal && (
           <div className="bg-darkCard p-5 rounded-3xl border border-gray-800">
             <div className="flex justify-between items-center mb-2">
               <span className="text-sm font-bold text-gray-400">{t.dailyGoal}</span>
               <span className="text-lg font-bold text-primary">{stats.calories} / {userGoal.calories}</span>
             </div>
             {renderProgressBar(stats.calories, userGoal.calories, 'bg-primary')}
             
             <div className="grid grid-cols-3 gap-4 mt-4">
               <div>
                  <div className="flex justify-between text-xs text-gray-400"><span>{t.protein}</span><span>{stats.protein}/{userGoal.protein}</span></div>
                  {renderProgressBar(stats.protein, userGoal.protein, 'bg-blue-500')}
               </div>
               <div>
                  <div className="flex justify-between text-xs text-gray-400"><span>{t.fats}</span><span>{stats.fats}/{userGoal.fats}</span></div>
                  {renderProgressBar(stats.fats, userGoal.fats, 'bg-yellow-500')}
               </div>
               <div>
                  <div className="flex justify-between text-xs text-gray-400"><span>{t.carbs}</span><span>{stats.carbs}/{userGoal.carbs}</span></div>
                  {renderProgressBar(stats.carbs, userGoal.carbs, 'bg-green-500')}
               </div>
             </div>
           </div>
        )}

        {/* Water Tracker - Now linked to selectedDate */}
        <div className="bg-darkCard p-5 rounded-3xl border border-gray-800 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                <Droplets size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-bold uppercase">{t.water}</p>
                <p className="text-xl font-bold text-white">{(dailyWater / 1000).toFixed(2)} <span className="text-sm font-normal text-gray-500">{t.liters}</span></p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => onUpdateWater(selectedDate, Math.max(0, dailyWater - 250))}
                className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 active:scale-95 transition-all"
              >
                <Minus size={20} />
              </button>
              <button 
                onClick={() => onUpdateWater(selectedDate, dailyWater + 250)}
                className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-black hover:bg-blue-400 active:scale-95 transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              >
                <Plus size={20} />
              </button>
           </div>
        </div>

        {/* Meals List */}
        <div className="space-y-3">
          {daysMeals.length === 0 ? (
            <div className="text-center py-6 text-gray-600">
              <p>{t.noMeals}</p>
            </div>
          ) : (
            daysMeals.map(meal => (
              <div key={meal.id} className="bg-darkCard p-4 rounded-2xl flex justify-between items-center border border-gray-800 hover:border-primary/30 transition-colors">
                <div onClick={() => handleEditClick(meal)} className="flex-1 cursor-pointer">
                  <h3 className="font-semibold text-white">{meal.name}</h3>
                  <p className="text-sm text-gray-400">{meal.calories} kcal • P: {meal.protein} F: {meal.fats} C: {meal.carbs}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClick(meal)}
                    className="p-2 text-gray-500 hover:text-primary transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => onDeleteMeal(meal.id)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Meal Form */}
        {isAdding ? (
          <div className="bg-darkCard p-4 rounded-3xl shadow-lg border border-primary/20 animate-fade-in space-y-3">
            <h3 className="font-bold text-white">{editingId ? t.editMeal : t.addMeal}</h3>
            <Input 
              placeholder={t.mealName} 
              value={mealForm.name || ''} 
              onChange={e => setMealForm({...mealForm, name: e.target.value})} 
            />
            <div className="grid grid-cols-2 gap-2">
               <Input 
                  type="number" 
                  placeholder={t.calories}
                  label={t.calories}
                  value={mealForm.calories || ''} 
                  onChange={e => setMealForm({...mealForm, calories: Number(e.target.value)})} 
               />
               <Input 
                  type="number" 
                  placeholder={t.protein}
                  label={t.protein}
                  value={mealForm.protein || ''} 
                  onChange={e => setMealForm({...mealForm, protein: Number(e.target.value)})} 
               />
               <Input 
                  type="number" 
                  placeholder={t.fats}
                  label={t.fats}
                  value={mealForm.fats || ''} 
                  onChange={e => setMealForm({...mealForm, fats: Number(e.target.value)})} 
               />
               <Input 
                  type="number" 
                  placeholder={t.carbs}
                  label={t.carbs}
                  value={mealForm.carbs || ''} 
                  onChange={e => setMealForm({...mealForm, carbs: Number(e.target.value)})} 
               />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" fullWidth onClick={() => { setIsAdding(false); setEditingId(null); setMealForm({}); }}>{t.cancel}</Button>
              <Button fullWidth onClick={handleSaveMeal}>{t.save}</Button>
            </div>
          </div>
        ) : (
          <Button fullWidth className="flex items-center justify-center gap-2 py-4" onClick={() => setIsAdding(true)}>
            <Plus size={20} /> {t.addMeal}
          </Button>
        )}
      </div>
    </div>
  );
};
