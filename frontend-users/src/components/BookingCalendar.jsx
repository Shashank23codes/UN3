import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Check, X } from 'lucide-react';

const BookingCalendar = ({
    unavailableDates = [],
    startDate,
    endDate,
    onDateSelect,
    minStay = 1,
    maxStay = 30
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const unavailableSet = new Set(
        unavailableDates.map(d => new Date(d).toDateString())
    );

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const isDateUnavailable = (date) => {
        return unavailableSet.has(date.toDateString());
    };

    const isDateInPast = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isDateSelected = (date) => {
        if (!startDate) return false;
        const dateStr = date.toDateString();
        if (startDate && dateStr === startDate.toDateString()) return 'start';
        if (endDate && dateStr === endDate.toDateString()) return 'end';
        if (startDate && endDate && date > startDate && date < endDate) return 'between';
        return false;
    };

    const handleDateClick = (date) => {
        if (isDateUnavailable(date) || isDateInPast(date)) return;

        if (!startDate || (startDate && endDate)) {
            // Start new selection
            onDateSelect(date, null);
        } else if (date < startDate) {
            // Clicked before start date, reset
            onDateSelect(date, null);
        } else {
            // Check if any date in range is unavailable
            let hasUnavailable = false;
            const checkDate = new Date(startDate);
            while (checkDate <= date) {
                if (isDateUnavailable(checkDate)) {
                    hasUnavailable = true;
                    break;
                }
                checkDate.setDate(checkDate.getDate() + 1);
            }

            if (hasUnavailable) {
                onDateSelect(date, null);
            } else {
                onDateSelect(startDate, date);
            }
        }
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentMonth(newDate);
    };

    const renderCalendar = (monthOffset = 0) => {
        const displayMonth = new Date(currentMonth);
        displayMonth.setMonth(displayMonth.getMonth() + monthOffset);

        const daysInMonth = getDaysInMonth(displayMonth);
        const firstDay = getFirstDayOfMonth(displayMonth);
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
            const isUnavailable = isDateUnavailable(date);
            const isPast = isDateInPast(date);
            const selected = isDateSelected(date);
            const isDisabled = isUnavailable || isPast;

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(date)}
                    disabled={isDisabled}
                    className={`
                        h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                        ${isDisabled ? 'text-gray-300 cursor-not-allowed line-through' : 'hover:bg-gray-100 cursor-pointer'}
                        ${selected === 'start' ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
                        ${selected === 'end' ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
                        ${selected === 'between' ? 'bg-gray-100 text-gray-900' : ''}
                        ${isUnavailable && !isPast ? 'bg-red-50 text-red-300' : ''}
                    `}
                >
                    {day}
                </button>
            );
        }

        return (
            <div className="flex-1">
                <div className="text-center mb-4">
                    <h4 className="font-semibold text-gray-900">
                        {displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="h-10 flex items-center justify-center text-xs font-medium text-gray-500">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Select Dates</h3>
                        <p className="text-sm text-gray-500">
                            {minStay > 1 ? `Minimum ${minStay} nights` : 'Choose your check-in and check-out'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid - Two Months */}
            <div className="flex gap-8">
                {renderCalendar(0)}
                <div className="hidden lg:block">
                    {renderCalendar(1)}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-900"></div>
                    <span className="text-sm text-gray-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200"></div>
                    <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                        <X className="h-3 w-3 text-red-300" />
                    </div>
                    <span className="text-sm text-gray-600">Unavailable</span>
                </div>
            </div>

            {/* Selected Dates Summary */}
            {startDate && (
                <div className="mt-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-rose-600 font-medium">Your Trip</p>
                            <p className="text-gray-900 font-semibold">
                                {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {endDate && ` - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                            </p>
                        </div>
                        {startDate && endDate && (
                            <div className="text-right">
                                <p className="text-sm text-rose-600 font-medium">Duration</p>
                                <p className="text-gray-900 font-semibold">
                                    {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} nights
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingCalendar;
