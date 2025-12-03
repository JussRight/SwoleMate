
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Language } from '../types';

interface DateScrollerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  language: Language;
  indicators?: Record<string, 'success' | 'warning' | 'neutral'>;
}

export const DateScroller: React.FC<DateScrollerProps> = ({ selectedDate, onDateChange, language, indicators = {} }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState('');

  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    // Generate 30 days before and 14 days after
    for (let i = -30; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push(d);
    }
    return result;
  }, []);

  // Update month header based on selected date
  useEffect(() => {
    const date = new Date(selectedDate);
    const monthName = date.toLocaleDateString(language === Language.RU ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' });
    setCurrentMonth(monthName.charAt(0).toUpperCase() + monthName.slice(1));
  }, [selectedDate, language]);

  const formatDate = (date: Date) => {
    const iso = date.toISOString().split('T')[0];
    const isSelected = iso === selectedDate;
    const dayName = date.toLocaleDateString(language === Language.RU ? 'ru-RU' : 'en-US', { weekday: 'short' });
    const dayNum = date.getDate();
    
    const status = indicators[iso];

    return (
      <button
        key={iso}
        onClick={() => onDateChange(iso)}
        className={`flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-2xl mx-1 transition-all relative ${
          isSelected 
            ? 'bg-primary text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] scale-110 z-10' 
            : 'bg-darkCard border border-gray-800 text-gray-400 hover:bg-gray-800'
        }`}
      >
        <span className="text-xs font-bold uppercase">{dayName}</span>
        <span className={`text-lg font-bold`}>{dayNum}</span>
        
        {/* Status Indicator Dot */}
        {!isSelected && status && (
           <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${
             status === 'success' ? 'bg-primary' : 'bg-gray-500'
           }`} />
        )}
        {isSelected && status && (
            <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
              status === 'success' ? 'bg-black' : 'bg-black/50'
            }`} />
        )}
      </button>
    );
  };

  useEffect(() => {
    // Scroll to selected date initially or when it changes significantly
    if (scrollRef.current) {
       // Simple logic: Scroll to 2/3rds to show past dates
       // In a real app we would calculate the exact offset of the selected element
    }
  }, []);
  
  // Scroll into view logic on mount
  useEffect(() => {
      if(scrollRef.current) {
          // Approximate center for 'today' which is at index 30
          // 30 * (3.5rem + margin) approx.
          const scrollLeft = 30 * 60; 
          scrollRef.current.scrollTo({ left: scrollLeft - scrollRef.current.clientWidth / 2, behavior: 'instant' });
      }
  }, []);

  return (
    <div className="w-full relative mb-2">
      <div className="flex justify-between items-center px-2 mb-2">
         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{currentMonth}</h3>
      </div>
      <div className="relative">
        <div 
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar py-2 px-2 snap-x"
        >
            {dates.map(formatDate)}
        </div>
        <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-dark to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-dark to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
