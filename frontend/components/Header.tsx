"use client";

import Link from "next/link";

export default function Header() {
  // TODO: 백엔드 연동 시 실제 로그인 상태 확인
  const isLoggedIn = false;
  const user = null; // { name: "홍길동", profile: "..." }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-200/50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer transition-all duration-500 hover:scale-105">
          <h1 className="text-2xl font-bold gradient-text">만나</h1>
          <span className="text-sm text-slate-600 hidden sm:inline">약속 장소 중간지점 추천</span>
        </Link>

        <nav className="flex items-center gap-4">
          {isLoggedIn && user ? (
            <>
              <a href="/history" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
                기록
              </a>
              <a href="/favorites" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
                즐겨찾기
              </a>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">{user.name?.[0] || "U"}</div>
                <span className="text-sm font-medium text-slate-700 hidden sm:inline">{user.name || "사용자"}</span>
              </div>
            </>
          ) : (
            <button
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              onClick={() => {
                // TODO: 카카오 로그인 연동
                alert("로그인 기능은 백엔드 연동 후 활성화됩니다.");
              }}
            >
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
