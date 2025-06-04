import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useDebounceCallback } from '../../hooks/useDebounce';

interface SearchInputProps {
    placeholder?: string;
    onSearch: (value: string) => void;
    className?: string;
    debounceMs?: number;
    showClearButton?: boolean;
    value?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    placeholder = 'Tìm kiếm...',
    onSearch,
    className = '',
    debounceMs = 300,
    showClearButton = true,
    value: controlledValue
}) => {
    const [internalValue, setInternalValue] = useState(controlledValue || '');
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const debouncedSearch = useDebounceCallback((searchValue: string) => {
        onSearch(searchValue);
    }, debounceMs);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (!isControlled) {
            setInternalValue(newValue);
        }

        debouncedSearch(newValue);
    }, [isControlled, debouncedSearch]);

    const handleClear = useCallback(() => {
        if (!isControlled) {
            setInternalValue('');
        }
        onSearch('');
    }, [isControlled, onSearch]);

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="pl-10 pr-10"
                />
                {showClearButton && value && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}; 