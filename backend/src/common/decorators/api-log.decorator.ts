import { Logger } from '@nestjs/common';

const logger = new Logger('KakaoAPI');

export function logKakaoCall(
  method: string,
  params: any,
  result?: any,
  error?: any,
) {
  if (error) {
    if (error.response?.status === 429) {
      logger.warn(`[429] ${method} - Rate limit exceeded`);
    } else {
      logger.error(`[ERROR] ${method} - ${error.message}`, params);
    }
  } else {
    logger.log(`[SUCCESS] ${method}`, { params, resultCount: result?.length });
  }
}

export function logRecommendAttempt(
  anchor: { lat: number; lng: number },
  used: { category: string; radius: number } | null,
  attempts: number,
) {
  logger.log(
    `[RECOMMEND] anchor=${anchor.lat.toFixed(6)},${anchor.lng.toFixed(6)} used=${used ? `${used.category}/${used.radius}` : 'none'} attempts=${attempts}`,
  );
}

