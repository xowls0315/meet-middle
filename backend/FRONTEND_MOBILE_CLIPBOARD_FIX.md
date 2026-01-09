# 모바일 환경 클립보드 에러 해결 가이드

## 🔍 문제 상황

모바일 환경에서 "공유 링크 만들기" 버튼을 누르면 다음과 같은 에러가 발생합니다:
```
The request is not allowed by the user agent or the platform in the current context, 
possibly because the user denied permission
```

하지만 링크는 정상적으로 생성됩니다.

## 🔎 원인

이 에러는 모바일 브라우저에서 **Clipboard API** 사용 제한 때문입니다:

1. **HTTPS 환경 필수**: Clipboard API는 HTTPS 환경에서만 작동합니다
2. **사용자 상호작용 필요**: 사용자 클릭 이벤트 핸들러 내에서만 호출 가능
3. **모바일 브라우저 제한**: iOS Safari와 일부 모바일 브라우저에서 추가 제한이 있음
4. **권한 요청 필요**: 일부 브라우저에서는 클립보드 접근 권한이 필요

## ✅ 해결 방법

### 방법 1: Clipboard API 사용 시 try-catch 및 대체 방법 구현 (권장)

```typescript
// utils/clipboard.ts
export async function copyToClipboard(text: string): Promise<{ success: boolean; message: string }> {
  // Clipboard API 지원 확인
  if (!navigator.clipboard) {
    return { 
      success: false, 
      message: '클립보드 복사가 지원되지 않는 브라우저입니다.' 
    };
  }

  try {
    // Clipboard API 사용
    await navigator.clipboard.writeText(text);
    return { 
      success: true, 
      message: '링크가 클립보드에 복사되었습니다.' 
    };
  } catch (error: any) {
    // 모바일에서 에러 발생 시 대체 방법 사용
    console.warn('Clipboard API failed, trying fallback method:', error);
    return fallbackCopyToClipboard(text);
  }
}

// 대체 방법: document.execCommand 사용 (레거시 방법)
function fallbackCopyToClipboard(text: string): { success: boolean; message: string } {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return { 
        success: true, 
        message: '링크가 클립보드에 복사되었습니다.' 
      };
    } else {
      return { 
        success: false, 
        message: '클립보드 복사에 실패했습니다. 링크를 직접 복사해주세요.' 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      message: '클립보드 복사에 실패했습니다. 링크를 직접 복사해주세요.' 
    };
  }
}
```

### 방법 2: 공유 링크 생성 컴포넌트 수정 예시

```typescript
// components/ShareButton.tsx 또는 공유 링크 생성 컴포넌트
'use client';

import { useState } from 'react';
import { copyToClipboard } from '@/utils/clipboard';

export function ShareButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      setIsLoading(true);
      
      // 공유 링크 생성 API 호출
      const response = await apiClient.post('/api/share', shareData);
      const { url } = response.data;
      
      setShareUrl(url);
      
      // 클립보드에 복사 시도
      const { success, message } = await copyToClipboard(url);
      
      if (success) {
        // 성공 메시지 표시
        alert(message);
        // 또는 토스트 메시지 사용
        // toast.success(message);
      } else {
        // 실패 시 링크를 화면에 표시하여 사용자가 직접 복사할 수 있도록
        alert(`${message}\n\n링크: ${url}`);
        // 또는 모달로 링크 표시
      }
    } catch (error) {
      console.error('공유 링크 생성 실패:', error);
      alert('공유 링크 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleShare} disabled={isLoading}>
        {isLoading ? '생성 중...' : '공유 링크 만들기'}
      </button>
      
      {/* 링크를 직접 복사할 수 있도록 표시 */}
      {shareUrl && (
        <div>
          <p>공유 링크:</p>
          <input 
            type="text" 
            value={shareUrl} 
            readOnly 
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button onClick={() => copyToClipboard(shareUrl)}>
            다시 복사
          </button>
        </div>
      )}
    </div>
  );
}
```

### 방법 3: Web Share API 사용 (모바일 네이티브 공유 기능)

```typescript
// utils/share.ts
export async function shareLink(url: string, title: string): Promise<boolean> {
  // Web Share API 지원 확인 (모바일 브라우저)
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: '약속 장소를 공유합니다',
        url: url,
      });
      return true;
    } catch (error: any) {
      // 사용자가 공유를 취소한 경우
      if (error.name !== 'AbortError') {
        console.error('Web Share API error:', error);
      }
      return false;
    }
  }
  return false;
}

// 사용 예시
const handleShare = async () => {
  const response = await apiClient.post('/api/share', shareData);
  const { url } = response.data;
  
  // 먼저 Web Share API 시도 (모바일 네이티브 공유)
  const shared = await shareLink(url, '약속 장소 공유');
  
  if (!shared) {
    // Web Share API가 지원되지 않거나 실패한 경우 클립보드 복사
    const { success, message } = await copyToClipboard(url);
    alert(message);
  }
};
```

## 📱 모바일 환경별 대응

### iOS Safari
- Clipboard API는 iOS 13.4 이상에서만 지원
- 사용자 상호작용 이벤트 핸들러 내에서만 작동
- 권한 요청 필요 시 권한 요청 로직 추가

### Android Chrome
- HTTPS 환경에서 Clipboard API 정상 작동
- Web Share API 지원

### 인앱 브라우저 (카카오톡, 인스타 등)
- Clipboard API 제한적 지원
- 대체 방법(execCommand) 사용 권장

## ✅ 권장 구현 방법

```typescript
// 최종 권장 구현
export async function shareLinkWithFallback(url: string, title: string) {
  // 1. Web Share API 시도 (모바일 네이티브 공유)
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: '약속 장소를 공유합니다',
        url: url,
      });
      return { method: 'native', success: true };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { method: 'native', success: false, message: '공유가 취소되었습니다.' };
      }
    }
  }

  // 2. Clipboard API 시도
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
      return { method: 'clipboard', success: true, message: '링크가 클립보드에 복사되었습니다.' };
    } catch (error) {
      // 계속 진행 (대체 방법 시도)
    }
  }

  // 3. 대체 방법 (execCommand)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return { method: 'fallback', success: true, message: '링크가 클립보드에 복사되었습니다.' };
    }
  } catch (error) {
    // 모든 방법 실패
  }

  // 4. 모든 방법 실패 시 링크를 표시하여 사용자가 직접 복사할 수 있도록
  return { 
    method: 'manual', 
    success: false, 
    message: '자동 복사에 실패했습니다. 링크를 직접 복사해주세요.',
    url: url 
  };
}
```

## 🎯 핵심 포인트

1. **에러를 숨기지 말고 처리**: try-catch로 에러를 처리하고 사용자에게 적절한 안내 제공
2. **대체 방법 제공**: Clipboard API 실패 시 execCommand 사용
3. **수동 복사 옵션**: 자동 복사가 실패해도 링크를 표시하여 사용자가 직접 복사 가능하도록
4. **Web Share API 활용**: 모바일에서 네이티브 공유 기능 사용 (더 나은 UX)

이렇게 수정하면 모바일 환경에서도 에러 없이 공유 기능이 동작합니다! 🚀

