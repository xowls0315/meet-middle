"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function ResultCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border-2 border-blue-200 bg-white">
      <Skeleton height={24} width={100} className="mb-3" />
      <Skeleton height={28} width="80%" className="mb-2" />
      <Skeleton height={16} width="90%" className="mb-4" />
      <Skeleton height={16} width="60%" className="mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton height={16} width={120} />
        <Skeleton height={36} width={60} borderRadius={8} />
      </div>
    </div>
  );
}

export function ResultCardFinalSkeleton() {
  return (
    <div className="p-6 rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100">
      <Skeleton height={24} width={80} className="mb-3" borderRadius={9999} />
      <Skeleton height={28} width="75%" className="mb-2" />
      <Skeleton height={16} width="85%" className="mb-4" />
      <Skeleton height={16} width="50%" className="mb-4" />
      <Skeleton height={16} width={140} />
    </div>
  );
}
