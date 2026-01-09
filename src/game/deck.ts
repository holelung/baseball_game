import { PlayerCard, ActionCard } from './types';

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
 * 액션덱에서 1장 드로우
 */
export function drawAction(deck: ActionCard[]): {
  drawn: ActionCard | null;
  remaining: ActionCard[];
} {
  if (deck.length === 0) {
    return { drawn: null, remaining: [] };
  }
  const [drawn, ...remaining] = deck;
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
