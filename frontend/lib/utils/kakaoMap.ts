/**
 * 카카오맵 place.map.kakao.com URL을 map.kakao.com 지도 URL로 변환
 * @param placeUrl 카카오 장소 URL (예: https://place.map.kakao.com/SES1813)
 * @param placeId 카카오 장소 ID (예: SES1813)
 * @param lat 위도
 * @param lng 경도
 * @param name 장소 이름
 * @returns 카카오맵 지도 URL
 */
export function getKakaoMapUrl(placeUrl: string | undefined, placeId: string, lat: number, lng: number, name: string): string {
  // place.map.kakao.com URL에서 placeId 추출
  let extractedPlaceId = placeId;

  if (placeUrl) {
    const placeMapMatch = placeUrl.match(/place\.map\.kakao\.com\/([^/?]+)/);
    if (placeMapMatch) {
      extractedPlaceId = placeMapMatch[1];
    }
  }

  // 카카오맵 좌표계 변환 (WGS84 -> Web Mercator EPSG:3857)
  // Web Mercator 좌표계는 메르카토르 도법을 사용
  const EARTH_RADIUS = 6378137; // 지구 반지름 (미터)
  const x = lng * ((EARTH_RADIUS * Math.PI) / 180); // 경도 -> X
  const y = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2)) * EARTH_RADIUS; // 위도 -> Y

  // 카카오맵 지도 URL 생성
  const encodedName = encodeURIComponent(name);
  const mapUrl = `https://map.kakao.com/?urlX=${x}&urlY=${y}&urlLevel=3&itemId=${extractedPlaceId}&q=${encodedName}&srcid=${extractedPlaceId}&map_type=TYPE_MAP`;

  return mapUrl;
}
