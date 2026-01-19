import { ActionCard, ActionHandRank, HandResult, StatType } from './types';

/**
 * 28종 족보 정보
 * 레벨 순서대로 정의 (높은 레벨이 우선)
 */
export const HAND_INFO: Record<ActionHandRank, {
  level: number;
  name: string;
  baseChips: number;
  multiplier: number;
  hitBonus: number;
  specialEffect?: string;
}> = {
  // Lv.28-24: 상위 야구 전용 족보
  'perfect_swing':   { level: 28, name: '퍼펙트 스윙', baseChips: 80, multiplier: 8, hitBonus: 0.55, specialEffect: '결과 한 단계 업그레이드' },
  'contact_master':  { level: 27, name: '컨택 마스터', baseChips: 65, multiplier: 7, hitBonus: 0.45, specialEffect: '삼진 무효' },
  'speed_star':      { level: 26, name: '스피드 스타', baseChips: 55, multiplier: 6, hitBonus: 0.40, specialEffect: '도루 자동 성공' },
  'power_surge':     { level: 25, name: '파워 서지', baseChips: 50, multiplier: 6, hitBonus: 0.35, specialEffect: '홈런 확률 2배' },
  'batting_eye':     { level: 24, name: '배팅 아이', baseChips: 45, multiplier: 5, hitBonus: 0.35, specialEffect: '볼넷 시 추가 포인트 +20' },

  // Lv.23-18: 이중 속성 투페어
  'speed_eye':       { level: 23, name: '스피드아이', baseChips: 30, multiplier: 3, hitBonus: 0.12, specialEffect: '출루 시 2루 스타트' },
  'contact_eye':     { level: 22, name: '컨택아이', baseChips: 30, multiplier: 3, hitBonus: 0.18, specialEffect: '삼진 무효 + 볼넷 확률 +10%' },
  'contact_speed':   { level: 21, name: '컨택스피드', baseChips: 30, multiplier: 3, hitBonus: 0.15, specialEffect: '안타 시 도루 자동 성공' },
  'power_eye':       { level: 20, name: '파워아이', baseChips: 30, multiplier: 3, hitBonus: 0.12, specialEffect: '홈런 시 포인트 1.5배' },
  'power_speed':     { level: 19, name: '파워스피드', baseChips: 30, multiplier: 3, hitBonus: 0.12, specialEffect: '장타 시 진루 +1' },
  'power_contact':   { level: 18, name: '파워컨택', baseChips: 30, multiplier: 3, hitBonus: 0.15, specialEffect: '안타 시 장타 확률 +20%' },

  // Lv.17-14: 속성별 트리플
  'eye_triple':      { level: 17, name: '선구안 트리플', baseChips: 40, multiplier: 4, hitBonus: 0.18, specialEffect: '투수 체력 2배 소모' },
  'speed_triple':    { level: 16, name: '스피드 트리플', baseChips: 40, multiplier: 4, hitBonus: 0.18, specialEffect: '진루 +1' },
  'contact_triple':  { level: 15, name: '컨택 트리플', baseChips: 40, multiplier: 4, hitBonus: 1.0, specialEffect: '안타 확정 (아웃 무효)' },
  'power_triple':    { level: 14, name: '파워 트리플', baseChips: 40, multiplier: 4, hitBonus: 0.18, specialEffect: '홈런 확률 +15%' },

  // Lv.13-10: 속성별 원페어
  'eye_pair':        { level: 13, name: '선구안 페어', baseChips: 15, multiplier: 2, hitBonus: 0.05, specialEffect: '볼넷 확률 +5%' },
  'speed_pair':      { level: 12, name: '스피드 페어', baseChips: 15, multiplier: 2, hitBonus: 0.05, specialEffect: '도루 성공률 +10%' },
  'contact_pair':    { level: 11, name: '컨택 페어', baseChips: 15, multiplier: 2, hitBonus: 0.08, specialEffect: '안타 확률 +5%' },
  'power_pair':      { level: 10, name: '파워 페어', baseChips: 15, multiplier: 2, hitBonus: 0.05, specialEffect: '장타 확률 +5%' },

  // Lv.9-1: 기본 포커 족보
  'straight_flush':  { level: 9, name: '스트레이트 플러시', baseChips: 100, multiplier: 8, hitBonus: 0.50 },
  'four_of_kind':    { level: 8, name: '포카드', baseChips: 60, multiplier: 7, hitBonus: 0.40 },
  'full_house':      { level: 7, name: '풀하우스', baseChips: 40, multiplier: 4, hitBonus: 0.30 },
  'flush':           { level: 6, name: '플러시', baseChips: 35, multiplier: 4, hitBonus: 0.25 },
  'straight':        { level: 5, name: '스트레이트', baseChips: 30, multiplier: 4, hitBonus: 0.20 },
  'three_of_kind':   { level: 4, name: '트리플', baseChips: 30, multiplier: 3, hitBonus: 0.15 },
  'two_pair':        { level: 3, name: '투페어', baseChips: 20, multiplier: 2, hitBonus: 0.10 },
  'one_pair':        { level: 2, name: '원페어', baseChips: 10, multiplier: 2, hitBonus: 0.05 },
  'high_card':       { level: 1, name: '하이카드', baseChips: 5, multiplier: 1, hitBonus: 0.0 },
};

// ========== 유틸리티 함수들 ==========

/**
 * 카드들의 숫자별 개수를 계산
 */
function countRanks(cards: ActionCard[]): Map<number, ActionCard[]> {
  const rankMap = new Map<number, ActionCard[]>();
  for (const card of cards) {
    const current = rankMap.get(card.rank) || [];
    rankMap.set(card.rank, [...current, card]);
  }
  return rankMap;
}

/**
 * 카드들의 속성별 개수를 계산
 */
function countStats(cards: ActionCard[]): Map<StatType, ActionCard[]> {
  const statMap = new Map<StatType, ActionCard[]>();
  for (const card of cards) {
    const current = statMap.get(card.stat) || [];
    statMap.set(card.stat, [...current, card]);
  }
  return statMap;
}

/**
 * 스트레이트 체크 (연속된 5장)
 */
function checkStraight(cards: ActionCard[]): ActionCard[] | null {
  if (cards.length < 5) return null;

  const sortedRanks = [...new Set(cards.map(c => c.rank))].sort((a, b) => a - b);

  // 연속된 5장 찾기
  for (let i = 0; i <= sortedRanks.length - 5; i++) {
    const slice = sortedRanks.slice(i, i + 5);
    const isConsecutive = slice.every((rank, idx) =>
      idx === 0 || rank === slice[idx - 1] + 1
    );

    if (isConsecutive) {
      return cards.filter(c => slice.includes(c.rank)).slice(0, 5);
    }
  }

  // A-2-3-4-5 (에이스 로우) 체크
  if (sortedRanks.includes(1) && sortedRanks.includes(2) &&
      sortedRanks.includes(3) && sortedRanks.includes(4) &&
      sortedRanks.includes(5)) {
    return cards.filter(c => [1, 2, 3, 4, 5].includes(c.rank)).slice(0, 5);
  }

  // 10-J-Q-K-A (에이스 하이) 체크
  if (sortedRanks.includes(1) && sortedRanks.includes(10) &&
      sortedRanks.includes(11) && sortedRanks.includes(12) &&
      sortedRanks.includes(13)) {
    return cards.filter(c => [1, 10, 11, 12, 13].includes(c.rank)).slice(0, 5);
  }

  return null;
}

/**
 * 특정 속성으로만 스트레이트 체크
 */
function checkStatStraight(cards: ActionCard[], stat: StatType): ActionCard[] | null {
  const statCards = cards.filter(c => c.stat === stat);
  return checkStraight(statCards);
}

/**
 * 플러시 체크 (같은 속성 5장)
 */
function checkFlush(cards: ActionCard[]): ActionCard[] | null {
  const statMap = countStats(cards);

  for (const [, statCards] of statMap) {
    if (statCards.length >= 5) {
      return statCards.slice(0, 5);
    }
  }

  return null;
}

/**
 * 특정 속성으로 풀하우스 체크
 */
function checkStatFullHouse(cards: ActionCard[], stat: StatType): ActionCard[] | null {
  const statCards = cards.filter(c => c.stat === stat);
  if (statCards.length < 5) return null;

  const rankMap = countRanks(statCards);
  const triples = [...rankMap.values()].filter(c => c.length >= 3);
  const pairs = [...rankMap.values()].filter(c => c.length >= 2);

  if (triples.length > 0 && pairs.length > 1) {
    const otherPair = pairs.find(p => p[0].rank !== triples[0][0].rank);
    if (otherPair) {
      return [...triples[0].slice(0, 3), ...otherPair.slice(0, 2)];
    }
  }

  if (triples.length >= 2) {
    return [...triples[0].slice(0, 3), ...triples[1].slice(0, 2)];
  }

  return null;
}

/**
 * 스트레이트 플러시 체크
 */
function checkStraightFlush(cards: ActionCard[]): ActionCard[] | null {
  const statMap = countStats(cards);

  for (const [, statCards] of statMap) {
    if (statCards.length >= 5) {
      const straightCards = checkStraight(statCards);
      if (straightCards) {
        return straightCards;
      }
    }
  }

  return null;
}

/**
 * 특정 속성으로 페어 체크
 */
function checkStatPair(cards: ActionCard[], stat: StatType): ActionCard[] | null {
  const statCards = cards.filter(c => c.stat === stat);
  const rankMap = countRanks(statCards);

  for (const [, rankCards] of rankMap) {
    if (rankCards.length >= 2) {
      return rankCards.slice(0, 2);
    }
  }

  return null;
}

/**
 * 특정 속성으로 트리플 체크
 */
function checkStatTriple(cards: ActionCard[], stat: StatType): ActionCard[] | null {
  const statCards = cards.filter(c => c.stat === stat);
  const rankMap = countRanks(statCards);

  for (const [, rankCards] of rankMap) {
    if (rankCards.length >= 3) {
      return rankCards.slice(0, 3);
    }
  }

  return null;
}

/**
 * 두 속성의 투페어 체크
 */
function checkDualStatTwoPair(cards: ActionCard[], stat1: StatType, stat2: StatType): ActionCard[] | null {
  const pair1 = checkStatPair(cards, stat1);
  const pair2 = checkStatPair(cards, stat2);

  if (pair1 && pair2) {
    return [...pair1, ...pair2];
  }

  return null;
}

// ========== HandResult 생성 헬퍼 ==========

function createHandResult(rank: ActionHandRank, cards: ActionCard[]): HandResult {
  const info = HAND_INFO[rank];
  return {
    rank,
    name: info.name,
    cards,
    multiplier: info.multiplier,
    hitBonus: info.hitBonus,
    baseChips: info.baseChips,
    specialEffect: info.specialEffect,
  };
}

// ========== 메인 족보 판정 함수 ==========

/**
 * 선택된 카드들로 가능한 최고 족보 판정 (28종)
 */
export function evaluateActionHand(cards: ActionCard[]): HandResult {
  if (cards.length === 0) {
    return createHandResult('high_card', []);
  }

  const rankMap = countRanks(cards);
  const statMap = countStats(cards);

  // 기본 집계
  const pairs: ActionCard[][] = [];
  const triples: ActionCard[][] = [];
  const quads: ActionCard[][] = [];

  for (const [, rankCards] of rankMap) {
    if (rankCards.length === 2) pairs.push(rankCards);
    else if (rankCards.length === 3) triples.push(rankCards);
    else if (rankCards.length >= 4) quads.push(rankCards.slice(0, 4));
  }

  // ========== Lv.28: 퍼펙트 스윙 ==========
  // 4속성 각 1장+ & 페어
  const hasPerfectSwing = statMap.size === 4 &&
    [...statMap.values()].every(sc => sc.length >= 1) &&
    pairs.length > 0;
  if (hasPerfectSwing) {
    const allCards: ActionCard[] = [];
    for (const [, sc] of statMap) {
      allCards.push(sc[0]);
    }
    if (pairs.length > 0) {
      allCards.push(...pairs[0]);
    }
    return createHandResult('perfect_swing', allCards.slice(0, 5));
  }

  // ========== Lv.27: 컨택 마스터 ==========
  // 컨택으로만 풀하우스
  const contactFullHouse = checkStatFullHouse(cards, 'contact');
  if (contactFullHouse) {
    return createHandResult('contact_master', contactFullHouse);
  }

  // ========== Lv.26: 스피드 스타 ==========
  // 스피드로만 스트레이트
  const speedStraight = checkStatStraight(cards, 'speed');
  if (speedStraight) {
    return createHandResult('speed_star', speedStraight);
  }

  // ========== Lv.25: 파워 서지 ==========
  // 파워 3장+ & 합계 30+
  const powerCards = statMap.get('power') || [];
  if (powerCards.length >= 3) {
    const powerSum = powerCards.reduce((sum, c) => sum + (c.rank === 1 ? 14 : c.rank), 0);
    if (powerSum >= 30) {
      return createHandResult('power_surge', powerCards.slice(0, Math.min(5, powerCards.length)));
    }
  }

  // ========== Lv.24: 배팅 아이 ==========
  // 선구안 4장+
  const eyeCards = statMap.get('eye') || [];
  if (eyeCards.length >= 4) {
    return createHandResult('batting_eye', eyeCards.slice(0, Math.min(5, eyeCards.length)));
  }

  // ========== Lv.23-18: 이중 속성 투페어 ==========
  const speedEyeTwoPair = checkDualStatTwoPair(cards, 'speed', 'eye');
  if (speedEyeTwoPair) {
    return createHandResult('speed_eye', speedEyeTwoPair);
  }

  const contactEyeTwoPair = checkDualStatTwoPair(cards, 'contact', 'eye');
  if (contactEyeTwoPair) {
    return createHandResult('contact_eye', contactEyeTwoPair);
  }

  const contactSpeedTwoPair = checkDualStatTwoPair(cards, 'contact', 'speed');
  if (contactSpeedTwoPair) {
    return createHandResult('contact_speed', contactSpeedTwoPair);
  }

  const powerEyeTwoPair = checkDualStatTwoPair(cards, 'power', 'eye');
  if (powerEyeTwoPair) {
    return createHandResult('power_eye', powerEyeTwoPair);
  }

  const powerSpeedTwoPair = checkDualStatTwoPair(cards, 'power', 'speed');
  if (powerSpeedTwoPair) {
    return createHandResult('power_speed', powerSpeedTwoPair);
  }

  const powerContactTwoPair = checkDualStatTwoPair(cards, 'power', 'contact');
  if (powerContactTwoPair) {
    return createHandResult('power_contact', powerContactTwoPair);
  }

  // ========== Lv.17-14: 속성별 트리플 ==========
  const eyeTriple = checkStatTriple(cards, 'eye');
  if (eyeTriple) {
    return createHandResult('eye_triple', eyeTriple);
  }

  const speedTriple = checkStatTriple(cards, 'speed');
  if (speedTriple) {
    return createHandResult('speed_triple', speedTriple);
  }

  const contactTriple = checkStatTriple(cards, 'contact');
  if (contactTriple) {
    return createHandResult('contact_triple', contactTriple);
  }

  const powerTriple = checkStatTriple(cards, 'power');
  if (powerTriple) {
    return createHandResult('power_triple', powerTriple);
  }

  // ========== Lv.13-10: 속성별 원페어 ==========
  const eyePair = checkStatPair(cards, 'eye');
  if (eyePair) {
    return createHandResult('eye_pair', eyePair);
  }

  const speedPair = checkStatPair(cards, 'speed');
  if (speedPair) {
    return createHandResult('speed_pair', speedPair);
  }

  const contactPair = checkStatPair(cards, 'contact');
  if (contactPair) {
    return createHandResult('contact_pair', contactPair);
  }

  const powerPair = checkStatPair(cards, 'power');
  if (powerPair) {
    return createHandResult('power_pair', powerPair);
  }

  // ========== Lv.9-1: 기본 포커 족보 ==========

  // 스트레이트 플러시
  const straightFlush = checkStraightFlush(cards);
  if (straightFlush) {
    return createHandResult('straight_flush', straightFlush);
  }

  // 포카드
  if (quads.length > 0) {
    return createHandResult('four_of_kind', quads[0]);
  }

  // 풀하우스
  if (triples.length > 0 && pairs.length > 0) {
    return createHandResult('full_house', [...triples[0], ...pairs[0]]);
  }
  if (triples.length >= 2) {
    return createHandResult('full_house', [...triples[0], ...triples[1].slice(0, 2)]);
  }

  // 플러시
  const flush = checkFlush(cards);
  if (flush) {
    return createHandResult('flush', flush);
  }

  // 스트레이트
  const straight = checkStraight(cards);
  if (straight) {
    return createHandResult('straight', straight);
  }

  // 트리플
  if (triples.length > 0) {
    return createHandResult('three_of_kind', triples[0]);
  }

  // 투페어
  if (pairs.length >= 2) {
    return createHandResult('two_pair', [...pairs[0], ...pairs[1]]);
  }

  // 원페어
  if (pairs.length === 1) {
    return createHandResult('one_pair', pairs[0]);
  }

  // 하이카드
  const sortedCards = [...cards].sort((a, b) => {
    const aRank = a.rank === 1 ? 14 : a.rank;
    const bRank = b.rank === 1 ? 14 : b.rank;
    return bRank - aRank;
  });

  return createHandResult('high_card', [sortedCards[0]]);
}
