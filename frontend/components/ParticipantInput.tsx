"use client";

import { useState, useRef, useEffect } from "react";

interface Place {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl?: string;
}

interface Participant {
  label: string;
  query: string;
  selectedPlace: Place | null;
}

interface ParticipantInputProps {
  participant: Participant;
  onChange: (query: string) => void;
  onSelectPlace: (place: Place | null) => void;
  disabled?: boolean;
}

export default function ParticipantInput({ participant, onChange, onSelectPlace, disabled = false }: ParticipantInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // TODO: 백엔드 연동 시 실제 API 호출
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);

    // 디바운스 처리
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      // 실제 API 호출 대신 목업 데이터
      // TODO: GET /api/search/suggest?q=...
      const mockSuggestions: Place[] = [
        {
          placeId: "1",
          name: `${query}역`,
          address: `서울특별시 강남구 ${query}`,
          lat: 37.5665,
          lng: 126.978,
        },
        {
          placeId: "2",
          name: `${query} 문화센터`,
          address: `서울특별시 서초구 ${query}로 123`,
          lat: 37.4845,
          lng: 127.0337,
        },
        {
          placeId: "3",
          name: `${query} 공원`,
          address: `서울특별시 송파구 ${query}`,
          lat: 37.5146,
          lng: 127.1054,
        },
      ].slice(0, 7);

      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
      setIsLoading(false);
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(value);

    // 선택된 장소가 있으면 초기화
    if (participant.selectedPlace) {
      onSelectPlace(null);
    }

    fetchSuggestions(value);
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

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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

      {/* 자동완성 리스트 */}
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

      {/* 선택된 장소 정보 */}
      {participant.selectedPlace && (
        <div className="mt-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-800">✓ {participant.selectedPlace.name}</div>
          <div className="text-xs text-green-600 mt-1">{participant.selectedPlace.address}</div>
        </div>
      )}
    </div>
  );
}
