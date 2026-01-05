"use client";

import { use, useState, useEffect } from "react";
import ResultCard from "@/components/ResultCard";
import MapArea from "@/components/MapArea";
import Link from "next/link";
import { SharePageSkeleton } from "@/components/SkeletonList";

interface Place {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl?: string;
  distance?: number;
}

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export default function SharePage({ params }: SharePageProps) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState<{
    anchor?: { lat: number; lng: number };
    final?: Place;
    candidates?: Place[];
    participants?: Array<{ label: string; lat: number; lng: number }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // TODO: 백엔드 API 호출
  // useEffect(() => {
  //   const fetchShare = async () => {
  //     try {
  //       const res = await fetch(`/api/share/${id}`);
  //       if (!res.ok) throw new Error('공유 데이터를 불러올 수 없습니다.');
  //       const data = await res.json();
  //       setShareData(data);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchShare();
  // }, [id]);

  // 목업 데이터
  useEffect(() => {
    setTimeout(() => {
      setShareData({
        anchor: { lat: 37.498, lng: 127.0276 },
        final: {
          placeId: "final-1",
          name: "강남역",
          address: "서울특별시 강남구 강남대로 396",
          lat: 37.498,
          lng: 127.0276,
          distance: 1250,
          placeUrl: "https://map.kakao.com/link/map/강남역,37.4980,127.0276",
        },
        candidates: [
          {
            placeId: "cand-1",
            name: "서초역",
            address: "서울특별시 서초구 서초대로 396",
            lat: 37.4837,
            lng: 127.0324,
            distance: 1500,
          },
        ],
        participants: [
          { label: "A", lat: 37.5665, lng: 126.978 },
          { label: "B", lat: 37.4845, lng: 127.0337 },
        ],
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">공유된 추천 결과</h1>
        </div>
        <SharePageSkeleton />
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">공유 데이터를 찾을 수 없습니다</h1>
          <p className="text-slate-600 mb-6">{error || "링크가 만료되었거나 존재하지 않습니다."}</p>
          <Link href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">공유된 추천 결과</h1>
        <p className="text-slate-600">다른 사람이 공유한 만남 장소 추천입니다</p>
        <Link href="/" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium">
          ← 새로운 추천 받기
        </Link>
      </div>

      {/* 결과 영역 */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* 지도 */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">지도</h2>
          <MapArea
            participants={
              shareData.participants?.map((p: { label: string; lat: number; lng: number }) => ({
                label: p.label,
                query: "",
                selectedPlace: {
                  placeId: `participant-${p.label}`,
                  name: `${p.label} 출발지`,
                  address: "",
                  lat: p.lat,
                  lng: p.lng,
                },
              })) || []
            }
            anchor={shareData.anchor}
            finalPlace={shareData.final}
            candidates={shareData.candidates}
          />
        </div>

        {/* 결과 카드 */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">추천 결과</h2>

          {/* 최종 추천 */}
          {shareData.final && (
            <div className="mb-4">
              <ResultCard place={shareData.final} isFinal />
            </div>
          )}

          {/* 후보 리스트 */}
          {shareData.candidates && shareData.candidates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">다른 후보 ({shareData.candidates.length}개)</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {shareData.candidates.map((candidate: Place) => (
                  <ResultCard key={candidate.placeId} place={candidate} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200 text-center">
        <Link href="/" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
          나도 추천 받기
        </Link>
      </div>
    </div>
  );
}
