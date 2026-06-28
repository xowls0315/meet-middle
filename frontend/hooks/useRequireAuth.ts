"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function useRequireAuth() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      router.push("/");
    }
  }, [isLoggedIn, isLoading, router]);

  return { user, isLoggedIn, isLoading };
}
