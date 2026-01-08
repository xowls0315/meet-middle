"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function FavoritesListSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
          <Skeleton height={28} width="70%" className="mb-2" />
          <Skeleton height={16} width="90%" className="mb-4" />
          <Skeleton height={16} width="60%" className="mb-4" />
          <Skeleton height={16} width={120} />
        </div>
      ))}
    </div>
  );
}

export function HistoryListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Skeleton height={14} width={150} className="mb-2" />
              <Skeleton height={16} width={80} />
            </div>
            <Skeleton height={16} width={40} />
          </div>
          <Skeleton height={28} width="60%" className="mb-2" />
          <Skeleton height={16} width="80%" className="mb-4" />
          <Skeleton height={16} width={120} />
        </div>
      ))}
    </div>
  );
}

export function SharePageSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      {/* 지도 영역 */}
      <div>
        <Skeleton height={28} width={60} className="mb-4" />
        <Skeleton height={500} borderRadius={12} />
      </div>

      {/* 결과 영역 */}
      <div>
        <Skeleton height={28} width={100} className="mb-4" />
        <div className="mb-4">
          <Skeleton height={200} borderRadius={12} />
        </div>
        <Skeleton height={80} borderRadius={8} className="mb-4" />
        <div>
          <Skeleton height={24} width={120} className="mb-3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={150} borderRadius={12} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

