"use client";

import { useState } from "react";
import ParticipantInput from "@/components/ParticipantInput";
import ResultCard from "@/components/ResultCard";
import MapArea from "@/components/MapArea";
import { RecommendResultSkeleton } from "@/components/RecommendSkeleton";
import { IoBalloonOutline } from "react-icons/io5";
import { BsSendArrowDown } from "react-icons/bs";
import { HiOutlineSave } from "react-icons/hi";
import { HiOutlineStar } from "react-icons/hi";
import { FaRegLightbulb } from "react-icons/fa6";
import { MdRecommend } from "react-icons/md";

interface Place {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl?: string;
  distance?: number;
}

interface Participant {
  label: string;
  query: string;
  selectedPlace: Place | null;
}

type ParticipantCount = 2 | 3 | 4;

export default function Home() {
  const [participantCount, setParticipantCount] = useState<ParticipantCount>(2);
  const [participants, setParticipants] = useState<Participant[]>([
    { label: "A", query: "", selectedPlace: null },
    { label: "B", query: "", selectedPlace: null },
  ]);
  const [result, setResult] = useState<{
    anchor?: { lat: number; lng: number };
    final?: Place;
    candidates?: Place[];
    used?: { category: string; radius: number };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // 참가자 수 변경
  const handleCountChange = (count: ParticipantCount) => {
    setParticipantCount(count);
    const labels = ["A", "B", "C", "D"];
    setParticipants(
      labels.slice(0, count).map((label) => {
        const existing = participants.find((p: Participant) => p.label === label);
        return existing || { label, query: "", selectedPlace: null };
      })
    );
    setResult(null);
    setShareUrl(null);
  };

  // 참가자 입력 변경
  const handleParticipantChange = (label: string, query: string) => {
    setParticipants((prev: Participant[]) => prev.map((p: Participant) => (p.label === label ? { ...p, query } : p)));
  };

  // 장소 선택
  const handlePlaceSelect = (label: string, place: Place | null) => {
    setParticipants((prev: Participant[]) => prev.map((p: Participant) => (p.label === label ? { ...p, selectedPlace: place } : p)));
  };

  // 추천 받기
  const handleRecommend = async () => {
    const allSelected = participants.every((p) => p.selectedPlace);
    if (!allSelected) {
      alert("모든 참가자의 출발지를 선택해주세요.");
      return;
    }

    setLoading(true);
    setResult(null);
    setShareUrl(null);

    try {
      // TODO: 백엔드 API 호출
      // POST /api/recommend

      // 목업 데이터
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const selectedPlaces = participants.filter((p: Participant) => p.selectedPlace).map((p: Participant) => p.selectedPlace!);

      // 평균 좌표 계산 (anchor)
      const avgLat = selectedPlaces.reduce((sum: number, p: Place) => sum + p.lat, 0) / selectedPlaces.length;
      const avgLng = selectedPlaces.reduce((sum: number, p: Place) => sum + p.lng, 0) / selectedPlaces.length;

      const mockFinal: Place = {
        placeId: "final-1",
        name: "강남역",
        address: "서울특별시 강남구 강남대로 396",
        lat: 37.498,
        lng: 127.0276,
        distance: 1250,
        placeUrl: "https://map.kakao.com/link/map/강남역,37.4980,127.0276",
      };

      const mockCandidates: Place[] = [
        {
          placeId: "cand-1",
          name: "서초역",
          address: "서울특별시 서초구 서초대로 396",
          lat: 37.4837,
          lng: 127.0324,
          distance: 1500,
        },
        {
          placeId: "cand-2",
          name: "교대역",
          address: "서울특별시 서초구 서초대로 397",
          lat: 37.4934,
          lng: 127.0146,
          distance: 1800,
        },
        {
          placeId: "cand-3",
          name: "역삼역",
          address: "서울특별시 강남구 테헤란로 124",
          lat: 37.4999,
          lng: 127.0374,
          distance: 2000,
        },
      ];

      setResult({
        anchor: { lat: avgLat, lng: avgLng },
        final: mockFinal,
        candidates: mockCandidates,
        used: { category: "SW8", radius: 2000 },
      });
    } catch (error) {
      alert("추천을 받는 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 공유 링크 생성
  const handleShare = async () => {
    if (!result) return;

    try {
      // TODO: 백엔드 API 호출
      // POST /api/share

      // 목업
      const mockShareId = "share_" + Date.now();
      const url = `${window.location.origin}/share/${mockShareId}`;
      setShareUrl(url);

      // 클립보드 복사
      await navigator.clipboard.writeText(url);
      alert("공유 링크가 클립보드에 복사되었습니다!");
    } catch (error) {
      alert("공유 링크 생성 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  // 다시하기
  const handleReset = () => {
    setResult(null);
    setShareUrl(null);
    setParticipants((prev: Participant[]) => prev.map((p: Participant) => ({ ...p, query: "", selectedPlace: null })));
  };

  const canRecommend = participants.every((p) => p.selectedPlace);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 헤더 섹션 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">만나</h1>
        <p className="text-lg text-slate-600">2~4명의 출발지를 입력하면 최적의 만남 장소를 추천해드립니다</p>
        <p className="text-sm text-slate-500 mt-2">완전 무료 서비스 | 자동완성 최적화로 빠르고 효율적으로</p>
      </div>

      {/* 참가자 수 선택 */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">참가자 수 선택</h2>
          <div className="flex gap-2">
            {([2, 3, 4] as ParticipantCount[]).map((count) => (
              <button
                key={count}
                onClick={() => handleCountChange(count)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  participantCount === count ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                {count}명
              </button>
            ))}
          </div>
        </div>

        {/* 참가자 입력 */}
        <div className="space-y-4">
          {participants.map((participant: Participant) => (
            <ParticipantInput
              key={participant.label}
              participant={participant}
              onChange={(query: string) => handleParticipantChange(participant.label, query)}
              onSelectPlace={(place: Place | null) => handlePlaceSelect(participant.label, place)}
            />
          ))}
        </div>

        {/* 추천받기 버튼 */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleRecommend}
            disabled={!canRecommend || loading}
            className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
              canRecommend && !loading
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                추천 중...
              </span>
            ) : (
              <>
                <MdRecommend className="inline-block mr-2" />
                추천받기
              </>
            )}
          </button>

          {result && (
            <button onClick={handleReset} className="px-6 py-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              다시하기
            </button>
          )}
        </div>
      </div>

      {/* 로딩 중 스켈레톤 UI */}
      {loading && <RecommendResultSkeleton />}

      {/* 결과 영역 */}
      {result && !loading && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* 지도 */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">지도</h2>
            <MapArea participants={participants} anchor={result.anchor} finalPlace={result.final} candidates={result.candidates} />
          </div>

          {/* 결과 카드 */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">추천 결과</h2>

            {/* 최종 추천 */}
            {result.final && (
              <div className="mb-4">
                <ResultCard place={result.final} isFinal />
              </div>
            )}

            {/* 검색 정보 */}
            {result.used && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">검색 범위:</span> {result.used.radius}m 반경, {result.used.category === "SW8" && "지하철역"}
                  {result.used.category === "CT1" && "문화시설"}
                  {result.used.category === "PO3" && "공공기관"}
                  {result.used.category === "AT4" && "관광명소"}
                </p>
              </div>
            )}

            {/* 후보 리스트 */}
            {result.candidates && result.candidates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-3">다른 후보 ({result.candidates.length}개)</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {result.candidates.map((candidate: Place) => (
                    <ResultCard key={candidate.placeId} place={candidate} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      {result && (
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center gap-2"
            >
              <BsSendArrowDown />
              공유 링크 만들기
            </button>

            {shareUrl && (
              <div className="flex-1 min-w-[200px] px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <span className="text-sm text-blue-800 truncate mr-2">{shareUrl}</span>
                <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
                  복사
                </button>
              </div>
            )}

            {/* TODO: 로그인 상태일 때만 표시 */}
            <button
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              onClick={() => alert("로그인 후 사용 가능합니다.")}
            >
              <HiOutlineSave />
              이번 결과 저장
            </button>

            <button
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              onClick={() => alert("로그인 후 사용 가능합니다.")}
            >
              <HiOutlineStar />
              즐겨찾기 추가
            </button>
          </div>
        </div>
      )}

      {/* 안내 문구 */}
      {!result && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start justify-center gap-3">
            <FaRegLightbulb className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 text-left">
              <strong>팁:</strong> 자동완성은 최소 2글자 입력 시 표시되며, 500ms 디바운스가 적용됩니다.
              <br />
              모든 참가자의 출발지를 선택하신 후 "추천받기" 버튼을 눌러주세요.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
