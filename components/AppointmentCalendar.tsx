"use client";

import { useState } from "react";

export interface BookedAppointment {
  date: Date;
  time: string;
  department: string;
  patient: string;
}

interface CalendarProps {
  appointments: BookedAppointment[];
  compact?: boolean;
}

export default function AppointmentCalendar({ appointments, compact = false }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay(); // 0=Sun
  const totalDays = lastDay.getDate();

  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const getAppointmentsForDate = (day: number) => {
    return appointments.filter((apt) => {
      const d = new Date(apt.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const selectedAppointments = selectedDate
    ? appointments.filter((apt) => {
        const d = new Date(apt.date);
        return (
          d.getDate() === selectedDate.getDate() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  const days = [];
  for (let i = 0; i < startPad; i++) {
    days.push(<div key={`pad-${i}`} className={compact ? "h-8" : "h-10"} />);
  }
  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(year, month, day);
    const isToday = dateObj.getTime() === today.getTime();
    const dayAppointments = getAppointmentsForDate(day);
    const hasAppointment = dayAppointments.length > 0;
    const isSelected = selectedDate?.getTime() === dateObj.getTime();

    days.push(
      <button
        key={day}
        onClick={() => setSelectedDate(hasAppointment ? dateObj : null)}
        aria-label={`${dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" })}${hasAppointment ? `, ${dayAppointments.length} appointment${dayAppointments.length > 1 ? "s" : ""}` : ""}`}
        aria-pressed={isSelected}
        className={`${compact ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"} rounded-lg font-medium transition-all duration-150 relative flex items-center justify-center mx-auto ${
          isSelected
            ? "bg-blue-700 text-white shadow-sm"
            : hasAppointment
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
            : isToday
            ? "bg-blue-50 text-blue-700 border border-blue-200"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        {day}
        {hasAppointment && !isSelected && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
        )}
      </button>
    );
  }

  return (
    <div className="elevated-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className={`${compact ? "px-4 py-2.5" : "px-5 py-3"} border-b border-[var(--border-subtle)] bg-slate-50 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Clinic Schedule</h3>
        </div>
        {appointments.length > 0 && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {appointments.length} booked
          </span>
        )}
      </div>

      {/* Month Navigation */}
      <div className={`${compact ? "px-4 pt-2" : "px-5 pt-4"} flex items-center justify-between`}>
        <button onClick={prevMonth} aria-label="Previous month" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className={`${compact ? "text-xs" : "text-sm"} font-semibold text-slate-700`}>{monthName}</span>
        <button onClick={nextMonth} aria-label="Next month" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className={`${compact ? "px-3 pt-2" : "px-5 pt-3"} grid grid-cols-7 gap-1`}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className={`text-center ${compact ? "text-[9px]" : "text-[10px]"} font-bold text-slate-400 uppercase tracking-wider pb-1.5`}>
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className={`${compact ? "px-3 pb-3" : "px-5 pb-4"} grid grid-cols-7 gap-1`}>
        {days}
      </div>

      {/* Selected Appointment Detail */}
      {selectedAppointments.length > 0 && (
        <div className="border-t border-[var(--border-subtle)] px-4 py-3 bg-emerald-50/50 animate-fade-in">
          {selectedAppointments.map((apt, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`${compact ? "w-6 h-6" : "w-8 h-8"} rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0`}>
                <svg className={`${compact ? "w-3 h-3" : "w-4 h-4"} text-emerald-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`${compact ? "text-xs" : "text-sm"} font-semibold text-emerald-900`}>{apt.department}</p>
                <p className="text-[11px] text-emerald-700">
                  {apt.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {apt.time}
                </p>
              </div>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                Confirmed
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state hint */}
      {appointments.length === 0 && (
        <div className="px-4 pb-4 text-center">
          <p className="text-xs text-slate-400">Appointments will appear here when the agent books follow-ups</p>
        </div>
      )}
    </div>
  );
}
