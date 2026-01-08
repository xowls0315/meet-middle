"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoCloseSharp } from "react-icons/io5";

export default function Header() {
  const { user, isLoggedIn, isLoading, login, logout } = useAuth();
  const pathname = usePathname();
  const isGuidePage = pathname === "/guide";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-blue-200/50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer transition-all duration-500 hover:scale-105" onClick={closeMenu}>
            <h1 className="text-xl sm:text-2xl font-bold gradient-text">Meet-Middle</h1>
            <span className="text-xs sm:text-sm text-slate-600 hidden sm:inline">약속 장소 중간지점 추천</span>
          </Link>

          {/* 데스크탑/태블릿 네비게이션 (sm 이상에서만 표시) */}
          <nav className="hidden sm:flex items-center gap-2 md:gap-4">
            {isGuidePage ? (
              <Link
                href="/"
                className="px-4 md:px-6 py-2 text-xs md:text-sm font-medium text-slate-700 hover:text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-all"
              >
                홈
              </Link>
            ) : (
              <Link
                href="/guide"
                className="px-4 md:px-6 py-2 text-xs md:text-sm font-medium text-slate-700 hover:text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-all"
              >
                가이드
              </Link>
            )}
            {isLoading ? (
              <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : isLoggedIn && user ? (
              <>
                <Link
                  href="/history"
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-green-700 hover:text-green-800 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 transition-all"
                >
                  기록
                </Link>
                <Link
                  href="/favorites"
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-all"
                >
                  즐겨찾기
                </Link>
                <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-50 rounded-full">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xs md:text-sm">
                      {user.name?.[0] || "U"}
                    </div>
                  )}
                  <span className="text-xs md:text-sm font-bold text-slate-700 hidden md:inline">{user.name || "사용자"}</span>
                </div>
                <button
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-red-700 hover:text-red-800 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-all cursor-pointer"
                  onClick={logout}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button
                className="px-4 md:px-6 py-2 text-xs md:text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
                onClick={login}
              >
                로그인
              </button>
            )}
          </nav>

          {/* 모바일 햄버거 메뉴 버튼 (sm 미만에서만 표시) */}
          <button
            onClick={toggleMenu}
            className="sm:hidden fixed top-2 right-4 z-[60] p-2 bg-white rounded-full shadow-lg border border-blue-200 hover:bg-blue-50 transition-all"
            aria-label="메뉴 열기"
          >
            {isMenuOpen ? <IoCloseSharp className="w-6 h-6 text-slate-700" /> : <GiHamburgerMenu className="w-6 h-6 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* 모바일 사이드바 오버레이 */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/50 z-[55] sm:hidden" onClick={closeMenu} />}

      {/* 모바일 사이드바 (sm 미만에서만 표시) */}
      <aside
        className={`fixed top-0 right-0 h-full w-[50%] bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out sm:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* 닫기 버튼 */}
          <div className="flex justify-end mb-6">
            <button onClick={closeMenu} className="p-2 bg-white rounded-full shadow-lg border border-blue-200 hover:bg-blue-50 transition-all" aria-label="메뉴 닫기">
              <IoCloseSharp className="w-6 h-6 text-slate-700" />
            </button>
          </div>

          {/* 메뉴 항목 */}
          <nav className="flex flex-col gap-4 flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : isLoggedIn && user ? (
              <>
                {/* 프로필 */}
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">{user.name?.[0] || "U"}</div>
                  )}
                  <span className="text-sm font-bold text-slate-700">{user.name || "사용자"}</span>
                </div>

                {/* 가이드 */}
                <Link
                  href={isGuidePage ? "/" : "/guide"}
                  onClick={closeMenu}
                  className="px-4 py-3 text-sm font-medium text-slate-700 hover:text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all text-center"
                >
                  {isGuidePage ? "홈" : "가이드"}
                </Link>

                {/* 기록 */}
                <Link
                  href="/history"
                  onClick={closeMenu}
                  className="px-4 py-3 text-sm font-medium text-green-700 hover:text-green-800 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all text-center"
                >
                  기록
                </Link>

                {/* 즐겨찾기 */}
                <Link
                  href="/favorites"
                  onClick={closeMenu}
                  className="px-4 py-3 text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all text-center"
                >
                  즐겨찾기
                </Link>

                {/* 로그아웃 */}
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="px-4 py-3 text-sm font-medium text-red-700 hover:text-red-800 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all mt-auto"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                {/* 가이드 */}
                <Link
                  href={isGuidePage ? "/" : "/guide"}
                  onClick={closeMenu}
                  className="px-4 py-3 text-sm font-medium text-slate-700 hover:text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all text-center"
                >
                  {isGuidePage ? "홈" : "가이드"}
                </Link>

                {/* 로그인 */}
                <button
                  onClick={() => {
                    login();
                    closeMenu();
                  }}
                  className="px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md mt-auto"
                >
                  로그인
                </button>
              </>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}

