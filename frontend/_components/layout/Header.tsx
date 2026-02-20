"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import * as authApi from "@/lib/api/auth";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoCloseSharp } from "react-icons/io5";

export default function Header() {
  const { user, isLoggedIn, isLoading, login, logout, reloadUser } = useAuth();
  const pathname = usePathname();
  const isGuidePage = pathname === "/guide";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "findId" | "findPassword">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const openAuthModal = (mode: "login" | "register" | "findId" | "findPassword" = "login") => {
    setAuthMode(mode);
    setAuthError(null);
    setIdentifier("");
    setPassword("");
    setUsername("");
    setEmail("");
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    if (isSubmitting) return;
    setIsAuthModalOpen(false);
  };

  const handleLocalLogin = async () => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await authApi.loginWithCredentials({ identifier, password });
      await reloadUser();
      setIsAuthModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(error.message || "로그인에 실패했습니다.");
      } else {
        setAuthError("로그인에 실패했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await authApi.registerWithCredentials({ username, email, password });
      await reloadUser();
      setIsAuthModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(error.message || "회원가입에 실패했습니다.");
      } else {
        setAuthError("회원가입에 실패했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFindId = async () => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      const foundUsername = await authApi.findIdByEmail(email);
      if (foundUsername) {
        setAuthError(`등록된 아이디: ${foundUsername}`);
      } else {
        setAuthError("해당 이메일로 등록된 아이디가 없습니다.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(error.message || "ID 찾기에 실패했습니다.");
      } else {
        setAuthError("ID 찾기에 실패했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFindPassword = async () => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await authApi.requestPasswordReset(email);
      setAuthError("비밀번호 재설정 안내 메일이 발송되었다고 가정합니다.");
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(error.message || "비밀번호 찾기에 실패했습니다.");
      } else {
        setAuthError("비밀번호 찾기에 실패했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
                onClick={() => openAuthModal("login")}
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
                    openAuthModal("login");
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

      {/* 로그인/회원가입 모달 */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-blue-100 p-6 relative">
            <button
              onClick={closeAuthModal}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-100"
              aria-label="로그인 창 닫기"
            >
              <IoCloseSharp className="w-5 h-5 text-slate-600" />
            </button>

            <h2 className="text-lg font-bold text-slate-800 mb-2">로그인 / 회원가입</h2>
            <p className="text-xs text-slate-500 mb-4">
              카카오 간편 로그인 또는 이메일/비밀번호로 로그인할 수 있어요.
            </p>

            {/* 탭 */}
            <div className="flex gap-2 mb-4">
              <button
                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-full border transition-all ${
                  authMode === "login"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
                onClick={() => setAuthMode("login")}
              >
                이메일 로그인
              </button>
              <button
                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-full border transition-all ${
                  authMode === "register"
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
                onClick={() => setAuthMode("register")}
              >
                회원가입
              </button>
            </div>

            {/* 카카오 로그인 버튼 */}
            <button
              className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#FEE500] hover:bg-[#FDE74E] text-slate-900 text-xs font-semibold shadow-sm border border-yellow-200 cursor-pointer"
              onClick={() => {
                closeAuthModal();
                login();
              }}
            >
              <span>카카오로 로그인</span>
            </button>

            {/* 폼 영역 */}
            <div className="space-y-3">
              {authMode === "login" && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700">아이디 또는 이메일</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      placeholder="아이디 또는 이메일을 입력하세요"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700">비밀번호</label>
                    <input
                      type="password"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {authError && <p className="text-xs text-red-600 mt-1">{authError}</p>}
                  <button
                    className="w-full mt-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleLocalLogin}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "로그인 중..." : "이메일로 로그인"}
                  </button>
                  <div className="flex justify-between mt-2 text-[11px] text-slate-500">
                    <button
                      type="button"
                      className="hover:text-blue-600"
                      onClick={() => {
                        setAuthMode("findId");
                        setAuthError(null);
                      }}
                    >
                      아이디 찾기
                    </button>
                    <button
                      type="button"
                      className="hover:text-blue-600"
                      onClick={() => {
                        setAuthMode("findPassword");
                        setAuthError(null);
                      }}
                    >
                      비밀번호 찾기
                    </button>
                  </div>
                </>
              )}

              {authMode === "register" && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700">아이디</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                      placeholder="로그인에 사용할 아이디를 입력하세요"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700">이메일</label>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                      placeholder="ID/PW 찾기에 사용할 이메일을 입력하세요"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700">비밀번호</label>
                    <input
                      type="password"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {authError && <p className="text-xs text-red-600 mt-1">{authError}</p>}
                  <button
                    className="w-full mt-1 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleRegister}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "회원가입 중..." : "회원가입 완료"}
                  </button>
                </>
              )}

              {authMode === "findId" && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700">가입한 이메일</label>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      placeholder="가입 시 입력한 이메일을 입력하세요"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {authError && <p className="text-xs text-blue-700 mt-1 whitespace-pre-line">{authError}</p>}
                  <button
                    className="w-full mt-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleFindId}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "ID 조회 중..." : "아이디 찾기"}
                  </button>
                </>
              )}

              {authMode === "findPassword" && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700">가입한 이메일</label>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      placeholder="가입 시 입력한 이메일을 입력하세요"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {authError && <p className="text-xs text-blue-700 mt-1 whitespace-pre-line">{authError}</p>}
                  <button
                    className="w-full mt-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleFindPassword}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "요청 중..." : "비밀번호 찾기"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

