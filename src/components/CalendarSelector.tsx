import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Check } from 'lucide-react';

interface CalendarSelectorProps {
  type: 'weekly' | 'monthly' | 'custom';
  selectedValues: number[] | string[];
  onChange: (values: any) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarSelector({ type, selectedValues, onChange }: CalendarSelectorProps) {
  const toggleWeeklyDay = (dayIndex: number) => {
    const current = [...(selectedValues as number[])];
    if (current.includes(dayIndex)) {
      onChange(current.filter(d => d !== dayIndex));
    } else {
      onChange([...current, dayIndex].sort());
    }
  };

  const toggleMonthlyDate = (date: number) => {
    const current = [...(selectedValues as number[])];
    if (current.includes(date)) {
      onChange(current.filter(d => d !== date));
    } else {
      onChange([...current, date].sort((a, b) => a - b));
    }
  };

  return (
    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          <CalendarIcon className="w-5 h-5 text-pb-green-deep" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">Select Delivery Days</h4>
          <p className="text-xs text-gray-400 capitalize">{type} Schedule</p>
        </div>
      </div>

      {type === 'weekly' && (
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((day, index) => {
            const isSelected = (selectedValues as number[]).includes(index);
            return (
              <motion.button
                key={day}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleWeeklyDay(index)}
                className={cn(
                  "flex flex-col items-center justify-center py-4 rounded-2xl border transition-all duration-300",
                  isSelected
                    ? "bg-pb-green-deep border-pb-green-deep text-white shadow-lg shadow-pb-green-deep/20"
                    : "bg-white border-gray-100 text-gray-400 hover:border-pb-green-deep/30"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-tight mb-1">{day}</span>
                {isSelected && <Check className="w-3 h-3" />}
              </motion.button>
            );
          })}
        </div>
      )}

      {type === 'monthly' && (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 31 }, (_, i) => i + 1).map(date => {
            const isSelected = (selectedValues as number[]).includes(date);
            return (
              <motion.button
                key={date}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleMonthlyDate(date)}
                className={cn(
                  "w-full aspect-square flex items-center justify-center rounded-xl border text-sm transition-all",
                  isSelected
                    ? "bg-pb-green-deep border-pb-green-deep text-white"
                    : "bg-white border-gray-100 text-gray-400 hover:border-pb-green-deep/30"
                )}
              >
                {date}
              </motion.button>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 p-3 bg-white/50 rounded-2xl border border-white">
        <div className="flex -space-x-1">
          {(selectedValues as any[]).map((v, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-pb-green-soft border-2 border-white flex items-center justify-center text-[10px] font-bold text-pb-green-deep">
              {type === 'weekly' ? WEEKDAYS[v][0] : v}
            </div>
          ))}
          {(selectedValues as any[]).length === 0 && (
            <span className="text-xs text-gray-400 pl-1 italic">No days selected</span>
          )}
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {(selectedValues as any[]).length} delivery days per period
        </span>
      </div>
    </div>
  );
}
