import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder: string;
  multiple?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  multiple = false,
  icon,
  disabled = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: string) => {
    if (multiple) {
      const newValue = selectedValues.includes(option)
        ? selectedValues.filter(v => v !== option)
        : [...selectedValues, option];
      onChange(newValue);
    } else {
      onChange(option);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Focus the search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure the dropdown is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const removeValue = (valueToRemove: string) => {
    if (multiple) {
      onChange(selectedValues.filter(v => v !== valueToRemove));
    } else {
      onChange('');
    }
  };

  const displayValue = () => {
    if (selectedValues.length === 0) return placeholder;
    if (multiple) {
      return selectedValues.length === 1 
        ? selectedValues[0] 
        : `${selectedValues.length} selected`;
    }
    return selectedValues[0];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full rounded-md border px-3 py-2 text-sm bg-white ${
          disabled 
            ? 'border-gray-200 cursor-not-allowed bg-gray-50' 
            : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 cursor-pointer'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            {icon && <span className="mr-2 text-gray-400">{icon}</span>}
            <span className={`truncate ${
              selectedValues.length === 0 
                ? (disabled ? 'text-gray-400' : 'text-gray-500')
                : (disabled ? 'text-gray-600' : 'text-gray-900')
            }`}>
              {displayValue()}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
            disabled ? 'text-gray-300' : 'text-gray-400'
          } ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Selected values as tags (for multiple selection) */}
      {multiple && selectedValues.length > 0 && !disabled && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedValues.map(val => (
            <span
              key={val}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
            >
              {val}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeValue(val);
                }}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option}
                  className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleOptionClick(option)}
                >
                  <span className="truncate">{option}</span>
                  {selectedValues.includes(option) && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Clear all button for multiple selection */}
          {multiple && selectedValues.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              <button
                onClick={() => onChange([])}
                className="w-full text-xs text-gray-600 hover:text-gray-800 py-1"
              >
                Clear all selections
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}