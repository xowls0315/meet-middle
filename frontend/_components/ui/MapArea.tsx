"use client";

import { useEffect, useRef, useState } from "react";
import { IoBalloonOutline } from "react-icons/io5";

interface Place {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl?: string;
}

interface Participant {
  label: string;
  query: string;
  selectedPlace: Place | null;
}

interface MapAreaProps {
  participants: Participant[];
  anchor?: { lat: number; lng: number };
  finalPlace?: Place;
  candidates?: Place[];
  focusPlace?: Place | null; // 지도 중심을 이 장소로 이동 (공유 페이지 후보 클릭 시)
  onCandidateSelect?: (place: Place) => void;
  readOnly?: boolean; // 읽기 전용 모드 (공유 페이지 등에서 사용)
}

// 카카오맵 타입 정의 (SDK 타입이 없으므로 eslint-disable 사용)
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: any) => any;
        LatLng: new (lat: number, lng: number) => any;
        Marker: new (options: any) => any;
        MarkerImage: new (imageSrc: string, size: any, options?: any) => any;
        CustomOverlay: new (options: any) => any;
        Size: new (width: number, height: number) => any;
        Point: new (x: number, y: number) => any;
        event: {
          addListener: (target: any, eventType: string, handler: () => void) => void;
        };
      };
    };
  }
}

export default function MapArea({ participants, anchor, finalPlace, candidates = [], focusPlace, onCandidateSelect, readOnly = false }: MapAreaProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]); // CustomOverlay 관리용

  const hasData = participants.some((p) => p.selectedPlace) || finalPlace || candidates.length > 0;

  // 환경 변수 확인 및 SDK 동적 로드
  useEffect(() => {
    const mapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

    console.log("🔍 카카오맵 키 확인:", mapKey ? "✅ 설정됨" : "❌ 설정 안됨");

    if (!mapKey) {
      console.warn("NEXT_PUBLIC_KAKAO_MAP_KEY가 설정되지 않았습니다.");
      setLoadError("카카오맵 API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.");
      return;
    }

    // SDK가 이미 로드되어 있는지 확인
    if (typeof window !== "undefined" && window.kakao?.maps?.load && typeof window.kakao.maps.load === "function") {
      console.log("✅ 카카오맵 SDK 이미 로드됨");
      return;
    }

    // SDK 동적 로드
    const existingScript = document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
    if (existingScript) {
      console.log("📜 카카오맵 SDK 스크립트 태그 이미 존재");
      // 스크립트가 있지만 아직 로드되지 않은 경우 대기
      let checkCount = 0;
      const checkInterval = setInterval(() => {
        checkCount++;
        if (typeof window !== "undefined" && window.kakao?.maps?.load && typeof window.kakao.maps.load === "function") {
          console.log("✅ 카카오맵 SDK 로드 완료");
          clearInterval(checkInterval);
        } else if (checkCount > 100) {
          console.error("❌ 카카오맵 SDK 로드 타임아웃");
          clearInterval(checkInterval);
          setLoadError("카카오맵 SDK 로드에 실패했습니다. JavaScript SDK 도메인 설정을 확인해주세요.");
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    // 스크립트가 없으면 동적으로 추가
    console.log("📥 카카오맵 SDK 스크립트 동적 로드 시작");
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${mapKey}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      console.log("✅ 카카오맵 SDK 스크립트 로드 성공");
    };
    script.onerror = () => {
      console.error("❌ 카카오맵 SDK 스크립트 로드 실패");
      setLoadError("카카오맵 SDK 스크립트를 불러오는데 실패했습니다. 네트워크 연결과 API 키를 확인해주세요.");
    };
    document.head.appendChild(script);
  }, []);

  // 카카오맵 SDK 로드 및 지도 초기화
  useEffect(() => {
    console.log("🗺️ 지도 초기화 useEffect 실행", {
      hasData,
      hasMapContainer: !!mapContainer.current,
      participants: participants.length,
      hasFinalPlace: !!finalPlace,
      hasAnchor: !!anchor,
      candidatesCount: candidates.length,
    });

    if (!hasData) {
      console.log("⚠️ hasData가 false입니다. 데이터가 없어 지도 초기화를 건너뜁니다.");
      return;
    }

    if (!mapContainer.current) {
      console.log("⚠️ mapContainer.current가 null입니다. DOM이 준비되지 않았습니다.");
      return;
    }

    console.log("✅ 모든 조건 충족, 지도 로드 시작");

    let retryCount = 0;
    const MAX_RETRIES = 100; // 최대 10초 대기 (100ms * 100)

    const loadMap = () => {
      // SDK 로드 확인
      const hasKakao = typeof window !== "undefined" && !!window.kakao;
      const hasMaps = hasKakao && !!window.kakao.maps;
      const hasLoad = hasMaps && typeof window.kakao.maps.load === "function";

      console.log(`🔍 SDK 로드 확인 시도 ${retryCount + 1}/${MAX_RETRIES}`, {
        hasKakao,
        hasMaps,
        hasLoad,
      });

      if (!hasKakao || !hasMaps || !hasLoad) {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          // SDK가 아직 로드되지 않았으면 재시도
          setTimeout(loadMap, 100);
        } else {
          const errorMsg = "카카오맵 SDK 로드 실패: SDK가 로드되지 않았습니다. JavaScript SDK 도메인 설정을 확인해주세요.";
          console.error("❌", errorMsg);
          setLoadError(errorMsg);
          setMapLoaded(false);
        }
        return;
      }

      console.log("✅ SDK 로드 확인 완료, 지도 초기화 시작");

      try {
        window.kakao.maps.load(() => {
          console.log("✅ window.kakao.maps.load 콜백 실행됨");

          // 중심점 또는 최종 추천 장소의 좌표 사용
          const centerLat = finalPlace?.lat || anchor?.lat || 37.5665;
          const centerLng = finalPlace?.lng || anchor?.lng || 126.978;

          console.log("📍 지도 중심 좌표:", { centerLat, centerLng });

          // 지도 생성
          const options = {
            center: new window.kakao.maps.LatLng(centerLat, centerLng),
            level: 5,
          };

          try {
            if (mapInstance.current) {
              console.log("🔄 기존 지도 인스턴스 업데이트");
              mapInstance.current.setCenter(new window.kakao.maps.LatLng(centerLat, centerLng));
            } else {
              console.log("🆕 새 지도 인스턴스 생성");
              if (!mapContainer.current) {
                console.error("❌ mapContainer.current가 null입니다");
                setLoadError("지도 컨테이너를 찾을 수 없습니다.");
                return;
              }
              mapInstance.current = new window.kakao.maps.Map(mapContainer.current, options);
              console.log("✅ 지도 인스턴스 생성 완료");

              // 지도 크기 조정 (컨테이너 크기에 맞춤)
              setTimeout(() => {
                if (mapInstance.current && mapInstance.current.relayout) {
                  mapInstance.current.relayout();
                }
              }, 100);

              setMapLoaded(true);
              setLoadError(null);
            }
          } catch (mapError) {
            console.error("❌ 지도 생성 오류:", mapError);
            setLoadError(`지도 생성 중 오류가 발생했습니다: ${mapError instanceof Error ? mapError.message : String(mapError)}`);
            setMapLoaded(false);
            return;
          }

          // 기존 마커 및 오버레이 제거
          markersRef.current.forEach((marker) => {
            if (marker && marker.setMap) {
              marker.setMap(null);
            }
          });
          markersRef.current = [];

          // 기존 CustomOverlay 제거
          overlaysRef.current.forEach((overlay) => {
            if (overlay && overlay.setMap) {
              overlay.setMap(null);
            }
          });
          overlaysRef.current = [];

          // 참가자 마커 추가
          participants
            .filter((p) => p.selectedPlace)
            .forEach((p) => {
              const position = new window.kakao.maps.LatLng(p.selectedPlace!.lat, p.selectedPlace!.lng);
              const marker = new window.kakao.maps.Marker({
                position,
                map: mapInstance.current,
              });

              // 커스텀 오버레이로 라벨 표시
              const customOverlay = new window.kakao.maps.CustomOverlay({
                position,
                content: `<div style="padding: 5px 8px; background: white; border: 2px solid #3b82f6; border-radius: 15px; font-weight: bold; color: #3b82f6; font-size: 12px; white-space: nowrap;">${p.label}</div>`,
                yAnchor: 2.5,
              });
              customOverlay.setMap(mapInstance.current);

              // 오버레이 참조 저장
              overlaysRef.current.push(customOverlay);

              markersRef.current.push(marker);
            });

          // 중심점 마커 추가 (anchor가 있고 최종 추천 장소와 다른 경우)
          if (anchor && finalPlace && (anchor.lat !== finalPlace.lat || anchor.lng !== finalPlace.lng)) {
            const anchorPosition = new window.kakao.maps.LatLng(anchor.lat, anchor.lng);
            // 기본 마커 사용 (색상 변경 불가하므로 커스텀 오버레이로 구분)
            const anchorMarker = new window.kakao.maps.Marker({
              position: anchorPosition,
              map: mapInstance.current,
            });

            const anchorOverlay = new window.kakao.maps.CustomOverlay({
              position: anchorPosition,
              content: `<div style="padding: 3px 6px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 10px; font-size: 11px; color: #92400e; white-space: nowrap;">중심점</div>`,
              yAnchor: 2.5,
            });
            anchorOverlay.setMap(mapInstance.current);

            // 오버레이 참조 저장
            overlaysRef.current.push(anchorOverlay);

            markersRef.current.push(anchorMarker);
          }

          // 최종 추천 장소 마커 추가
          if (finalPlace) {
            const finalPosition = new window.kakao.maps.LatLng(finalPlace.lat, finalPlace.lng);
            // 기본 마커 사용
            const finalMarker = new window.kakao.maps.Marker({
              position: finalPosition,
              map: mapInstance.current,
            });

            // 최종 추천 장소 클릭 시 처리
            window.kakao.maps.event.addListener(finalMarker, "click", () => {
              if (readOnly) {
                // 읽기 전용 모드: 지도 중심만 이동
                mapInstance.current.setCenter(finalPosition);
                mapInstance.current.setLevel(4);
              } else if (onCandidateSelect) {
                // 일반 모드: 후보 선택 함수 호출
                onCandidateSelect(finalPlace);
              }
            });

            const finalOverlay = new window.kakao.maps.CustomOverlay({
              position: finalPosition,
              content: `<div style="padding: 5px 8px; background: #dcfce7; border: 2px solid #16a34a; border-radius: 15px; font-weight: bold; color: #15803d; font-size: 12px; white-space: nowrap;">최종 추천</div>`,
              yAnchor: 2.5,
            });
            finalOverlay.setMap(mapInstance.current);

            // 오버레이 참조 저장
            overlaysRef.current.push(finalOverlay);

            markersRef.current.push(finalMarker);

            // 지도 중심을 최종 추천 장소로 이동
            mapInstance.current.setCenter(finalPosition);
            mapInstance.current.setLevel(4);

            // 지도 크기 조정
            setTimeout(() => {
              if (mapInstance.current && mapInstance.current.relayout) {
                mapInstance.current.relayout();
              }
            }, 100);
          }

          // 후보 장소 마커 추가
          candidates.forEach((candidate) => {
            if (finalPlace && candidate.placeId === finalPlace.placeId) return; // 최종 추천 장소는 이미 추가됨

            const candidatePosition = new window.kakao.maps.LatLng(candidate.lat, candidate.lng);
            // 기본 마커 사용
            const candidateMarker = new window.kakao.maps.Marker({
              position: candidatePosition,
              map: mapInstance.current,
            });

            // 후보 마커 클릭 시 처리
            window.kakao.maps.event.addListener(candidateMarker, "click", () => {
              if (readOnly) {
                // 읽기 전용 모드: 지도 중심만 이동 (최종 추천 변경 안됨)
                mapInstance.current.setCenter(candidatePosition);
                mapInstance.current.setLevel(4);
              } else if (onCandidateSelect) {
                // 일반 모드: 후보 선택 함수 호출
                onCandidateSelect(candidate);
              }
            });

            markersRef.current.push(candidateMarker);
          });
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "카카오맵 로드 중 알 수 없는 오류가 발생했습니다.";
        console.error("카카오맵 로드 오류:", error);
        setLoadError(errorMsg);
        setMapLoaded(false);
        // 에러 발생 시 로드 상태 초기화
        retryCount = 0;
      }
    };

    loadMap();

    // cleanup 함수
    return () => {
      // 컴포넌트 언마운트 시 마커 및 오버레이 정리
      markersRef.current.forEach((marker) => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];

      overlaysRef.current.forEach((overlay) => {
        if (overlay && overlay.setMap) {
          overlay.setMap(null);
        }
      });
      overlaysRef.current = [];
    };
  }, [participants, anchor, finalPlace, candidates, hasData, onCandidateSelect, readOnly]);

  // focusPlace 변경 시 지도 중심 이동 (공유 페이지에서 후보 클릭 시)
  useEffect(() => {
    if (!focusPlace || !mapInstance.current || typeof window === "undefined" || !window.kakao?.maps) return;
    const position = new window.kakao.maps.LatLng(focusPlace.lat, focusPlace.lng);
    mapInstance.current.setCenter(position);
    mapInstance.current.setLevel(4);
  }, [focusPlace]);

  // 지도가 표시될 때 크기 조정
  useEffect(() => {
    if (mapLoaded && mapInstance.current && mapInstance.current.relayout) {
      // 짧은 지연 후 relayout (DOM이 완전히 렌더링된 후)
      const timer = setTimeout(() => {
        mapInstance.current?.relayout();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [mapLoaded]);

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-xl border-2 border-blue-200 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 relative">
      {hasData ? (
        <>
          {/* mapContainer는 항상 렌더링되어야 함 (지도 초기화에 필요) */}
          <div ref={mapContainer} className="w-full h-full" style={{ display: mapLoaded ? "block" : "none" }} />

          {loadError ? (
            <div className="w-full h-full flex items-center justify-center bg-white/80 absolute inset-0 z-10">
              <div className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-red-700 mb-2">지도 로드 실패</h3>
                <p className="text-sm text-slate-600 mb-4">{loadError}</p>
                <p className="text-xs text-slate-500">카카오 개발자 콘솔에서 JavaScript SDK 도메인 설정을 확인해주세요.</p>
              </div>
            </div>
          ) : !mapLoaded ? (
            <div className="w-full h-full flex items-center justify-center absolute inset-0 z-10 bg-white/80">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-slate-600">지도를 불러오는 중...</p>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <IoBalloonOutline className="text-6xl text-slate-400" />
            </div>
            <p className="text-slate-500">출발지를 입력하면 지도가 표시됩니다</p>
          </div>
        </div>
      )}
    </div>
  );
}
