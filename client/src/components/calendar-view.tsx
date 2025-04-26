import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Generate days for the current month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate the start day of the month (0 = Sunday, 1 = Monday, etc.)
  const startDay = monthStart.getDay();
  
  // Generate an array of days including trailing/leading days from adjacent months
  const calendarDays = [];
  
  // Add days from previous month to fill the first row
  for (let i = 0; i < startDay; i++) {
    const prevMonthDay = new Date(monthStart);
    prevMonthDay.setDate(prevMonthDay.getDate() - (startDay - i));
    calendarDays.push(prevMonthDay);
  }
  
  // Add days from current month
  calendarDays.push(...daysInMonth);
  
  // Add days from next month to complete the grid
  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  if (calendarDays.length < totalCells) {
    const daysToAdd = totalCells - calendarDays.length;
    for (let i = 1; i <= daysToAdd; i++) {
      const nextMonthDay = new Date(monthEnd);
      nextMonthDay.setDate(nextMonthDay.getDate() + i);
      calendarDays.push(nextMonthDay);
    }
  }
  
  // Handle month navigation
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="bg-gray-800 text-gray-300 py-1 px-3 text-sm font-medium rounded-md mb-4 inline-block">
          YOUR SCHEDULE
        </div>
        
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium text-white">
            {format(currentDate, "MMMM")}
          </h3>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 text-center text-sm mb-2">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
            <div key={day} className="py-1 text-gray-500">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={index}
                className={cn(
                  "aspect-square flex items-center justify-center py-2 rounded-md cursor-pointer",
                  isSelected ? "bg-gray-800" : "hover:bg-gray-800",
                  isCurrentDay && "font-semibold",
                )}
                onClick={() => setSelectedDate(day)}
              >
                <span className={cn(
                  isCurrentMonth ? "text-white" : "text-gray-500"
                )}>
                  {format(day, "d")}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Calendar Footer */}
        <div className="mt-4 flex items-center text-sm text-gray-400">
          <span className="inline-flex items-center">
            <CalendarIcon className="h-4 w-4 text-primary mr-2" />
            {format(selectedDate, "EEE, MMM d").toUpperCase()}
          </span>
          <span className="ml-3">Nothing's on the schedule</span>
        </div>
      </CardContent>
    </Card>
  );
}
