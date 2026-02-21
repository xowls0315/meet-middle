"use client";

import { use, useState, useEffect } from "react";
import ResultCard from "@/_components/ui/ResultCard";
import MapArea from "@/_components/ui/MapArea";
import Link from "next/link";
import { SharePageSkeleton } from "@/_components/ui/skeleton/SkeletonList";
import { Place, ShareData } from "@/types";
import { getShare } from "@/lib/api/share";
import { IoArrowBackOutline } from "react-icons/io5";

const CATEGORIES = [
  { code: "SW8", name: "지하철역" },
  { code: "CT1", name: "문화시설" },
  { code: "PO3", name: "공공기관" },
  { code: "AT4", name: "관광명소" },
] as const;

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export default function SharePage({ params }: SharePageProps) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mapFocusPlace, setMapFocusPlace] = useState<Place | null>(null);

  // 백엔드 API 호출
  useEffect(() => {
    const fetchShare = async () => {
      try {
        const data = await getShare(id);
        setShareData(data);
        // 공유 시 선택된 카테고리를 기본 탭으로 사용, 없으면 used.category 또는 첫 번째 카테고리
        if (data.categoryResults && Object.keys(data.categoryResults).length > 0) {
          const preferred =
            data.selectedCategoryCode && data.categoryResults[data.selectedCategoryCode]
              ? data.selectedCategoryCode
              : data.used?.category && data.categoryResults[data.used.category]
                ? data.used.category
                : Object.keys(data.categoryResults)[0];
          setSelectedCategory(preferred);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "공유 데이터를 불러올 수 없습니다.";
        setError(errorMessage);
        console.error("공유 데이터 조회 오류:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShare();
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
        <p className="text-slate-600">
          {shareData?.user?.nickname ? (
            <>
              <span className="font-bold">{shareData.user.nickname}</span> 님이 공유한 만남 장소 추천입니다
            </>
          ) : (
            "다른 사람이 공유한 만남 장소 추천입니다"
          )}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <IoArrowBackOutline />
          새로운 추천 받기
        </Link>
      </div>

      {/* 결과 영역 */}
      {(() => {
        const hasCategoryResults = shareData.categoryResults && Object.keys(shareData.categoryResults).length > 0;
        const categoryResult = hasCategoryResults && selectedCategory
          ? shareData.categoryResults![selectedCategory]
          : null;
        const displayCandidates = categoryResult?.candidates ?? shareData.candidates ?? [];
        const displayUsed = categoryResult?.used ?? shareData.used;
        const categoryNames: Record<string, string> = { SW8: "지하철역", CT1: "문화시설", PO3: "공공기관", AT4: "관광명소" };
        const sharedFinal = shareData.final;

        return (
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
                finalPlace={sharedFinal ?? undefined}
                candidates={displayCandidates}
                focusPlace={mapFocusPlace ?? undefined}
                readOnly={true}
              />
            </div>

            {/* 결과 카드 */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">추천 결과</h2>

              {/* 카테고리 탭 (모든 카테고리 표시) */}
              {hasCategoryResults && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const hasResults =
                      shareData.categoryResults![cat.code]?.final ||
                      (shareData.categoryResults![cat.code]?.candidates?.length ?? 0) > 0;
                    return (
                      <button
                        key={cat.code}
                        onClick={() => {
                          setSelectedCategory(cat.code);
                          setMapFocusPlace(null);
                        }}
                        disabled={!hasResults}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          selectedCategory === cat.code
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                            : hasResults
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 최종 추천 (공유된 장소 고정, 카테고리 변경해도 바뀌지 않음) */}
              {sharedFinal && (
                <div className="mb-4">
                  {hasCategoryResults && shareData.selectedCategoryCode && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-2">
                      {categoryNames[shareData.selectedCategoryCode] ?? shareData.selectedCategoryCode}
                    </span>
                  )}
                  <ResultCard place={sharedFinal} isFinal />
                </div>
              )}

              {/* 검색 정보 */}
              {displayUsed && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">검색 범위:</span> {displayUsed.radius}m 반경,{" "}
                    {categoryNames[displayUsed.category ?? ""] ?? displayUsed.category}
                  </p>
                </div>
              )}

              {/* 후보 리스트 - 클릭 시 지도가 해당 장소로 이동 */}
              {displayCandidates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-3">다른 후보 ({displayCandidates.length}개)</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {displayCandidates.map((candidate: Place) => (
                      <div
                        key={candidate.placeId}
                        role="button"
                        tabIndex={0}
                        onClick={() => setMapFocusPlace(candidate)}
                        onKeyDown={(e) => e.key === "Enter" && setMapFocusPlace(candidate)}
                        className="cursor-pointer rounded-xl border-2 border-transparent hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <ResultCard place={candidate} hideSelectButton />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 액션 버튼 */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200 text-center">
        <Link href="/" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
          나도 추천 받기
        </Link>
      </div>
    </div>
  );
}
