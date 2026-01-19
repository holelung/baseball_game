// 선수 카드 태그
export type PlayerTag = 'speed' | 'power' | 'contact' | 'eye';

// ========== 선수 고유 능력 시스템 ==========

// 능력 타입
export type AbilityType =
  | 'clutch'        // 결정력: 2사 상황에서 안타 확률 +15%
  | 'leadoff'       // 선두타자: 이닝 첫 타석에서 출루 시 추가 진루
  | 'cleanup'       // 클린업: 주자가 있을 때 장타 확률 +15%
  | 'speedster'     // 쾌속: 1루타 시 50% 확률로 2루타로 업그레이드
  | 'run_producer'  // 타점 제조기: 타점 획득 시 포인트 1.5배
  | 'contact_master' // 안타 장인: 아웃 판정 시 20% 확률로 내야안타
  | 'power_hitter'  // 장타자: 안타 시 장타 확률 +20%
  | 'patient'       // 인내심: 일반 모드에서도 안타 확률 +10%
  | 'hot_streak';   // 연속 안타: 직전 타석 안타 시 이번 타석 +15%

// 능력 정보
export interface AbilityInfo {
  type: AbilityType;
  name: string;
  description: string;
  icon: string;
}

// 선수 카드
export interface PlayerCard {
  id: string;
  name: string;
  tags: PlayerTag[];
  // 스탯
  battingAverage: number; // 타율 (0-1)
  power: number;          // 장타력 (1-10)
  speed: number;          // 주루 속도 (1-10)
  // 고유 능력
  ability?: AbilityType;
  // 큐 순서 공개 여부 (한번 사용하면 순서를 알게 됨)
  revealed: boolean;
}

// ========== 야구 액션 카드 시스템 ==========

// 4가지 속성
export type StatType = 'power' | 'contact' | 'speed' | 'eye';

// 액션 카드 (속성만 존재, 숫자 없음)
export interface ActionCard {
  id: string;
  stat: StatType;
  selected: boolean; // 플레이어가 선택했는지
}

// ========== 임계값 기반 액션 모드 시스템 (6종) ==========

// 액션 모드 타입
export type ActionMode =
  | 'power_swing'      // 파워 스윙: 💪 3장 이상
  | 'contact_hit'      // 정확한 타격: 🎯 3장 이상
  | 'speed_play'       // 스피드 플레이: 👟 3장 이상
  | 'eye_mode'         // 선구안 모드: 👀 3장 이상
  | 'balanced'         // 밸런스: 2속성 각 2장 이상
  | 'normal';          // 일반: 조건 미충족

// 속성별 카드 집계
export interface StatCount {
  power: number;
  contact: number;
  speed: number;
  eye: number;
}

// 모드 결과
export interface ModeResult {
  mode: ActionMode;
  name: string;
  description: string;
  cards: ActionCard[];     // 선택한 카드들
  statCount: StatCount;    // 속성별 카드 수
  // 효과
  hitBonus: number;        // 안타 확률 보너스
  extraBaseChance: number; // 장타 확률 (0.0 ~ 1.0)
  specialEffect?: string;  // 특수 효과 설명
}

// 기존 HandResult를 ModeResult로 대체하는 타입 별칭 (호환성)
export type HandResult = ModeResult;

// 야구 결과 타입
export type BaseballResult = 
  | 'out'           // 아웃
  | 'single'        // 1루타
  | 'double'        // 2루타
  | 'triple'        // 3루타
  | 'homerun';      // 홈런

// 점수 계산 분해 (단순화)
export interface ScoreBreakdown {
  modeBonus: number;       // 모드 보너스
  synergyBonus: number;    // 선수-모드 시너지 보너스
  abilityBonus: number;    // 능력 보너스
  runBonus: number;        // 득점 보너스 (득점 × 20)
  finalScore: number;      // 최종 점수
}

// 모드에 따른 야구 결과
export interface PlayResult {
  baseballResult: BaseballResult;
  modeResult: ModeResult;
  runsScored: number;
  pointsEarned: number;   // 최종 획득 포인트
  description: string;
  // 확률 시스템
  hitProbability: number; // 최종 안타 확률
  wasLucky: boolean;      // 확률 판정 성공 여부
  // 시너지 정보
  hasSynergy: boolean;    // 선수-모드 시너지 발동 여부
  synergyDescription?: string;
  // 능력 발동 정보
  abilityTriggered: boolean;
  abilityDescription?: string;
  // 점수 분해
  scoreBreakdown: ScoreBreakdown;
}

// 기존 호환성을 위한 별칭
export interface PlayResultLegacy extends PlayResult {
  handResult: ModeResult; // 기존 코드 호환
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
