/**
 * 인앱 브라우저 감지
 * 카카오톡, 인스타그램 등 인앱 브라우저에서는 쿠키가 제대로 저장되지 않을 수 있습니다.
 */
export function isInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent || window.navigator.vendor;
  return /KAKAOTALK|Instagram|FBAN|FBAV|Line|NAVER|Daum/i.test(userAgent);
}

/**
 * 외부 브라우저로 열기
 */
export function openInExternalBrowser(url: string) {
  if (typeof window === "undefined") return;

  // iOS Safari
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.location.href = url;
    return;
  }

  // Android Chrome
  if (/Android/i.test(navigator.userAgent)) {
    window.open(url, "_blank");
    return;
  }

  // 기본 동작
  window.location.href = url;
}
