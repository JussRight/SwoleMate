import React, { useState } from 'react';
import { UserProfile, Goal, Language, Theme } from '../types';
import { Input, Select } from './ui/Input';
import { Button } from './ui/Button';
import { TRANSLATIONS } from '../constants';
import { Dumbbell } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile, language: Language, theme: Theme) => void;
  initialName?: string;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialName }) => {
  const [step, setStep] = useState(1);
  const lang = Language.RU; 
  const theme = Theme.DARK;
  
  const [formData, setFormData] = useState<UserProfile>({
    name: initialName || '',
    age: 25,
    height: 175,
    weight: 70,
    goal: Goal.MAINTAIN,
    isOnboarded: false
  });

  const t = TRANSLATIONS[lang];

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else {
      onComplete({ ...formData, isOnboarded: true }, lang, theme);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto bg-dark">
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-full mb-8 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary text-primary shadow-[0_0_20px_rgba(179,217,0,0.2)]">
            <Dumbbell size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white">{t.onboardingTitle}</h1>
          <p className="text-gray-400">{t.onboardingSubtitle}</p>
        </div>

        <div className="w-full bg-darkCard p-6 rounded-3xl shadow-sm border border-gray-800 mb-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <Input 
                label={t.name}
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              <Input 
                label={t.age}
                type="number" 
                value={formData.age} 
                onChange={e => setFormData({...formData, age: Number(e.target.value)})} 
              />
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  label={t.height}
                  type="number" 
                  value={formData.height} 
                  onChange={e => setFormData({...formData, height: Number(e.target.value)})}
                  className="px-3 py-2.5" 
                />
                <Input 
                  label={t.weight}
                  type="number" 
                  value={formData.weight} 
                  onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                  className="px-3 py-2.5" 
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <Select 
                label={t.goal}
                value={formData.goal}
                onChange={e => setFormData({...formData, goal: e.target.value as Goal})}
              >
                <option value={Goal.LOSE_WEIGHT}>{t.goals[Goal.LOSE_WEIGHT]}</option>
                <option value={Goal.MAINTAIN}>{t.goals[Goal.MAINTAIN]}</option>
                <option value={Goal.GAIN_MUSCLE}>{t.goals[Goal.GAIN_MUSCLE]}</option>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="w-full mt-auto pb-6">
        <div className="flex gap-3 w-full mb-6">
           {step > 1 && (
               <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
                   {t.cancel}
               </Button>
           )}
          <Button onClick={handleNext} fullWidth className="flex-[2]">
            {step === 2 ? t.save : (lang === Language.RU ? 'Далее' : 'Next')}
          </Button>
        </div>
        
        <div className="flex justify-center gap-2">
            {[1,2].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-gray-700'}`} />
            ))}
        </div>
      </div>
    </div>
  );
};