"use client";

import { useState, useEffect } from "react";
import ResultCard from "@/components/ResultCard";
import Link from "next/link";
import { FavoritesListSkeleton } from "@/components/SkeletonList";

interface Place {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl?: string;
  distance?: number;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: 백엔드 API 호출
  // useEffect(() => {
  //   const fetchFavorites = async () => {
  //     try {
  //       const res = await fetch('/api/favorites');
  //       if (!res.ok) throw new Error('즐겨찾기를 불러올 수 없습니다.');
  //       const data = await res.json();
  //       setFavorites(data);
  //     } catch (err) {
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchFavorites();
  // }, []);

  // 목업 데이터
  useEffect(() => {
    setTimeout(() => {
      setFavorites([
        {
          placeId: "fav-1",
          name: "강남역",
          address: "서울특별시 강남구 강남대로 396",
          lat: 37.498,
          lng: 127.0276,
        },
        {
          placeId: "fav-2",
          name: "홍대입구역",
          address: "서울특별시 마포구 양화로 188",
          lat: 37.5567,
          lng: 126.9234,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleRemove = async (placeId: string) => {
    // TODO: DELETE /api/favorites/:placeId
    setFavorites((prev) => prev.filter((f) => f.placeId !== placeId));
    alert("즐겨찾기에서 제거되었습니다.");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-8">
        <Link href="/" className="inline-block text-blue-600 hover:text-blue-700 font-medium mb-4">
          ← 홈으로
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
              <ResultCard place={favorite} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
