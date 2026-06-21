"use client";

import * as React from "react";
import { cn } from "@lib/utils";
import { Search, X } from "lucide-react";

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onSearch?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export function SearchInput({
  className,
  onSearch,
  onChange,
  suggestions = [],
  onSuggestionClick,
  placeholder = "Search...",
  value,
  ...props
}: SearchInputProps) {
  const [inputValue, setInputValue] = React.useState((value as string) ?? "");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange?.(e);
    setShowSuggestions(e.target.value.length > 0 && suggestions.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch?.(inputValue);
      setShowSuggestions(false);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setInputValue("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onSearch?.(suggestion);
    onSuggestionClick?.(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (inputValue && suggestions.length > 0) setShowSuggestions(true);
        }}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full rounded-md border bg-popover shadow-md z-50">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
