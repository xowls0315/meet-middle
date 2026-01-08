"use client";

import { useState, useEffect } from "react";
import ResultCard from "@/_components/ui/ResultCard";
import Link from "next/link";
import { FavoritesListSkeleton } from "@/_components/ui/skeleton/SkeletonList";
import { Place } from "@/types";
import { getFavorites, deleteFavorite } from "@/lib/api/favorites";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { IoHomeOutline } from "react-icons/io5";

export default function FavoritesPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  // 백엔드 API 호출
  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      router.push("/");
      return;
    }

    const fetchFavorites = async () => {
      try {
        const data = await getFavorites();
        setFavorites(data);
      } catch (err) {
        console.error("즐겨찾기 조회 오류:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isLoggedIn, authLoading, router]);

  const handleRemove = async (placeId: string) => {
    if (!confirm("즐겨찾기에서 제거하시겠습니까?")) return;
    try {
      await deleteFavorite(placeId);
      setFavorites((prev) => prev.filter((f) => f.placeId !== placeId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.";
      alert(errorMessage);
      console.error("삭제 오류:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-4 px-4 py-2 text-md font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <IoHomeOutline />
          홈으로
        </Link>
        <h1 className="text-4xl font-bold gradient-text mb-2">즐겨찾기</h1>
        <p className="text-slate-600">자주 가는 장소를 저장해두세요</p>
      </div>

      {loading ? (
        <FavoritesListSkeleton />
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-blue-200">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">즐겨찾기가 없습니다</h2>
          <p className="text-slate-600 mb-6">추천 결과에서 즐겨찾기를 추가하면 여기에 표시됩니다.</p>
          <Link href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
            추천 받기
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {favorites.map((favorite) => (
            <div key={favorite.placeId} className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200 relative">
              <button onClick={() => handleRemove(favorite.placeId)} className="absolute top-4 right-4 text-yellow-500 hover:text-yellow-600 transition-colors" title="즐겨찾기 제거">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>
              <ResultCard place={favorite} hideSelectButton />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
