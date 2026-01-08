"use client";

import { useState, useEffect } from "react";
import ResultCard from "@/_components/ui/ResultCard";
import Link from "next/link";
import { HistoryListSkeleton } from "@/_components/ui/skeleton/SkeletonList";
import { Meeting } from "@/types";
import { getMeetings, deleteMeeting } from "@/lib/api/meetings";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { IoHomeOutline } from "react-icons/io5";

export default function HistoryPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // 백엔드 API 호출
  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      router.push("/");
      return;
    }

    const fetchMeetings = async () => {
      try {
        const data = await getMeetings();
        setMeetings(data);
      } catch (err) {
        console.error("기록 조회 오류:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [isLoggedIn, authLoading, router]);

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
        <h1 className="text-4xl font-bold gradient-text mb-2">내 기록</h1>
        <p className="text-slate-600">이전에 저장한 추천 결과를 확인할 수 있습니다</p>
      </div>

      {loading ? (
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
                  className="text-md text-red-600 hover:text-red-700 font-medium cursor-pointer"
                  onClick={async () => {
                    if (!confirm("정말 삭제하시겠습니까?")) return;
                    try {
                      await deleteMeeting(meeting.id);
                      setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
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
