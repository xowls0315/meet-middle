"use client";

import { useState, useRef, useEffect } from "react";
import { Place, Participant } from "@/types";
import { usePlaceSearch } from "@/hooks/queries/usePlaceSearch";

interface ParticipantInputProps {
  participant: Participant;
  onChange: (query: string) => void;
  onSelectPlace: (place: Place | null) => void;
  disabled?: boolean;
}

export default function ParticipantInput({ participant, onChange, onSelectPlace, disabled = false }: ParticipantInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { suggestions, isLoading, error } = usePlaceSearch(participant.query);

  useEffect(() => {
    if (error instanceof Error) {
      if (error.message.includes("429")) {
        alert("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
      } else if (error.message.includes("500")) {
        console.error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  }, [error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(value);

    if (participant.selectedPlace) {
      onSelectPlace(null);
    }

    if (value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectPlace = (place: Place) => {
    onSelectPlace(place);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          {participant.label}
        </div>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={participant.query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            disabled={disabled}
            placeholder={`${participant.label} 출발지 입력 (최소 2글자)`}
            className={`w-full px-4 py-3 rounded-lg border-2 ${
              participant.selectedPlace ? "border-green-400 bg-green-50" : "border-blue-200 focus:border-blue-400"
            } focus:outline-none transition-all ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
          />

          {participant.selectedPlace && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}

          {isLoading && !participant.selectedPlace && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && !participant.selectedPlace && (
        <div className="absolute left-0 right-0 mt-2 bg-white border-2 border-blue-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.placeId}
              type="button"
              onClick={() => handleSelectPlace(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-slate-800">{suggestion.name}</div>
              <div className="text-sm text-slate-500 mt-1">{suggestion.address}</div>
            </button>
          ))}
        </div>
      )}

      {participant.selectedPlace && (
        <div className="mt-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-800">✓ {participant.selectedPlace.name}</div>
          <div className="text-xs text-green-600 mt-1">{participant.selectedPlace.address}</div>
        </div>
      )}
    </div>
  );
}
