import { PlayerCard, PokerCard, Suit, Rank } from './types';

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

// ========== 트럼프 카드 덱 관련 ==========

const SUITS: Suit[] = ['spade', 'heart', 'diamond', 'club'];
const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/**
 * 52장의 트럼프 덱 생성
 */
export function createPokerDeck(): PokerCard[] {
  const deck: PokerCard[] = [];
  let id = 0;
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `poker_${id++}`,
        suit,
        rank,
        selected: false,
      });
    }
  }
  
  return deck;
}

/**
 * 트럼프 덱에서 n장 드로우
 */
export function drawPokerCards(deck: PokerCard[], count: number): {
  drawn: PokerCard[];
  remaining: PokerCard[];
} {
  const drawn = deck.slice(0, count).map(card => ({ ...card, selected: false }));
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

/**
 * 카드 선택 토글
 */
export function toggleCardSelection(cards: PokerCard[], cardId: string): PokerCard[] {
  return cards.map(card => 
    card.id === cardId 
      ? { ...card, selected: !card.selected }
      : card
  );
}

/**
 * 선택된 카드들 가져오기
 */
export function getSelectedCards(cards: PokerCard[]): PokerCard[] {
  return cards.filter(card => card.selected);
}

/**
 * 카드 랭크를 표시 문자로 변환
 */
export function getRankDisplay(rank: Rank): string {
  switch (rank) {
    case 1: return 'A';
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    default: return rank.toString();
  }
}

/**
 * 무늬를 이모지로 변환
 */
export function getSuitEmoji(suit: Suit): string {
  switch (suit) {
    case 'spade': return '♠';
    case 'heart': return '♥';
    case 'diamond': return '♦';
    case 'club': return '♣';
  }
}

/**
 * 무늬가 빨간색인지 확인
 */
export function isRedSuit(suit: Suit): boolean {
  return suit === 'heart' || suit === 'diamond';
}
