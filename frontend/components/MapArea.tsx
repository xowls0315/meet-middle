"use client";

import { PiMapPinLineFill } from "react-icons/pi";
import { IoBalloonOutline } from "react-icons/io5";

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

interface MapAreaProps {
  participants: Participant[];
  anchor?: { lat: number; lng: number };
  finalPlace?: Place;
  candidates?: Place[];
  onCandidateSelect?: (place: Place) => void;
}

export default function MapArea({ participants, anchor, finalPlace, candidates = [], onCandidateSelect }: MapAreaProps) {
  // TODO: 카카오맵 SDK 연동
  // 현재는 플레이스홀더로 표시
  const hasData = participants.some((p) => p.selectedPlace) || finalPlace || candidates.length > 0;

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-xl border-2 border-blue-200 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 relative">
      {hasData ? (
        <div className="w-full h-full flex items-center justify-center flex-col gap-4 p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <PiMapPinLineFill className="text-6xl text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">카카오맵 연동 예정</h3>
            <p className="text-sm text-slate-600">백엔드 연동 후 카카오맵이 여기에 표시됩니다</p>
          </div>

          {/* 마커 정보 미리보기 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl w-full mt-4">
            {participants
              .filter((p) => p.selectedPlace)
              .map((p) => (
                <div key={p.label} className="px-3 py-2 bg-white rounded-lg border border-blue-200 text-center shadow-sm">
                  <div className="text-xs font-medium text-blue-600">{p.label}</div>
                  <div className="text-xs text-slate-500 truncate">{p.selectedPlace?.name}</div>
                </div>
              ))}

            {anchor && (
              <div className="px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200 text-center shadow-sm">
                <div className="text-xs font-medium text-yellow-700">중심점</div>
                <div className="text-xs text-slate-500">
                  {anchor.lat.toFixed(4)}, {anchor.lng.toFixed(4)}
                </div>
              </div>
            )}

            {finalPlace && (
              <div className="px-3 py-2 bg-green-50 rounded-lg border border-green-200 text-center shadow-sm">
                <div className="text-xs font-medium text-green-700">최종 추천</div>
                <div className="text-xs text-slate-500 truncate">{finalPlace.name}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <IoBalloonOutline className="text-6xl text-slate-400" />
            </div>
            <p className="text-slate-500">출발지를 입력하면 지도가 표시됩니다</p>
          </div>
        </div>
      )}
    </div>
  );
}
