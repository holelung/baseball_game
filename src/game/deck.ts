import { PlayerCard, ActionCard, StatType, ActionRank } from './types';

/**
 * Fisher-Yates 셔플 알고리즘
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 선수덱에서 n장 드로우
 */
export function drawPlayers(deck: PlayerCard[], count: number): {
  drawn: PlayerCard[];
  remaining: PlayerCard[];
} {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

/**
 * 선수를 덱 하단에 추가 (아웃 시)
 */
export function addToBottom(deck: PlayerCard[], player: PlayerCard): PlayerCard[] {
  return [...deck, player];
}

/**
 * 특정 선수를 덱에서 제거 (출루 시)
 */
export function removeFromDeck(deck: PlayerCard[], playerId: string): PlayerCard[] {
  return deck.filter(p => p.id !== playerId);
}

/**
 * 손패에서 선수 선택 후 나머지를 덱에 되돌리기
 * 선수덱은 예측 가능한 순서를 유지해야 하므로 덱 상단에 되돌림
 */
export function returnToDeck(deck: PlayerCard[], players: PlayerCard[]): PlayerCard[] {
  return [...players, ...deck];
}

// ========== 액션 카드 덱 관련 ==========

const STATS: StatType[] = ['power', 'contact', 'speed', 'eye'];
const RANKS: ActionRank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/**
 * 52장의 액션 카드 덱 생성
 */
export function createActionDeck(): ActionCard[] {
  const deck: ActionCard[] = [];
  let id = 0;

  for (const stat of STATS) {
    for (const rank of RANKS) {
      deck.push({
        id: `action_${id++}`,
        stat,
        rank,
        selected: false,
      });
    }
  }

  return deck;
}

/**
 * 액션 카드 덱에서 n장 드로우
 */
export function drawActionCards(deck: ActionCard[], count: number): {
  drawn: ActionCard[];
  remaining: ActionCard[];
} {
  const drawn = deck.slice(0, count).map(card => ({ ...card, selected: false }));
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

/**
 * 액션 카드 선택 토글
 */
export function toggleActionCardSelection(cards: ActionCard[], cardId: string): ActionCard[] {
  return cards.map(card =>
    card.id === cardId
      ? { ...card, selected: !card.selected }
      : card
  );
}

/**
 * 선택된 액션 카드들 가져오기
 */
export function getSelectedActionCards(cards: ActionCard[]): ActionCard[] {
  return cards.filter(card => card.selected);
}

/**
 * 카드 랭크를 표시 문자로 변환
 */
export function getRankDisplay(rank: ActionRank): string {
  switch (rank) {
    case 1: return 'A';
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    default: return rank.toString();
  }
}

/**
 * 속성을 이모지로 변환
 */
export function getStatEmoji(stat: StatType): string {
  switch (stat) {
    case 'power': return '💪';
    case 'contact': return '🎯';
    case 'speed': return '👟';
    case 'eye': return '👀';
  }
}

/**
 * 속성별 색상 클래스 반환
 */
export function getStatColorClass(stat: StatType): string {
  switch (stat) {
    case 'power': return 'text-red-500';
    case 'contact': return 'text-blue-500';
    case 'speed': return 'text-green-500';
    case 'eye': return 'text-yellow-500';
  }
}

/**
 * 속성별 배경 그라데이션 클래스 반환
 */
export function getStatBgClass(stat: StatType): string {
  switch (stat) {
    case 'power': return 'from-red-600 to-red-800';
    case 'contact': return 'from-blue-600 to-blue-800';
    case 'speed': return 'from-green-600 to-green-800';
    case 'eye': return 'from-yellow-600 to-amber-700';
  }
}
