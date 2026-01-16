// 선수 카드 태그
export type PlayerTag = 'speed' | 'power' | 'contact' | 'eye';

// 선수 카드
export interface PlayerCard {
  id: string;
  name: string;
  tags: PlayerTag[];
  // 스탯
  battingAverage: number; // 타율 (0-1)
  power: number;          // 장타력 (1-10)
  speed: number;          // 주루 속도 (1-10)
}

// ========== 트럼프 카드 시스템 ==========

// 트럼프 카드 무늬
export type Suit = 'spade' | 'heart' | 'diamond' | 'club';

// 트럼프 카드 숫자 (1=A, 11=J, 12=Q, 13=K)
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

// 트럼프 카드
export interface PokerCard {
  id: string;
  suit: Suit;
  rank: Rank;
  selected: boolean; // 플레이어가 선택했는지
}

// 족보 타입
export type HandRank = 
  | 'high_card'         // 하이카드
  | 'one_pair'          // 원페어
  | 'two_pair'          // 투페어
  | 'three_of_kind'     // 트리플
  | 'straight'          // 스트레이트
  | 'flush'             // 플러시
  | 'full_house'        // 풀하우스
  | 'four_of_kind'      // 포카드
  | 'straight_flush';   // 스트레이트 플러시

// 족보 결과
export interface HandResult {
  rank: HandRank;
  name: string;
  cards: PokerCard[];     // 족보를 구성하는 카드들
  multiplier: number;     // 점수 배율
}

// 야구 결과 타입
export type BaseballResult = 
  | 'out'           // 아웃
  | 'single'        // 1루타
  | 'double'        // 2루타
  | 'triple'        // 3루타
  | 'homerun';      // 홈런

// 족보에 따른 야구 결과
export interface PlayResult {
  baseballResult: BaseballResult;
  handResult: HandResult;
  runsScored: number;
  pointsEarned: number;   // 최종 획득 포인트
  description: string;
}

// 루 상태 (null이면 주자 없음)
export interface BaseState {
  first: PlayerCard | null;
  second: PlayerCard | null;
  third: PlayerCard | null;
}

// 게임 단계
export type GamePhase = 
  | 'selectPlayer'  // 선수 선택 단계
  | 'selectCards'   // 트럼프 카드 선택 단계
  | 'showResult'    // 결과 표시 단계
  | 'inningEnd'     // 이닝 종료
  | 'gameEnd';      // 게임 종료

// 게임 상태
export interface GameState {
  // 이닝 정보
  currentInning: number;
  maxInnings: number;         // 최대 이닝 (9이닝)
  outs: number;
  score: number;              // 야구 점수 (득점)
  totalPoints: number;        // 총 포인트 (Score × 배율)
  
  // 루 상태
  bases: BaseState;
  
  // 선수 카드 덱 상태
  playerDeck: PlayerCard[];      // 선수덱 (남은 카드)
  playerHand: PlayerCard[];      // 선수 손패 (3장)
  selectedPlayer: PlayerCard | null; // 선택된 선수
  
  // 트럼프 카드 덱 상태
  pokerDeck: PokerCard[];        // 트럼프덱 (남은 카드)
  pokerHand: PokerCard[];        // 트럼프 손패 (5장)
  selectedPokerCards: PokerCard[]; // 선택한 트럼프 카드
  
  // 현재 결과
  currentResult: PlayResult | null;
  
  // 게임 단계
  phase: GamePhase;
  
  // 이닝별 목표 포인트
  targetPoints: number;
  inningPoints: number;       // 현재 이닝에서 획득한 포인트
  
  // 리드로우 횟수 (트럼프 카드 다시 뽑기)
  redrawsRemaining: number;
}

// 액션 결과 (기존 호환용)
export interface ActionResult {
  runsScored: number;
  newBases: BaseState;
  isOut: boolean;
  description: string;
  pointsEarned?: number;
}
