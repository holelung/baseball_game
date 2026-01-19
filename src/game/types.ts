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
  // 큐 순서 공개 여부 (한번 사용하면 순서를 알게 됨)
  revealed: boolean;
}

// ========== 야구 액션 카드 시스템 ==========

// 4가지 속성 (트럼프 무늬 대체)
export type StatType = 'power' | 'contact' | 'speed' | 'eye';

// 액션 카드 숫자 (1=A, 11=J, 12=Q, 13=K)
export type ActionRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

// 액션 카드
export interface ActionCard {
  id: string;
  stat: StatType;
  rank: ActionRank;
  selected: boolean; // 플레이어가 선택했는지
}

// 28종 족보 타입
export type ActionHandRank =
  // 기본 포커 족보 (Lv.1-9)
  | 'high_card'             // 하이카드
  | 'one_pair'              // 원페어
  | 'two_pair'              // 투페어
  | 'three_of_kind'         // 트리플
  | 'straight'              // 스트레이트
  | 'flush'                 // 플러시
  | 'full_house'            // 풀하우스
  | 'four_of_kind'          // 포카드
  | 'straight_flush'        // 스트레이트 플러시
  // 속성별 원페어 (Lv.10-13)
  | 'power_pair'            // 파워 페어
  | 'contact_pair'          // 컨택 페어
  | 'speed_pair'            // 스피드 페어
  | 'eye_pair'              // 선구안 페어
  // 속성별 트리플 (Lv.14-17)
  | 'power_triple'          // 파워 트리플
  | 'contact_triple'        // 컨택 트리플 (안타 확정!)
  | 'speed_triple'          // 스피드 트리플
  | 'eye_triple'            // 선구안 트리플
  // 이중 속성 투페어 (Lv.18-23)
  | 'power_contact'         // 파워컨택
  | 'power_speed'           // 파워스피드
  | 'power_eye'             // 파워아이
  | 'contact_speed'         // 컨택스피드
  | 'contact_eye'           // 컨택아이
  | 'speed_eye'             // 스피드아이
  // 상위 야구 전용 족보 (Lv.24-28)
  | 'batting_eye'           // 배팅 아이 (선구안 4장+)
  | 'power_surge'           // 파워 서지 (파워 3장+ & 합계 30+)
  | 'speed_star'            // 스피드 스타 (스피드로만 스트레이트)
  | 'contact_master'        // 컨택 마스터 (컨택으로만 풀하우스)
  | 'perfect_swing';        // 퍼펙트 스윙 (4속성 각 1장+ & 페어)

// 족보 결과
export interface HandResult {
  rank: ActionHandRank;
  name: string;
  cards: ActionCard[];     // 족보를 구성하는 카드들
  multiplier: number;      // 점수 배율
  hitBonus: number;        // 안타 확률 보너스 (0.0 ~ 1.0+)
  baseChips: number;       // 기본 칩
  specialEffect?: string;  // 특수 효과 설명
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
  // 확률 시스템
  hitProbability: number; // 최종 안타 확률
  wasLucky: boolean;      // 확률 판정 성공 여부
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
  playerHand: PlayerCard[];      // 선수 손패 (최초 3장, 이후 1장씩)
  selectedPlayer: PlayerCard | null; // 선택된 선수
  isFirstAtBat: boolean;         // 이닝 첫 타석 여부
  
  // 액션 카드 덱 상태
  actionDeck: ActionCard[];        // 액션덱 (남은 카드)
  actionHand: ActionCard[];        // 액션 손패 (8장)
  selectedActionCards: ActionCard[]; // 선택한 액션 카드
  
  // 현재 결과
  currentResult: PlayResult | null;
  
  // 게임 단계
  phase: GamePhase;
  
  // 이닝별 목표 포인트
  targetPoints: number;
  inningPoints: number;       // 현재 이닝에서 획득한 포인트
  
  // 버리기 횟수 (이닝당)
  discardsRemaining: number;
}

// 액션 결과 (기존 호환용)
export interface ActionResult {
  runsScored: number;
  newBases: BaseState;
  isOut: boolean;
  description: string;
  pointsEarned?: number;
}
