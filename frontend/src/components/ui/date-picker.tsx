"use client"

import * as React from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./Button"
import { Calendar } from "./calendar"

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
  placeholder = "Chọn ngày",
  className,
  disabled = false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateChange?.(undefined)
  }
  
  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-medium h-12 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500 bg-white",
          !date && "text-gray-500"
        )}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
        <span className="flex-1">
          {date ? format(date, "dd/MM/yyyy", { locale: vi }) : placeholder}
        </span>
        {date && (
          <X 
            className="h-4 w-4 text-gray-400 hover:text-gray-600 ml-2" 
            onClick={handleClear}
          />
        )}
      </Button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popover */}
          <div className="absolute top-full left-0 z-50 mt-2 w-auto">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                onDateChange?.(selectedDate)
                setIsOpen(false)
              }}
              initialFocus
              locale={vi}
              className="rounded-lg border border-gray-200 shadow-lg"
            />
          </div>
        </>
      )}
    </div>
  )
} 