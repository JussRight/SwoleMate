
import React, { useState, useMemo, useEffect } from 'react';
import { WorkoutSession, Exercise, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { DateScroller } from './DateScroller';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Plus, Trash2, Dumbbell, X, Edit2, Target } from 'lucide-react';

interface WorkoutsProps {
  workouts: WorkoutSession[];
  userGoal?: number;
  language: Language;
  onAddWorkout: (workout: WorkoutSession) => void;
  onUpdateWorkout: (workout: WorkoutSession) => void;
  onDeleteWorkout: (id: string) => void;
  onSetGoal: (goal: number) => void;
}

export const Workouts: React.FC<WorkoutsProps> = ({ 
  workouts, userGoal, language, onAddWorkout, onUpdateWorkout, onDeleteWorkout, onSetGoal 
}) => {
  const t = TRANSLATIONS[language];
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingSession, setIsAddingSession] = useState(false);
  
  // New/Edit Workout Session State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionExercises, setSessionExercises] = useState<Exercise[]>([]);
  
  // Add Exercise Form State (Inside Session)
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [exName, setExName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  // Goal Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState<number>(12);

  useEffect(() => {
    if (userGoal === undefined) {
      setShowGoalModal(true);
    } else {
      setGoalInput(userGoal);
    }
  }, [userGoal]);

  const todaysWorkouts = useMemo(() => workouts.filter(w => w.date === selectedDate), [workouts, selectedDate]);
  
  // Calculate indicators for DateScroller
  const dateIndicators = useMemo(() => {
      const indicators: Record<string, 'success' | 'warning' | 'neutral'> = {};
      
      workouts.forEach(w => {
          // If a workout exists, mark as success
          indicators[w.date] = 'success';
      });
      
      return indicators;
    }, [workouts]);

  const monthlyStats = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    return workouts.filter(w => w.date.startsWith(currentMonth)).length;
  }, [workouts]);

  const handleEditSession = (session: WorkoutSession) => {
    setEditingId(session.id);
    setSessionTitle(session.name);
    setSessionExercises(session.exercises);
    setIsAddingSession(true);
  };

  const addExerciseToSession = () => {
    if (exName && sets && reps) {
      const newExercise: Exercise = {
        id: Date.now().toString(),
        name: exName,
        sets: Array(Number(sets)).fill({ reps: Number(reps), weight: Number(weight || 0) })
      };
      setSessionExercises([...sessionExercises, newExercise]);
      
      // Reset exercise form
      setExName(''); setSets(''); setReps(''); setWeight('');
      setIsAddingExercise(false);
    }
  };

  const removeExerciseFromSession = (exId: string) => {
    setSessionExercises(sessionExercises.filter(ex => ex.id !== exId));
  };

  const saveWorkoutSession = () => {
    if (sessionTitle && sessionExercises.length > 0) {
      const sessionData: WorkoutSession = {
        id: editingId || Date.now().toString(),
        date: selectedDate,
        name: sessionTitle,
        exercises: sessionExercises
      };

      if (editingId) {
        onUpdateWorkout(sessionData);
      } else {
        onAddWorkout(sessionData);
      }
      
      // Reset session form
      setEditingId(null);
      setSessionTitle('');
      setSessionExercises([]);
      setIsAddingSession(false);
    }
  };

  const cancelSession = () => {
    setIsAddingSession(false);
    setEditingId(null);
    setSessionTitle('');
    setSessionExercises([]);
  };

  const handleSaveGoal = () => {
    onSetGoal(goalInput);
    setShowGoalModal(false);
  };

  const renderProgressBar = (current: number, target: number) => {
    const percent = Math.min(100, (current / (target || 1)) * 100);
    return (
      <div className="h-3 w-full bg-gray-800 rounded-full mt-2 overflow-hidden border border-gray-700">
        <div 
          className="h-full bg-primary shadow-[0_0_10px_rgba(204,255,0,0.5)] transition-all duration-1000 ease-out" 
          style={{ width: `${percent}%` }} 
        />
      </div>
    );
  };

  if (showGoalModal) {
    return (
      <div className="fixed inset-0 z-50 bg-dark flex items-center justify-center p-4">
        <div className="w-full bg-darkCard p-6 rounded-3xl border border-gray-800">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Target size={24} />
            <h2 className="text-xl font-bold">{t.setWorkoutGoal}</h2>
          </div>
          <p className="text-gray-400 mb-6 text-sm">{t.monthlyGoal}</p>
          <div className="space-y-4">
            <Input 
              label={t.targetWorkouts}
              type="number" 
              value={goalInput} 
              onChange={e => setGoalInput(Number(e.target.value))} 
            />
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
          <h2 className="text-2xl font-bold text-white">{t.workout}</h2>
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

        {/* Monthly Goal Card */}
        {userGoal && (
           <div className="bg-darkCard p-5 rounded-3xl border border-gray-800">
             <div className="flex justify-between items-center mb-1">
               <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t.monthlyGoal}</span>
               <span className="text-xl font-bold text-primary">{monthlyStats} <span className="text-gray-500 text-sm">/ {userGoal}</span></span>
             </div>
             {renderProgressBar(monthlyStats, userGoal)}
             <p className="text-xs text-gray-500 mt-2 text-right">{t.workoutsThisMonth}</p>
           </div>
        )}
        
        {/* List of existing workouts for today */}
        {!isAddingSession && (
          <div className="space-y-4">
            {todaysWorkouts.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center text-gray-600">
                 <div className="w-16 h-16 bg-darkCard border border-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Dumbbell className="text-gray-600" />
                 </div>
                <p>{t.noWorkouts}</p>
              </div>
            ) : (
              todaysWorkouts.map(session => (
                <div key={session.id} className="bg-darkCard p-5 rounded-3xl border border-gray-800 shadow-sm relative overflow-hidden group">
                   {/* Neon Accent */}
                   <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                   
                   <div className="flex justify-between items-start mb-3 pl-2">
                     <h3 className="font-bold text-lg text-white">{session.name || 'Workout'}</h3>
                     <div className="flex gap-1">
                        <button onClick={() => handleEditSession(session)} className="p-2 text-gray-500 hover:text-primary transition-colors">
                           <Edit2 size={18} />
                        </button>
                        <button onClick={() => onDeleteWorkout(session.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                           <Trash2 size={18} />
                        </button>
                     </div>
                   </div>
                   <div className="space-y-3 pl-2">
                      {session.exercises.map((ex, idx) => (
                        <div key={ex.id} className="bg-black/20 p-2 rounded-lg">
                          <p className="font-medium text-primary text-sm uppercase tracking-wide">{idx + 1}. {ex.name}</p>
                          <p className="text-sm text-gray-400">
                            {ex.sets.length} x {ex.sets[0].reps} {ex.sets[0].weight > 0 && `(${ex.sets[0].weight}kg)`}
                          </p>
                        </div>
                      ))}
                   </div>
                </div>
              ))
            )}
            
            <Button fullWidth className="flex items-center justify-center gap-2 py-4 shadow-lg shadow-primary/20" onClick={() => setIsAddingSession(true)}>
              <Plus size={20} /> {t.addWorkout}
            </Button>
          </div>
        )}

        {/* Create/Edit Session Mode */}
        {isAddingSession && (
          <div className="bg-darkCard p-4 rounded-3xl border border-primary/30 animate-fade-in space-y-4 relative">
             <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-white text-lg">{editingId ? t.edit : t.addWorkout}</h3>
                 <button onClick={cancelSession} className="text-gray-500 hover:text-white"><X size={20} /></button>
             </div>
             
             <Input 
               label={t.workoutName}
               placeholder="Leg Day, Morning Cardio..." 
               value={sessionTitle} 
               onChange={e => setSessionTitle(e.target.value)} 
               autoFocus
             />

             {/* Exercises List inside the current session creation */}
             <div className="bg-black/40 rounded-xl p-3 min-h-[100px] border border-gray-800">
                 <p className="text-xs text-gray-500 uppercase font-bold mb-2">{t.exercisesList}</p>
                 {sessionExercises.length === 0 ? (
                     <p className="text-center text-gray-600 text-sm py-4">{t.noExercisesAdded}</p>
                 ) : (
                     <div className="space-y-2">
                         {sessionExercises.map((ex, i) => (
                             <div key={ex.id || i} className="flex justify-between items-center text-sm border-b border-gray-800 pb-1 last:border-0">
                                 <div>
                                    <span className="text-gray-200 block">{ex.name}</span>
                                    <span className="text-primary text-xs">{ex.sets.length} x {ex.sets[0].reps} ({ex.sets[0].weight}kg)</span>
                                 </div>
                                 <button onClick={() => removeExerciseFromSession(ex.id)} className="text-gray-600 hover:text-red-500"><X size={16} /></button>
                             </div>
                         ))}
                     </div>
                 )}
             </div>

             {/* Add Exercise Mini-Form */}
             {isAddingExercise ? (
                 <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700 space-y-2">
                     <Input 
                        placeholder={t.exerciseName} 
                        value={exName} 
                        onChange={e => setExName(e.target.value)} 
                     />
                     <div className="grid grid-cols-3 gap-2">
                        <Input type="number" placeholder={t.sets} value={sets} onChange={e => setSets(e.target.value)} />
                        <Input type="number" placeholder={t.reps} value={reps} onChange={e => setReps(e.target.value)} />
                        <Input type="number" placeholder="Kg" value={weight} onChange={e => setWeight(e.target.value)} />
                     </div>
                     <div className="flex gap-2">
                         <Button variant="secondary" className="flex-1 py-2 text-sm" onClick={() => setIsAddingExercise(false)}>{t.cancel}</Button>
                         <Button variant="primary" className="flex-1 py-2 text-sm" onClick={addExerciseToSession}>{t.add}</Button>
                     </div>
                 </div>
             ) : (
                 <Button variant="secondary" fullWidth onClick={() => setIsAddingExercise(true)} className="border-dashed border-gray-700">
                     + {t.addExercise}
                 </Button>
             )}

             <div className="pt-4 border-t border-gray-800">
                 <Button fullWidth onClick={saveWorkoutSession} disabled={!sessionTitle || sessionExercises.length === 0}>
                     {t.save}
                 </Button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
