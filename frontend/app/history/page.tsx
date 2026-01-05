"use client";

import { useState, useEffect } from "react";
import ResultCard from "@/components/ResultCard";
import Link from "next/link";
import { HistoryListSkeleton } from "@/components/SkeletonList";

interface Place {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl?: string;
  distance?: number;
}

interface Meeting {
  id: string;
  createdAt: string;
  final: Place;
  participantCount: number;
}

export default function HistoryPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: 백엔드 API 호출
  // useEffect(() => {
  //   const fetchMeetings = async () => {
  //     try {
  //       const res = await fetch('/api/meetings');
  //       if (!res.ok) throw new Error('기록을 불러올 수 없습니다.');
  //       const data = await res.json();
  //       setMeetings(data);
  //     } catch (err) {
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchMeetings();
  // }, []);

  // 목업 데이터
  useEffect(() => {
    setTimeout(() => {
      setMeetings([
        {
          id: "1",
          createdAt: "2024-01-15T10:30:00Z",
          final: {
            placeId: "final-1",
            name: "강남역",
            address: "서울특별시 강남구 강남대로 396",
            lat: 37.498,
            lng: 127.0276,
            distance: 1250,
          },
          participantCount: 2,
        },
        {
          id: "2",
          createdAt: "2024-01-14T15:20:00Z",
          final: {
            placeId: "final-2",
            name: "홍대입구역",
            address: "서울특별시 마포구 양화로 188",
            lat: 37.5567,
            lng: 126.9234,
            distance: 1800,
          },
          participantCount: 3,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

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
        <Link href="/" className="inline-block text-blue-600 hover:text-blue-700 font-medium mb-4">
          ← 홈으로
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
                  <div className="text-sm text-slate-500 mb-1">{formatDate(meeting.createdAt)}</div>
                  <div className="text-sm text-blue-600 font-medium">{meeting.participantCount}명 참가</div>
                </div>
                <button
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                  onClick={() => {
                    // TODO: DELETE /api/meetings/:id
                    alert("삭제 기능은 백엔드 연동 후 활성화됩니다.");
                  }}
                >
                  삭제
                </button>
              </div>
              <ResultCard place={meeting.final} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
