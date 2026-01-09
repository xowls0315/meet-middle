"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ParticipantInput from "@/_components/ui/ParticipantInput";
import ResultCard from "@/_components/ui/ResultCard";
import MapArea from "@/_components/ui/MapArea";
import { RecommendResultSkeleton } from "@/_components/ui/skeleton/RecommendSkeleton";
import { BsSendArrowDown } from "react-icons/bs";
import { HiOutlineSave } from "react-icons/hi";
import { HiOutlineStar } from "react-icons/hi";
import { FaRegLightbulb } from "react-icons/fa6";
import { MdRecommend } from "react-icons/md";
import { VscBook } from "react-icons/vsc";
import { Place, Participant, ParticipantCount, RecommendResponse } from "@/types";
import { recommend } from "@/lib/api/recommend";
import { createShare } from "@/lib/api/share";
import { createMeeting } from "@/lib/api/meetings";
import { createFavorite } from "@/lib/api/favorites";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isLoggedIn } = useAuth();
  const [participantCount, setParticipantCount] = useState<ParticipantCount>(2);
  const [participants, setParticipants] = useState<Participant[]>([
    { label: "A", query: "", selectedPlace: null },
    { label: "B", query: "", selectedPlace: null },
  ]);
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [categoryResults, setCategoryResults] = useState<Map<string, RecommendResponse>>(new Map());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // 선택된 카테고리
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // 후보 장소 선택 (최종 추천 장소 변경)
  const handleCandidateSelect = (place: Place) => {
    if (result && selectedCategory) {
      // 선택된 카테고리의 결과를 업데이트
      const categoryResult = categoryResults.get(selectedCategory);
      if (categoryResult) {
        const updatedCategoryResult = {
          ...categoryResult,
          final: place,
        };
        // categoryResults 업데이트
        setCategoryResults((prev) => {
          const newMap = new Map(prev);
          newMap.set(selectedCategory, updatedCategoryResult);
          return newMap;
        });
        // result도 업데이트
        setResult(updatedCategoryResult);
      } else {
        // 카테고리 결과가 없으면 기존 로직 유지
        setResult({
          ...result,
          final: place,
        });
      }
    }
  };

  // 선택된 카테고리가 변경될 때 result 업데이트
  useEffect(() => {
    if (selectedCategory && categoryResults.has(selectedCategory)) {
      const categoryResult = categoryResults.get(selectedCategory);
      if (categoryResult) {
        setResult(categoryResult);
      }
    }
  }, [selectedCategory, categoryResults]);

  // 추천 받기
  const handleRecommend = async () => {
    const allSelected = participants.every((p) => p.selectedPlace);
    if (!allSelected) {
      alert("모든 참가자의 출발지를 선택해주세요.");
      return;
    }

    setLoading(true);
    setResult(null);
    setCategoryResults(new Map());
    setSelectedCategory(null); // 카테고리 선택 초기화
    setShareUrl(null);
    setError(null);

    try {
      // 참가자 좌표만 추출
      const requestData = participants
        .filter((p) => p.selectedPlace)
        .map((p) => ({
          label: p.label,
          lat: p.selectedPlace!.lat,
          lng: p.selectedPlace!.lng,
        }));

      // 4가지 카테고리별로 추천 받기
      const categories = [
        { code: "SW8", name: "지하철역" },
        { code: "CT1", name: "문화시설" },
        { code: "PO3", name: "공공기관" },
        { code: "AT4", name: "관광명소" },
      ];

      const results = new Map<string, RecommendResponse>();
      let firstResult: RecommendResponse | null = null;

      // 모든 카테고리에 대해 병렬로 요청
      await Promise.all(
        categories.map(async (category) => {
          try {
            // 백엔드 API 호출 (카테고리 파라미터 전달)
            const response = await recommend({
              participants: requestData,
              category: category.code as "SW8" | "CT1" | "PO3" | "AT4",
            });
            results.set(category.code, response);

            // 첫 번째 결과를 기본 결과로 설정 (기존 호환성 유지)
            if (!firstResult) {
              firstResult = response;
            }
          } catch (error) {
            console.error(`${category.name} 추천 오류:`, error);
            // 일부 카테고리 실패해도 계속 진행
          }
        })
      );

      setCategoryResults(results);

      // 첫 번째 카테고리(지하철역)를 기본 선택으로 설정
      if (results.size > 0) {
        const defaultCategory = "SW8";
        setSelectedCategory(defaultCategory);
        // 기본 카테고리의 결과를 result에 설정
        const defaultResult = results.get(defaultCategory);
        if (defaultResult) {
          setResult(defaultResult);
        } else if (firstResult) {
          // 기본 카테고리에 결과가 없으면 첫 번째 결과 사용
          setResult(firstResult);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "추천을 받는 중 오류가 발생했습니다.";
      setError(errorMessage);
      alert(errorMessage);
      console.error("추천 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 공유 링크 생성
  const handleShare = async () => {
    if (!result) return;

    try {
      // 참가자 좌표 추출
      const participantsData = participants
        .filter((p) => p.selectedPlace)
        .map((p) => ({
          label: p.label,
          lat: p.selectedPlace!.lat,
          lng: p.selectedPlace!.lng,
        }));

      // 백엔드 API 호출
      const shareResponse = await createShare({
        anchor: result.anchor,
        participants: participantsData,
        final: result.final,
        candidates: result.candidates,
        used: result.used,
      });

      // 백엔드에서 제공하는 URL이 있으면 사용, 없으면 프론트엔드 URL 생성
      const url = shareResponse.url || `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareResponse.shareId}`;
      setShareUrl(url);

      // 모바일 Web Share API 우선 사용
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: "만남 장소 추천",
            text: "만남 장소 추천 결과를 공유합니다",
            url: url,
          });
          alert("공유가 완료되었습니다!");
          return;
        } catch (shareError: unknown) {
          // 사용자가 공유를 취소한 경우
          const error = shareError as { name?: string };
          if (error.name === "AbortError") {
            return; // 조용히 종료
          }
          // 다른 에러는 클립보드 복사로 fallback
        }
      }

      // 클립보드 복사 (Fallback)
      try {
        // 모바일 Safari를 위한 안전한 클립보드 복사
        if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
          alert("공유 링크가 클립보드에 복사되었습니다!");
        } else {
          // 구형 브라우저를 위한 fallback
          const textArea = document.createElement("textarea");
          textArea.value = url;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            const successful = document.execCommand("copy");
            if (successful) {
              alert("공유 링크가 클립보드에 복사되었습니다!");
            } else {
              throw new Error("복사 실패");
            }
          } catch (err) {
            // 복사 실패 시 URL을 직접 표시
            prompt("공유 링크를 복사하세요:", url);
          } finally {
            document.body.removeChild(textArea);
          }
        }
      } catch (clipboardError) {
        // 클립보드 복사 실패 시 URL을 직접 표시
        prompt("공유 링크를 복사하세요:", url);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "공유 링크 생성 중 오류가 발생했습니다.";
      alert(errorMessage);
      console.error("공유 오류:", error);
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
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Meet-Middle</h1>
        <p className="text-lg font-bold text-slate-600">2~4명의 출발지를 입력하면 최적의 만남 장소를 추천해드립니다</p>
        <p className="text-sm text-slate-500 mt-2">완전 무료 서비스 | 자동완성 최적화로 빠르고 효율적으로</p>
        <Link
          href="/guide"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <VscBook />
          처음 사용하시나요? 가이드 보기
        </Link>
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
                  participantCount === count ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" : "bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
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
            <MapArea
              participants={participants}
              anchor={selectedCategory && categoryResults.has(selectedCategory) ? categoryResults.get(selectedCategory)?.anchor : result.anchor}
              finalPlace={selectedCategory && categoryResults.has(selectedCategory) ? categoryResults.get(selectedCategory)?.final : result.final}
              candidates={selectedCategory && categoryResults.has(selectedCategory) ? categoryResults.get(selectedCategory)?.candidates : result.candidates}
              onCandidateSelect={handleCandidateSelect}
            />
          </div>

          {/* 결과 카드 */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">추천 결과</h2>

            {/* 카테고리 선택 버튼 */}
            {categoryResults.size > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {[
                  { code: "SW8", name: "지하철역" },
                  { code: "CT1", name: "문화시설" },
                  { code: "PO3", name: "공공기관" },
                  { code: "AT4", name: "관광명소" },
                ].map((category) => {
                  const isSelected = selectedCategory === category.code;
                  const hasResults =
                    categoryResults.has(category.code) &&
                    (categoryResults.get(category.code)?.final || (categoryResults.get(category.code)?.candidates && categoryResults.get(category.code)!.candidates!.length > 0));

                  return (
                    <button
                      key={category.code}
                      onClick={() => setSelectedCategory(category.code)}
                      disabled={!hasResults}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                          : hasResults
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 선택된 카테고리 결과 표시 */}
            {categoryResults.size > 0 && selectedCategory ? (
              (() => {
                const categoryResult = categoryResults.get(selectedCategory);
                if (!categoryResult) return null;

                const categoryNames: Record<string, string> = {
                  SW8: "지하철역",
                  CT1: "문화시설",
                  PO3: "공공기관",
                  AT4: "관광명소",
                };
                const categoryName = categoryNames[selectedCategory] || selectedCategory;

                return (
                  <div className="border-2 border-blue-200 rounded-xl p-4 bg-white">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{categoryName}</span>
                      {categoryResult.used && <span className="text-sm text-slate-600 font-normal">({categoryResult.used.radius}m 반경)</span>}
                    </h3>

                    {/* 해당 카테고리의 최종 추천 */}
                    {categoryResult.final && (
                      <div className="mb-4">
                        <ResultCard
                          place={categoryResult.final}
                          isFinal={true}
                          categoryName={categoryName}
                          onSelect={() => {
                            if (categoryResult.final) {
                              handleCandidateSelect(categoryResult.final);
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* 해당 카테고리의 후보 리스트 */}
                    {categoryResult.candidates && categoryResult.candidates.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-600 mb-2">다른 후보 ({categoryResult.candidates.length}개)</h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {categoryResult.candidates.map((candidate: Place) => (
                            <ResultCard
                              key={candidate.placeId}
                              place={candidate}
                              onSelect={() => {
                                handleCandidateSelect(candidate);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {!categoryResult.final && (!categoryResult.candidates || categoryResult.candidates.length === 0) && (
                      <p className="text-sm text-slate-500 text-center py-4">해당 카테고리에서 추천 결과가 없습니다.</p>
                    )}
                  </div>
                );
              })()
            ) : (
              // 기존 방식 (하위 호환성)
              <>
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
                        <ResultCard key={candidate.placeId} place={candidate} onSelect={() => handleCandidateSelect(candidate)} />
                      ))}
                    </div>
                  </div>
                )}
              </>
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

            {/* 로그인 상태일 때만 표시 */}
            {isLoggedIn ? (
              <>
                <button
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  onClick={async () => {
                    if (!result?.final) return;
                    try {
                      // 참가자 정보 추출 (표시용)
                      const participantsData = participants
                        .filter((p) => p.selectedPlace)
                        .map((p) => ({
                          label: p.label,
                          name: p.selectedPlace!.name,
                          address: p.selectedPlace!.address,
                        }));

                      await createMeeting({
                        final: result.final,
                        participantCount: participantsData.length,
                        participants: participantsData,
                      });
                      alert("결과가 저장되었습니다!");
                    } catch (error) {
                      const errorMessage = error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.";
                      alert(errorMessage);
                      console.error("저장 오류:", error);
                    }
                  }}
                >
                  <HiOutlineSave />
                  이번 결과 저장
                </button>

                <button
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  onClick={async () => {
                    if (!result?.final) return;
                    try {
                      await createFavorite({
                        placeId: result.final.placeId,
                        name: result.final.name,
                        address: result.final.address,
                        lat: result.final.lat,
                        lng: result.final.lng,
                        placeUrl: result.final.placeUrl,
                      });
                      alert("즐겨찾기에 추가되었습니다!");
                    } catch (error) {
                      const errorMessage = error instanceof Error ? error.message : "즐겨찾기 추가 중 오류가 발생했습니다.";
                      // 409 에러는 이미 추가된 경우
                      if (errorMessage.includes("이미")) {
                        alert(errorMessage);
                      } else {
                        alert(errorMessage);
                      }
                      console.error("즐겨찾기 오류:", error);
                    }
                  }}
                >
                  <HiOutlineStar />
                  즐겨찾기 추가
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
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
              모든 참가자의 출발지를 선택하신 후 &quot;추천받기&quot; 버튼을 눌러주세요.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
