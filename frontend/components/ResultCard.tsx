"use client";

interface Place {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl?: string;
  distance?: number;
}

interface ResultCardProps {
  place: Place;
  isFinal?: boolean;
  onSelect?: () => void;
}

export default function ResultCard({ place, isFinal = false, onSelect }: ResultCardProps) {
  return (
    <div
      className={`p-6 rounded-xl border-2 ${
        isFinal ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 shadow-lg" : "bg-white border-blue-200 hover:border-blue-300 shadow-md"
      } transition-all cursor-pointer`}
      onClick={onSelect}
    >
      {isFinal && (
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full">최종 추천</span>
        </div>
      )}

      <h3 className={`text-xl font-bold mb-2 ${isFinal ? "text-blue-900" : "text-slate-800"}`}>{place.name}</h3>

      <p className="text-sm text-slate-600 mb-4">{place.address}</p>

      {place.distance && <div className="text-sm text-slate-500 mb-4">평균 거리: {place.distance.toFixed(0)}m</div>}

      <div className="flex items-center justify-between">
        <a
          href={place.placeUrl || `https://map.kakao.com/link/map/${place.name},${place.lat},${place.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          카카오맵에서 보기
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {!isFinal && (
          <button
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
          >
            선택
          </button>
        )}
      </div>
    </div>
  );
}
