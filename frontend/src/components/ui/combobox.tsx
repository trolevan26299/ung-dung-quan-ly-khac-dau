"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "../../lib/utils"

interface ComboboxOption {
  value: string
  label: string
  subtitle?: string
  disabled?: boolean
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
  loading?: boolean
  emptyMessage?: string
  allowClear?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  disabled = false,
  className = "",
  error = false,
  loading = false,
  emptyMessage = "Không có dữ liệu",
  allowClear = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  const selectedOption = options.find((option) => option.value === value)

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (option.subtitle && option.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setOpen(false)
    setSearchQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  const handleToggle = () => {
    if (disabled) return
    setOpen(!open)
    setSearchQuery('')
  }

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Main trigger button */}
      <div
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer",
          "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
          "transition-colors duration-200",
          disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:border-gray-400",
          error ? "border-red-500" : "border-gray-300",
          open ? "ring-2 ring-primary-500 border-transparent" : ""
        )}
      >
        <div className="flex items-center flex-1 min-w-0">
          {selectedOption ? (
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {selectedOption.label}
              </div>
              {selectedOption.subtitle && (
                <div className="text-xs text-gray-500 truncate">
                  {selectedOption.subtitle}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center space-x-1 ml-2">
          {allowClear && selectedOption && !disabled && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronsUpDown 
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              open ? "transform rotate-180" : ""
            )} 
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>
                Đang tải...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                {searchQuery ? `Không tìm thấy "${searchQuery}"` : emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  className={cn(
                    "px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center",
                    option.disabled 
                      ? "text-gray-400 cursor-not-allowed bg-gray-50" 
                      : "text-gray-900 hover:bg-gray-50",
                    option.value === value ? "bg-primary-100 text-primary-900 font-medium" : ""
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{option.label}</div>
                    {option.subtitle && (
                      <div className="text-xs text-gray-500 truncate mt-1">
                        {option.subtitle}
                      </div>
                    )}
                  </div>
                  {option.value === value && (
                    <Check className="ml-2 h-4 w-4 text-primary-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
} 