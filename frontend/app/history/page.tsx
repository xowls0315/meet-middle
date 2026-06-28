"use client";

import { Suspense } from "react";
import ResultCard from "@/components/ui/ResultCard";
import Link from "next/link";
import { HistoryListSkeleton } from "@/components/ui/skeleton/SkeletonList";
import { useMeetings, useDeleteMeeting } from "@/hooks/queries/useMeetings";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { IoHomeOutline } from "react-icons/io5";

function HistoryContent() {
  const { user, isLoggedIn, isLoading: authLoading } = useRequireAuth();
  const { data: meetings = [], isLoading } = useMeetings(user?.id);
  const deleteMeetingMutation = useDeleteMeeting();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || (!isLoggedIn && !authLoading)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <HistoryListSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-4 px-4 py-2 text-md font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <IoHomeOutline />
          홈으로
        </Link>
        <h1 className="text-4xl font-bold gradient-text mb-2">내 기록</h1>
        <p className="text-slate-600">이전에 저장한 추천 결과를 확인할 수 있습니다</p>
      </div>

      {isLoading ? (
        <HistoryListSkeleton />
      ) : meetings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-blue-200">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">기록이 없습니다</h2>
          <p className="text-slate-600 mb-6">추천 결과를 저장하면 여기에 표시됩니다.</p>
          <Link href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
            추천 받기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-md text-slate-500 mb-1">{formatDate(meeting.createdAt)}</div>
                  <div className="text-md text-blue-600 font-medium mb-1">{meeting.participantCount}명 참가</div>
                  {meeting.participants.length > 0 && (
                    <div className="text-md text-slate-600 mt-1">
                      {meeting.participants.map((participant, index) => (
                        <span key={participant.label}>
                          {participant.label}: {participant.name}
                          {index < meeting.participants.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="text-md text-red-600 hover:text-red-700 font-medium cursor-pointer disabled:opacity-50"
                  disabled={deleteMeetingMutation.isPending}
                  onClick={async () => {
                    if (!confirm("정말 삭제하시겠습니까?")) return;
                    try {
                      await deleteMeetingMutation.mutateAsync(meeting.id);
                    } catch (err) {
                      const errorMessage = err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.";
                      alert(errorMessage);
                      console.error("삭제 오류:", err);
                    }
                  }}
                >
                  삭제
                </button>
              </div>
              <ResultCard place={meeting.final} hideSelectButton />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<HistoryListSkeleton />}>
      <HistoryContent />
    </Suspense>
  );
}
