import { PokerCard, HandRank, HandResult } from './types';

/**
 * 족보 정보
 * hitBonus: 안타 확률에 더해지는 보너스 (선수 타율 + hitBonus = 최종 확률)
 */
export const HAND_INFO: Record<HandRank, { name: string; multiplier: number; minCards: number; hitBonus: number }> = {
  'high_card':       { name: '하이 카드', multiplier: 1, minCards: 1, hitBonus: -0.5 },      // 타율 - 0.5 (거의 아웃)
  'one_pair':        { name: '원 페어', multiplier: 2, minCards: 2, hitBonus: 0.2 },        // 타율 + 0.2
  'two_pair':        { name: '투 페어', multiplier: 3, minCards: 4, hitBonus: 0.4 },        // 타율 + 0.4
  'three_of_kind':   { name: '트리플', multiplier: 4, minCards: 3, hitBonus: 0.5 },         // 타율 + 0.5
  'straight':        { name: '스트레이트', multiplier: 5, minCards: 5, hitBonus: 0.6 },     // 타율 + 0.6
  'flush':           { name: '플러시', multiplier: 6, minCards: 5, hitBonus: 0.7 },         // 타율 + 0.7
  'full_house':      { name: '풀 하우스', multiplier: 7, minCards: 5, hitBonus: 0.8 },      // 타율 + 0.8 (거의 확정)
  'four_of_kind':    { name: '포카드', multiplier: 8, minCards: 4, hitBonus: 1.0 },         // 확정 안타
  'straight_flush':  { name: '스트레이트 플러시', multiplier: 10, minCards: 5, hitBonus: 1.5 }, // 확정 + 보너스
};

/**
 * 카드들의 랭크별 개수를 계산
 */
function countRanks(cards: PokerCard[]): Map<number, PokerCard[]> {
  const rankMap = new Map<number, PokerCard[]>();
  
  for (const card of cards) {
    const current = rankMap.get(card.rank) || [];
    rankMap.set(card.rank, [...current, card]);
  }
  
  return rankMap;
}

/**
 * 카드들의 무늬별 개수를 계산
 */
function countSuits(cards: PokerCard[]): Map<string, PokerCard[]> {
  const suitMap = new Map<string, PokerCard[]>();
  
  for (const card of cards) {
    const current = suitMap.get(card.suit) || [];
    suitMap.set(card.suit, [...current, card]);
  }
  
  return suitMap;
}

/**
 * 스트레이트 체크 (연속된 5장)
 * A-2-3-4-5 (로우 스트레이트)와 10-J-Q-K-A (로열 스트레이트) 모두 인정
 */
function checkStraight(cards: PokerCard[]): PokerCard[] | null {
  if (cards.length < 5) return null;
  
  // 랭크 기준 정렬 (A는 1이지만 14로도 사용 가능)
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
 * 플러시 체크 (같은 무늬 5장)
 */
function checkFlush(cards: PokerCard[]): PokerCard[] | null {
  const suitMap = countSuits(cards);
  
  for (const [, suitCards] of suitMap) {
    if (suitCards.length >= 5) {
      return suitCards.slice(0, 5);
    }
  }
  
  return null;
}

/**
 * 스트레이트 플러시 체크
 */
function checkStraightFlush(cards: PokerCard[]): PokerCard[] | null {
  const suitMap = countSuits(cards);
  
  for (const [, suitCards] of suitMap) {
    if (suitCards.length >= 5) {
      const straightCards = checkStraight(suitCards);
      if (straightCards) {
        return straightCards;
      }
    }
  }
  
  return null;
}

/**
 * 선택된 카드들로 가능한 최고 족보 판정
 */
export function evaluateHand(cards: PokerCard[]): HandResult {
  if (cards.length === 0) {
    return {
      rank: 'high_card',
      name: HAND_INFO['high_card'].name,
      cards: [],
      multiplier: HAND_INFO['high_card'].multiplier,
      hitBonus: HAND_INFO['high_card'].hitBonus,
    };
  }

  const rankMap = countRanks(cards);
  
  // 페어, 트리플, 포카드 개수 계산
  const pairs: PokerCard[][] = [];
  const triples: PokerCard[][] = [];
  const quads: PokerCard[][] = [];
  
  for (const [, rankCards] of rankMap) {
    if (rankCards.length === 2) pairs.push(rankCards);
    else if (rankCards.length === 3) triples.push(rankCards);
    else if (rankCards.length >= 4) quads.push(rankCards.slice(0, 4));
  }
  
  // 스트레이트 플러시 체크
  const straightFlush = checkStraightFlush(cards);
  if (straightFlush) {
    return {
      rank: 'straight_flush',
      name: HAND_INFO['straight_flush'].name,
      cards: straightFlush,
      multiplier: HAND_INFO['straight_flush'].multiplier,
      hitBonus: HAND_INFO['straight_flush'].hitBonus,
    };
  }
  
  // 포카드 체크
  if (quads.length > 0) {
    return {
      rank: 'four_of_kind',
      name: HAND_INFO['four_of_kind'].name,
      cards: quads[0],
      multiplier: HAND_INFO['four_of_kind'].multiplier,
      hitBonus: HAND_INFO['four_of_kind'].hitBonus,
    };
  }
  
  // 풀하우스 체크 (트리플 + 페어)
  if (triples.length > 0 && pairs.length > 0) {
    return {
      rank: 'full_house',
      name: HAND_INFO['full_house'].name,
      cards: [...triples[0], ...pairs[0]],
      multiplier: HAND_INFO['full_house'].multiplier,
      hitBonus: HAND_INFO['full_house'].hitBonus,
    };
  }
  
  // 트리플이 2개인 경우도 풀하우스
  if (triples.length >= 2) {
    return {
      rank: 'full_house',
      name: HAND_INFO['full_house'].name,
      cards: [...triples[0], ...triples[1].slice(0, 2)],
      multiplier: HAND_INFO['full_house'].multiplier,
      hitBonus: HAND_INFO['full_house'].hitBonus,
    };
  }
  
  // 플러시 체크
  const flush = checkFlush(cards);
  if (flush) {
    return {
      rank: 'flush',
      name: HAND_INFO['flush'].name,
      cards: flush,
      multiplier: HAND_INFO['flush'].multiplier,
      hitBonus: HAND_INFO['flush'].hitBonus,
    };
  }
  
  // 스트레이트 체크
  const straight = checkStraight(cards);
  if (straight) {
    return {
      rank: 'straight',
      name: HAND_INFO['straight'].name,
      cards: straight,
      multiplier: HAND_INFO['straight'].multiplier,
      hitBonus: HAND_INFO['straight'].hitBonus,
    };
  }
  
  // 트리플 체크
  if (triples.length > 0) {
    return {
      rank: 'three_of_kind',
      name: HAND_INFO['three_of_kind'].name,
      cards: triples[0],
      multiplier: HAND_INFO['three_of_kind'].multiplier,
      hitBonus: HAND_INFO['three_of_kind'].hitBonus,
    };
  }
  
  // 투페어 체크
  if (pairs.length >= 2) {
    return {
      rank: 'two_pair',
      name: HAND_INFO['two_pair'].name,
      cards: [...pairs[0], ...pairs[1]],
      multiplier: HAND_INFO['two_pair'].multiplier,
      hitBonus: HAND_INFO['two_pair'].hitBonus,
    };
  }
  
  // 원페어 체크
  if (pairs.length === 1) {
    return {
      rank: 'one_pair',
      name: HAND_INFO['one_pair'].name,
      cards: pairs[0],
      multiplier: HAND_INFO['one_pair'].multiplier,
      hitBonus: HAND_INFO['one_pair'].hitBonus,
    };
  }
  
  // 하이카드
  const sortedCards = [...cards].sort((a, b) => {
    const aRank = a.rank === 1 ? 14 : a.rank;
    const bRank = b.rank === 1 ? 14 : b.rank;
    return bRank - aRank;
  });
  
  return {
    rank: 'high_card',
    name: HAND_INFO['high_card'].name,
    cards: [sortedCards[0]],
    multiplier: HAND_INFO['high_card'].multiplier,
    hitBonus: HAND_INFO['high_card'].hitBonus,
  };
}

/**
 * 선택 가능한 모든 족보 목록 반환 (UI 표시용)
 */
export function getAvailableHands(cards: PokerCard[]): HandResult[] {
  const results: HandResult[] = [];
  const rankMap = countRanks(cards);
  
  const straightFlush = checkStraightFlush(cards);
  if (straightFlush) {
    results.push({
      rank: 'straight_flush',
      name: HAND_INFO['straight_flush'].name,
      cards: straightFlush,
      multiplier: HAND_INFO['straight_flush'].multiplier,
      hitBonus: HAND_INFO['straight_flush'].hitBonus,
    });
  }
  
  for (const [, rankCards] of rankMap) {
    if (rankCards.length >= 4) {
      results.push({
        rank: 'four_of_kind',
        name: HAND_INFO['four_of_kind'].name,
        cards: rankCards.slice(0, 4),
        multiplier: HAND_INFO['four_of_kind'].multiplier,
        hitBonus: HAND_INFO['four_of_kind'].hitBonus,
      });
    }
  }
  
  const triples = [...rankMap.values()].filter(c => c.length >= 3);
  const pairs = [...rankMap.values()].filter(c => c.length >= 2);
  if (triples.length > 0 && pairs.length > 1) {
    const otherPair = pairs.find(p => p[0].rank !== triples[0][0].rank);
    if (otherPair) {
      results.push({
        rank: 'full_house',
        name: HAND_INFO['full_house'].name,
        cards: [...triples[0].slice(0, 3), ...otherPair.slice(0, 2)],
        multiplier: HAND_INFO['full_house'].multiplier,
        hitBonus: HAND_INFO['full_house'].hitBonus,
      });
    }
  }
  
  const flush = checkFlush(cards);
  if (flush && !straightFlush) {
    results.push({
      rank: 'flush',
      name: HAND_INFO['flush'].name,
      cards: flush,
      multiplier: HAND_INFO['flush'].multiplier,
      hitBonus: HAND_INFO['flush'].hitBonus,
    });
  }
  
  const straight = checkStraight(cards);
  if (straight && !straightFlush) {
    results.push({
      rank: 'straight',
      name: HAND_INFO['straight'].name,
      cards: straight,
      multiplier: HAND_INFO['straight'].multiplier,
      hitBonus: HAND_INFO['straight'].hitBonus,
    });
  }
  
  for (const [, rankCards] of rankMap) {
    if (rankCards.length >= 3 && rankCards.length < 4) {
      results.push({
        rank: 'three_of_kind',
        name: HAND_INFO['three_of_kind'].name,
        cards: rankCards.slice(0, 3),
        multiplier: HAND_INFO['three_of_kind'].multiplier,
        hitBonus: HAND_INFO['three_of_kind'].hitBonus,
      });
    }
  }
  
  const pairGroups = [...rankMap.values()].filter(c => c.length >= 2);
  if (pairGroups.length >= 2) {
    results.push({
      rank: 'two_pair',
      name: HAND_INFO['two_pair'].name,
      cards: [...pairGroups[0].slice(0, 2), ...pairGroups[1].slice(0, 2)],
      multiplier: HAND_INFO['two_pair'].multiplier,
      hitBonus: HAND_INFO['two_pair'].hitBonus,
    });
  }
  
  for (const [, rankCards] of rankMap) {
    if (rankCards.length >= 2) {
      results.push({
        rank: 'one_pair',
        name: HAND_INFO['one_pair'].name,
        cards: rankCards.slice(0, 2),
        multiplier: HAND_INFO['one_pair'].multiplier,
        hitBonus: HAND_INFO['one_pair'].hitBonus,
      });
      break;
    }
  }
  
  if (cards.length > 0) {
    const sortedCards = [...cards].sort((a, b) => {
      const aRank = a.rank === 1 ? 14 : a.rank;
      const bRank = b.rank === 1 ? 14 : b.rank;
      return bRank - aRank;
    });
    results.push({
      rank: 'high_card',
      name: HAND_INFO['high_card'].name,
      cards: [sortedCards[0]],
      multiplier: HAND_INFO['high_card'].multiplier,
      hitBonus: HAND_INFO['high_card'].hitBonus,
    });
  }
  
  return results;
}
