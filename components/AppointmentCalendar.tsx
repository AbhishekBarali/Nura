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
}

export default function AppointmentCalendar({ appointments }: CalendarProps) {
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
    days.push(<div key={`pad-${i}`} className="h-9" />);
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
        className={`h-9 w-9 rounded-lg text-sm font-medium transition-all duration-150 relative flex items-center justify-center mx-auto ${
          isSelected
            ? "bg-blue-700 text-white shadow-sm"
            : hasAppointment
            ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 cursor-pointer"
            : isToday
            ? "bg-blue-50 text-blue-700 border border-blue-200"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        {day}
        {hasAppointment && !isSelected && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
        )}
      </button>
    );
  }

  return (
    <div className="elevated-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Clinic Schedule</h3>
        </div>
        {appointments.length > 0 && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
            {appointments.length} booked
          </span>
        )}
      </div>

      {/* Month Navigation */}
      <div className="px-4 pt-3 flex items-center justify-between">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-slate-700">{monthName}</span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="px-4 pt-3 grid grid-cols-7 gap-0">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="px-4 pb-3 grid grid-cols-7 gap-y-1">
        {days}
      </div>

      {/* Selected Appointment Detail */}
      {selectedAppointments.length > 0 && (
        <div className="border-t border-[var(--border-subtle)] px-4 py-3 bg-emerald-50 animate-fade-in">
          {selectedAppointments.map((apt, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-900">{apt.department}</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  {apt.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} at {apt.time}
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">Patient: {apt.patient}</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-full">
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
