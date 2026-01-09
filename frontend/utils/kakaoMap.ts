/**
 * 카카오맵 place.map.kakao.com URL을 모바일/데스크탑 호환 URL로 변환
 * @param placeUrl 카카오 장소 URL (예: https://place.map.kakao.com/SES1813)
 * @param placeId 카카오 장소 ID (예: SES1813)
 * @param lat 위도
 * @param lng 경도
 * @param name 장소 이름
 * @returns 카카오맵 지도 URL
 */
export function getKakaoMapUrl(placeUrl: string | undefined, placeId: string, lat: number, lng: number, name: string): string {
  // 모바일 감지
  const isMobile = typeof window !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // place.map.kakao.com URL에서 placeId 추출
  let extractedPlaceId = placeId;

  if (placeUrl) {
    const placeMapMatch = placeUrl.match(/place\.map\.kakao\.com\/([^/?]+)/);
    if (placeMapMatch) {
      extractedPlaceId = placeMapMatch[1];
    }
  }

  if (isMobile) {
    // 모바일: 카카오맵 앱 또는 모바일 웹 사용
    // 카카오맵 앱이 설치되어 있으면 자동으로 앱 열림
    const encodedName = encodeURIComponent(name);
    // 모바일 카카오맵 URL (위도, 경도 기반)
    return `https://map.kakao.com/link/map/${encodedName},${lat},${lng}`;
  } else {
    // 데스크탑: 기존 방식 유지하되 간소화
    const encodedName = encodeURIComponent(name);
    // 간단한 카카오맵 검색 URL 사용
    return `https://map.kakao.com/link/search/${encodedName}`;
  }
}
