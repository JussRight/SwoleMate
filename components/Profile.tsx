
import React, { useState } from 'react';
import { UserProfile, Language, Theme, Meal, WorkoutSession } from '../types';
import { TRANSLATIONS } from '../constants';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { User, Globe, Moon, Sun, Sparkles, Settings as SettingsIcon, X } from 'lucide-react';
import { analyzeProgress } from '../services/geminiService';

interface ProfileProps {
  user: UserProfile;
  language: Language;
  theme: Theme;
  meals: Meal[];
  workouts: WorkoutSession[];
  onUpdateUser: (u: UserProfile) => void;
  onUpdateSettings: (l: Language, t: Theme) => void;
}

export const Profile: React.FC<ProfileProps> = ({ 
  user, language, theme, meals, workouts, onUpdateUser, onUpdateSettings
}) => {
  const t = TRANSLATIONS[language];
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(user);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSave = () => {
    onUpdateUser(editForm);
    setIsEditing(false);
  };

  const handleAnalyze = async () => {
    setLoadingAi(true);
    setAiAnalysis(null);
    const result = await analyzeProgress(user, meals, workouts, language);
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  return (
    <div className="p-4 pb-24 space-y-6 min-h-screen bg-dark">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">{t.profile}</h2>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full bg-darkCard border border-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <SettingsIcon size={20} />
        </button>
      </div>

      {/* User Card */}
      <div className="bg-darkCard p-6 rounded-3xl border border-gray-800 flex flex-col items-center shadow-lg">
        <div className="w-24 h-24 bg-dark rounded-full border-2 border-primary flex items-center justify-center mb-4 text-primary shadow-[0_0_20px_rgba(179,217,0,0.1)]">
           <User size={40} />
        </div>
        <h3 className="text-xl font-bold text-white">{user.name}</h3>
        <p className="text-primary font-medium tracking-wide text-sm bg-primary/10 px-3 py-1 rounded-full mt-2">{t.goals[user.goal]}</p>
        
        {isEditing ? (
           <div className="w-full space-y-3 mt-4 animate-fade-in">
              <Input label={t.name} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                 <Input label={t.age} type="number" value={editForm.age} onChange={e => setEditForm({...editForm, age: Number(e.target.value)})} />
                 <Input label={t.weight} type="number" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: Number(e.target.value)})} />
              </div>
               <Input label={t.height} type="number" value={editForm.height} onChange={e => setEditForm({...editForm, height: Number(e.target.value)})} />
              <div className="flex gap-2 mt-2">
                 <Button variant="secondary" fullWidth onClick={() => setIsEditing(false)}>{t.cancel}</Button>
                 <Button fullWidth onClick={handleSave}>{t.save}</Button>
              </div>
           </div>
        ) : (
          <div className="w-full mt-6 grid grid-cols-3 gap-2 text-center">
             <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800">
                <span className="text-xs text-gray-500 uppercase font-bold">{t.age}</span>
                <p className="font-bold text-white text-lg">{user.age}</p>
             </div>
             <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800">
                <span className="text-xs text-gray-500 uppercase font-bold">{t.weight}</span>
                <p className="font-bold text-white text-lg">{user.weight}</p>
             </div>
             <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800">
                <span className="text-xs text-gray-500 uppercase font-bold">{t.height}</span>
                <p className="font-bold text-white text-lg">{user.height}</p>
             </div>
             <Button variant="secondary" className="col-span-3 mt-4" onClick={() => setIsEditing(true)}>{t.edit}</Button>
          </div>
        )}
      </div>

      {/* AI Coach */}
      <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl border border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={20} className="text-primary" />
          <h3 className="font-bold text-lg text-white">{t.aiCoach}</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          {aiAnalysis || (language === Language.RU ? 'Нажмите для анализа ваших данных сегодня.' : 'Tap to analyze your data for today.')}
        </p>
        <Button 
           onClick={handleAnalyze} 
           disabled={loadingAi}
           variant="primary"
           fullWidth
        >
          {loadingAi ? t.analyzing : t.aiAnalyze}
        </Button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-darkCard border border-gray-800 rounded-3xl p-6 relative">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6">{t.settings}</h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-primary mb-2">
                    <Globe size={20} />
                    <span className="font-bold uppercase tracking-wider text-xs">{t.language}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                   <button 
                     onClick={() => onUpdateSettings(Language.RU, theme)}
                     className={`p-3 rounded-xl border font-bold transition-all ${language === Language.RU ? 'bg-primary text-black border-primary' : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-600'}`}
                   >Russian</button>
                   <button 
                      onClick={() => onUpdateSettings(Language.EN, theme)}
                     className={`p-3 rounded-xl border font-bold transition-all ${language === Language.EN ? 'bg-primary text-black border-primary' : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-600'}`}
                   >English</button>
                 </div>
              </div>
              
              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-primary mb-2">
                    {theme === Theme.LIGHT ? <Sun size={20} /> : <Moon size={20} />}
                    <span className="font-bold uppercase tracking-wider text-xs">{t.theme}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                   <button 
                     onClick={() => onUpdateSettings(language, Theme.LIGHT)}
                     className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${theme === Theme.LIGHT ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-600'}`}
                   ><Sun size={18} /> {t.light}</button>
                   <button 
                      onClick={() => onUpdateSettings(language, Theme.DARK)}
                     className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${theme === Theme.DARK ? 'bg-gray-800 text-white border-gray-700' : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-600'}`}
                   ><Moon size={18} /> {t.dark}</button>
                 </div>
              </div>
            </div>

            <Button fullWidth onClick={() => setShowSettings(false)} className="mt-8">
              {t.save}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
