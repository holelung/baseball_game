/**
 * 스탯 기반 액션 카드 덱 시스템
 * 
 * 4가지 속성 (파워, 컨택, 스피드, 아이) × 13개 숫자 = 52장
 * 기존 트럼프 카드와 1:1 대응되어 점진적 마이그레이션 가능
 */

// ========== 타입 정의 ==========

/** 4가지 야구 속성 */
export type ActionAttribute = 'power' | 'contact' | 'speed' | 'eye';

/** 카드 값 (1-13) */
export type ActionValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/** 스탯 기반 액션 카드 */
export interface StatActionCard {
  id: string;
  attribute: ActionAttribute;
  value: ActionValue;
  selected: boolean;
  // 강화 시스템용 (추후 확장)
  enhancement?: {
    bonusChips?: number;      // 추가 칩(점수)
    bonusMultiplier?: number; // 추가 배율
  };
}

/** 속성 정보 */
export interface AttributeInfo {
  id: ActionAttribute;
  name: string;
  nameEn: string;
  emoji: string;
  color: string;
  description: string;
  bonusEffect: string;
}

/** 족보 타입 */
export type ActionHandRank =
  // 기본 포커 족보
  | 'high_card'         // 하이카드
  | 'one_pair'          // 원페어
  | 'two_pair'          // 투페어
  | 'three_of_kind'     // 트리플
  | 'straight'          // 스트레이트
  | 'flush'             // 플러시 (같은 속성 5장)
  | 'full_house'        // 풀하우스
  | 'four_of_kind'      // 포카드
  | 'straight_flush'    // 스트레이트 플러시
  // 야구 전용 족보
  | 'perfect_swing'     // 퍼펙트 스윙: 파워 + 컨택 + 아이 조합
  | 'speed_star'        // 스피드 스타: 스피드 카드로 스트레이트
  | 'power_surge'       // 파워 서지: 파워 카드 3장 + 합계 30 이상
  | 'batting_eye'       // 배팅 아이: 아이 카드 4장 이상
  | 'contact_master';   // 컨택 마스터: 컨택 카드로 풀하우스

/** 족보 정보 */
export interface HandInfo {
  rank: ActionHandRank;
  name: string;
  nameEn: string;
  level: number;              // 족보 등급 (1-15, 높을수록 강함)
  baseChips: number;          // 기본 칩(점수)
  baseMultiplier: number;     // 기본 배율
  hitBonus: number;           // 안타 확률 보너스 (0.0 ~ 1.0)
  description: string;
  example: string;
}

// ========== 속성 데이터 ==========

export const ATTRIBUTES: Record<ActionAttribute, AttributeInfo> = {
  power: {
    id: 'power',
    name: '파워',
    nameEn: 'Power',
    emoji: '💥',
    color: '#DC2626', // 빨강
    description: '장타력을 상징하는 속성',
    bonusEffect: '장타(2루타 이상) 확률 증가, 타점 보너스',
  },
  contact: {
    id: 'contact',
    name: '컨택',
    nameEn: 'Contact',
    emoji: '🎯',
    color: '#2563EB', // 파랑
    description: '정확한 타격을 상징하는 속성',
    bonusEffect: '안타 확률 증가, 삼진 확률 감소',
  },
  speed: {
    id: 'speed',
    name: '스피드',
    nameEn: 'Speed',
    emoji: '⚡',
    color: '#16A34A', // 초록
    description: '빠른 발을 상징하는 속성',
    bonusEffect: '도루 성공률 증가, 진루 보너스',
  },
  eye: {
    id: 'eye',
    name: '선구안',
    nameEn: 'Eye',
    emoji: '👁️',
    color: '#CA8A04', // 노랑/금색
    description: '뛰어난 선구안을 상징하는 속성',
    bonusEffect: '볼넷 확률 증가, 투수 체력 소모 증가',
  },
};

// ========== 족보 데이터 ==========

export const HAND_RANKINGS: HandInfo[] = [
  // 기본 포커 족보 (레벨 1-9)
  {
    rank: 'high_card',
    name: '하이카드',
    nameEn: 'High Card',
    level: 1,
    baseChips: 5,
    baseMultiplier: 1,
    hitBonus: 0.0,
    description: '아무 조합도 없는 상태',
    example: '💥3, 🎯7, ⚡K, 👁️2, 💥9',
  },
  {
    rank: 'one_pair',
    name: '원페어',
    nameEn: 'One Pair',
    level: 2,
    baseChips: 10,
    baseMultiplier: 2,
    hitBonus: 0.05,
    description: '같은 숫자 2장',
    example: '💥7, 🎯7, ⚡3, 👁️K, 💥2',
  },
  {
    rank: 'two_pair',
    name: '투페어',
    nameEn: 'Two Pair',
    level: 3,
    baseChips: 20,
    baseMultiplier: 2,
    hitBonus: 0.10,
    description: '같은 숫자 2장이 2세트',
    example: '💥7, 🎯7, ⚡3, 👁️3, 💥K',
  },
  {
    rank: 'three_of_kind',
    name: '트리플',
    nameEn: 'Three of a Kind',
    level: 4,
    baseChips: 30,
    baseMultiplier: 3,
    hitBonus: 0.15,
    description: '같은 숫자 3장',
    example: '💥7, 🎯7, ⚡7, 👁️K, 💥2',
  },
  {
    rank: 'straight',
    name: '스트레이트',
    nameEn: 'Straight',
    level: 5,
    baseChips: 30,
    baseMultiplier: 4,
    hitBonus: 0.20,
    description: '연속된 숫자 5장',
    example: '💥3, 🎯4, ⚡5, 👁️6, 💥7',
  },
  {
    rank: 'flush',
    name: '플러시',
    nameEn: 'Flush',
    level: 6,
    baseChips: 35,
    baseMultiplier: 4,
    hitBonus: 0.25,
    description: '같은 속성 5장',
    example: '💥2, 💥5, 💥8, 💥J, 💥K',
  },
  {
    rank: 'full_house',
    name: '풀하우스',
    nameEn: 'Full House',
    level: 7,
    baseChips: 40,
    baseMultiplier: 4,
    hitBonus: 0.30,
    description: '트리플 + 원페어',
    example: '💥7, 🎯7, ⚡7, 👁️K, 💥K',
  },
  {
    rank: 'four_of_kind',
    name: '포카드',
    nameEn: 'Four of a Kind',
    level: 8,
    baseChips: 60,
    baseMultiplier: 7,
    hitBonus: 0.40,
    description: '같은 숫자 4장',
    example: '💥7, 🎯7, ⚡7, 👁️7, 💥K',
  },
  {
    rank: 'straight_flush',
    name: '스트레이트 플러시',
    nameEn: 'Straight Flush',
    level: 9,
    baseChips: 100,
    baseMultiplier: 8,
    hitBonus: 0.50,
    description: '같은 속성으로 연속된 숫자 5장',
    example: '💥3, 💥4, 💥5, 💥6, 💥7',
  },

  // 야구 전용 족보 (레벨 10-14)
  {
    rank: 'batting_eye',
    name: '배팅 아이',
    nameEn: 'Batting Eye',
    level: 10,
    baseChips: 45,
    baseMultiplier: 5,
    hitBonus: 0.35,
    description: '선구안(👁️) 카드 4장 이상',
    example: '👁️2, 👁️5, 👁️8, 👁️J, 💥3',
  },
  {
    rank: 'power_surge',
    name: '파워 서지',
    nameEn: 'Power Surge',
    level: 11,
    baseChips: 50,
    baseMultiplier: 6,
    hitBonus: 0.35,
    description: '파워(💥) 카드 3장 이상 + 숫자 합계 30 이상',
    example: '💥K, 💥Q, 💥J, 🎯2, ⚡3',
  },
  {
    rank: 'speed_star',
    name: '스피드 스타',
    nameEn: 'Speed Star',
    level: 12,
    baseChips: 55,
    baseMultiplier: 6,
    hitBonus: 0.40,
    description: '스피드(⚡) 카드로만 스트레이트',
    example: '⚡3, ⚡4, ⚡5, ⚡6, ⚡7',
  },
  {
    rank: 'contact_master',
    name: '컨택 마스터',
    nameEn: 'Contact Master',
    level: 13,
    baseChips: 65,
    baseMultiplier: 7,
    hitBonus: 0.45,
    description: '컨택(🎯) 카드로만 풀하우스',
    example: '🎯7, 🎯7, 🎯7, 🎯K, 🎯K',
  },
  {
    rank: 'perfect_swing',
    name: '퍼펙트 스윙',
    nameEn: 'Perfect Swing',
    level: 14,
    baseChips: 80,
    baseMultiplier: 8,
    hitBonus: 0.55,
    description: '파워, 컨택, 스피드, 선구안 각 1장 이상 + 같은 숫자 2장',
    example: '💥7, 🎯7, ⚡5, 👁️K, 💥3',
  },
];

// ========== 숫자 범위별 효과 ==========

export const VALUE_EFFECTS = {
  low: {
    range: [1, 2, 3, 4] as ActionValue[],
    name: '컨택 유리',
    description: '낮은 숫자는 컨택 판정에 유리',
    contactBonus: 0.05,
    powerPenalty: -0.05,
  },
  mid: {
    range: [5, 6, 7, 8, 9] as ActionValue[],
    name: '밸런스',
    description: '중간 숫자는 균형 잡힌 성능',
    contactBonus: 0,
    powerPenalty: 0,
  },
  high: {
    range: [10, 11, 12, 13] as ActionValue[],
    name: '파워 유리',
    description: '높은 숫자는 장타 판정에 유리',
    contactBonus: -0.05,
    powerBonus: 0.05,
  },
};

// ========== 52장 덱 생성 ==========

export function createActionDeck(): StatActionCard[] {
  const deck: StatActionCard[] = [];
  const attributes: ActionAttribute[] = ['power', 'contact', 'speed', 'eye'];
  const values: ActionValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

  let id = 0;
  for (const attribute of attributes) {
    for (const value of values) {
      deck.push({
        id: `action_${id++}`,
        attribute,
        value,
        selected: false,
      });
    }
  }

  return deck;
}

// ========== 전체 덱 데이터 (JSON 형태) ==========

export const ACTION_DECK_DATA = {
  metadata: {
    name: '스탯 기반 액션 덱',
    version: '1.0.0',
    totalCards: 52,
    attributes: 4,
    valuesPerAttribute: 13,
  },
  attributes: ATTRIBUTES,
  handRankings: HAND_RANKINGS,
  valueEffects: VALUE_EFFECTS,
  cards: createActionDeck(),
};

// ========== 유틸리티 함수 ==========

/** 숫자를 표시 문자로 변환 */
export function getValueDisplay(value: ActionValue): string {
  switch (value) {
    case 1: return 'A';
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    default: return value.toString();
  }
}

/** 속성 이모지 가져오기 */
export function getAttributeEmoji(attribute: ActionAttribute): string {
  return ATTRIBUTES[attribute].emoji;
}

/** 속성 색상 가져오기 */
export function getAttributeColor(attribute: ActionAttribute): string {
  return ATTRIBUTES[attribute].color;
}

/** 카드를 문자열로 표시 */
export function cardToString(card: StatActionCard): string {
  return `${getAttributeEmoji(card.attribute)}${getValueDisplay(card.value)}`;
}

/** 족보 정보 가져오기 */
export function getHandInfo(rank: ActionHandRank): HandInfo | undefined {
  return HAND_RANKINGS.find(h => h.rank === rank);
}

/** 트럼프 무늬를 속성으로 변환 (마이그레이션용) */
export function suitToAttribute(suit: 'spade' | 'heart' | 'diamond' | 'club'): ActionAttribute {
  const mapping: Record<string, ActionAttribute> = {
    spade: 'power',    // ♠ → 💥 파워
    heart: 'contact',  // ♥ → 🎯 컨택
    diamond: 'speed',  // ♦ → ⚡ 스피드
    club: 'eye',       // ♣ → 👁️ 선구안
  };
  return mapping[suit];
}

/** 속성을 트럼프 무늬로 변환 (호환용) */
export function attributeToSuit(attribute: ActionAttribute): 'spade' | 'heart' | 'diamond' | 'club' {
  const mapping: Record<ActionAttribute, 'spade' | 'heart' | 'diamond' | 'club'> = {
    power: 'spade',
    contact: 'heart',
    speed: 'diamond',
    eye: 'club',
  };
  return mapping[attribute];
}

export default ACTION_DECK_DATA;
