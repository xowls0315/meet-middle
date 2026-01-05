"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function RecommendResultSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      {/* 지도 영역 */}
      <div>
        <Skeleton height={28} width={60} className="mb-4" />
        <Skeleton height={500} borderRadius={12} />
      </div>

      {/* 결과 카드 영역 */}
      <div>
        <Skeleton height={28} width={100} className="mb-4" />

        {/* 최종 추천 카드 스켈레톤 */}
        <div className="mb-4">
          <div className="p-6 rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100">
            <Skeleton height={24} width={80} className="mb-3" borderRadius={9999} />
            <Skeleton height={28} width="75%" className="mb-2" />
            <Skeleton height={16} width="85%" className="mb-4" />
            <Skeleton height={16} width="50%" className="mb-4" />
            <Skeleton height={16} width={140} />
          </div>
        </div>

        {/* 검색 정보 스켈레톤 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <Skeleton height={16} width="70%" />
        </div>

        {/* 후보 리스트 스켈레톤 */}
        <div>
          <Skeleton height={24} width={120} className="mb-3" />
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl border-2 border-blue-200 bg-white">
                <Skeleton height={24} width="60%" className="mb-2" />
                <Skeleton height={16} width="80%" className="mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton height={16} width={120} />
                  <Skeleton height={36} width={60} borderRadius={8} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
