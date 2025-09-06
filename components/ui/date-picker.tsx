"use client"

import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { fr } from "date-fns/locale"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Sélectionner une date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(date || new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  }

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onDateChange?.(selectedDate)
    setOpen(false)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth)
    const today = new Date()
    const isCurrentMonth = currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()
    
    const days = []
    const weekDays = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

    // Week day headers
    weekDays.forEach((day, index) => {
      days.push(
        <div key={`weekday-${index}`} className="text-xs font-medium text-white/70 text-center py-2">
          {day}
        </div>
      )
    })

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isSelected = date && 
        date.getDate() === day && 
        date.getMonth() === currentMonth.getMonth() && 
        date.getFullYear() === currentMonth.getFullYear()
      const isToday = isCurrentMonth && today.getDate() === day

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={cn(
            "relative w-8 h-8 text-sm rounded-md transition-all duration-200",
            "hover:bg-accent/50 hover:text-accent-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            "flex items-center justify-center",
            isSelected && "bg-primary text-primary-foreground font-semibold hover:bg-primary/90",
            isToday && !isSelected && "bg-accent text-accent-foreground font-medium",
          )}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            "h-8 sm:h-10 px-3 py-2 text-xs sm:text-sm",
            "bg-slate-900/80 border border-slate-700",
            "hover:bg-slate-800/80 hover:text-white",
            "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "rounded-md transition-all duration-200",
            "backdrop-blur-sm",
            !date && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-black" />
          <span className="truncate flex-1 text-left text-lg sm:text-xl font-semibold text-black">
            {date ? format(date, "dd/MM/yyyy", { locale: fr }) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-80 sm:w-auto p-0 z-50",
          "border border-slate-700 shadow-2xl",
          "bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95",
          "rounded-lg overflow-hidden",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
        )}
        align="start"
        sideOffset={4}
      >
        <div className="p-4 space-y-4">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0 hover:bg-slate-800/80"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold text-sm sm:text-base text-center min-w-[140px] text-white">
              {format(currentMonth, "MMMM yyyy", { locale: fr })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0 hover:bg-slate-800/80"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t border-slate-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onDateChange?.(new Date())
                setOpen(false)
              }}
              className="flex-1 h-8 text-xs bg-slate-800/80 text-white border-slate-700 hover:bg-slate-700"
            >
              Aujourd'hui
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onDateChange?.(undefined)
                setOpen(false)
              }}
              className="flex-1 h-8 text-xs bg-slate-800/80 text-white border-slate-700 hover:bg-slate-700"
            >
              Effacer
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}