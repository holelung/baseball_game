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

// 액션 카드 타입
export type ActionType = 
  | 'single'      // 안타
  | 'double'      // 2루타
  | 'triple'      // 3루타
  | 'homerun'     // 홈런
  | 'walk'        // 볼넷
  | 'groundout'   // 땅볼 아웃
  | 'flyout'      // 플라이 아웃
  | 'strikeout';  // 삼진

// 액션 카드
export interface ActionCard {
  id: string;
  type: ActionType;
  name: string;
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
  | 'showAction'    // 액션 결과 표시 단계
  | 'inningEnd'     // 이닝 종료
  | 'gameEnd';      // 게임 종료

// 게임 상태
export interface GameState {
  // 이닝 정보
  currentInning: number;
  outs: number;
  score: number;
  
  // 루 상태
  bases: BaseState;
  
  // 덱 상태
  playerDeck: PlayerCard[];      // 선수덱 (남은 카드)
  playerHand: PlayerCard[];      // 선수 손패 (3장)
  playerDiscard: PlayerCard[];   // 아웃된 선수 (덱 하단으로 갈 예정)
  
  actionDeck: ActionCard[];      // 액션덱 (남은 카드)
  currentAction: ActionCard | null; // 현재 액션 카드
  
  // 게임 단계
  phase: GamePhase;
  
  // 이닝별 목표 점수
  targetScore: number;
  
  // 드롭 횟수 (액션 카드 버리기)
  dropsRemaining: number;
}

// 액션 결과
export interface ActionResult {
  runsScored: number;
  newBases: BaseState;
  isOut: boolean;
  description: string;
}
