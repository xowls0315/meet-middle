"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { user, isLoggedIn, isLoading, login, logout } = useAuth();
  const pathname = usePathname();
  const isGuidePage = pathname === "/guide";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-200/50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer transition-all duration-500 hover:scale-105">
          <h1 className="text-2xl font-bold gradient-text">Meet-Middle</h1>
          <span className="text-sm text-slate-600 hidden sm:inline">약속 장소 중간지점 추천</span>
        </Link>

        <nav className="flex items-center gap-4">
          {isGuidePage ? (
            <Link href="/" className="px-6 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-all">
              홈
            </Link>
          ) : (
            <Link href="/guide" className="px-6 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-all">
              가이드
            </Link>
          )}
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : isLoggedIn && user ? (
            <>
              <Link href="/history" className="px-4 py-2 text-sm font-medium text-green-700 hover:text-green-800 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 transition-all">
                기록
              </Link>
              <Link href="/favorites" className="px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-all">
                즐겨찾기
              </Link>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">{user.name?.[0] || "U"}</div>
                )}
                <span className="text-sm font-bold text-slate-700 hidden sm:inline">{user.name || "사용자"}</span>
              </div>
              <button
                className="px-4 py-2 text-sm font-medium text-red-700 hover:text-red-800 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-all cursor-pointer"
                onClick={logout}
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
              onClick={login}
            >
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
