import { ActionCard, ActionMode, ModeResult, StatCount } from './types';

/**
 * 6종 액션 모드 정보
 */
export const MODE_INFO: Record<ActionMode, {
  name: string;
  description: string;
  hitBonus: number;
  extraBaseChance: number;
  bonusPoints: number;
}> = {
  'power_swing': {
    name: '파워 스윙',
    description: '💪 파워 3장 이상 - 장타를 노린다!',
    hitBonus: 0.05,
    extraBaseChance: 0.4,  // 장타 확률 40%
    bonusPoints: 30,
  },
  'contact_hit': {
    name: '정확한 타격',
    description: '🎯 컨택 3장 이상 - 확실하게 맞춘다!',
    hitBonus: 0.25,
    extraBaseChance: 0.1,  // 장타 확률 10%
    bonusPoints: 20,
  },
  'speed_play': {
    name: '스피드 플레이',
    description: '👟 스피드 3장 이상 - 발로 뛴다!',
    hitBonus: 0.15,
    extraBaseChance: 0.2,
    bonusPoints: 25,
  },
  'eye_mode': {
    name: '선구안 모드',
    description: '👀 선구안 3장 이상 - 볼을 잘 본다!',
    hitBonus: 0.20,
    extraBaseChance: 0.15,
    bonusPoints: 20,
  },
  'balanced': {
    name: '밸런스 타격',
    description: '2속성 각 2장 이상 - 균형잡힌 타격!',
    hitBonus: 0.15,
    extraBaseChance: 0.25,
    bonusPoints: 25,
  },
  'normal': {
    name: '일반 타격',
    description: '조건 미충족 - 선수 능력에 의존',
    hitBonus: 0.0,
    extraBaseChance: 0.1,
    bonusPoints: 10,
  },
};

/**
 * 선택한 카드들의 속성별 개수를 집계
 */
export function countStats(cards: ActionCard[]): StatCount {
  const count: StatCount = { power: 0, contact: 0, speed: 0, eye: 0 };

  for (const card of cards) {
    count[card.stat]++;
  }

  return count;
}

/**
 * 선택한 카드들의 숫자 합계 계산
 * A(1)는 14로 계산
 */
export function calculateCardChips(cards: ActionCard[]): number {
  return cards.reduce((sum, card) => {
    const chipValue = card.rank === 1 ? 14 : card.rank;
    return sum + chipValue;
  }, 0);
}

/**
 * 속성 집계로 액션 모드 판정
 */
export function determineMode(statCount: StatCount): ActionMode {
  const { power, contact, speed, eye } = statCount;

  // 우선순위: 단일 속성 3장 이상 > 밸런스 > 일반

  // 1. 파워 스윙 (💪 3장 이상)
  if (power >= 3) return 'power_swing';

  // 2. 정확한 타격 (🎯 3장 이상)
  if (contact >= 3) return 'contact_hit';

  // 3. 스피드 플레이 (👟 3장 이상)
  if (speed >= 3) return 'speed_play';

  // 4. 선구안 모드 (👀 3장 이상)
  if (eye >= 3) return 'eye_mode';

  // 5. 밸런스 (2속성 각 2장 이상)
  const statValues = [power, contact, speed, eye];
  const twoOrMore = statValues.filter(v => v >= 2).length;
  if (twoOrMore >= 2) return 'balanced';

  // 6. 일반
  return 'normal';
}

/**
 * 선택된 카드들로 모드 결과 생성
 */
export function evaluateActionMode(cards: ActionCard[]): ModeResult {
  if (cards.length === 0) {
    return {
      mode: 'normal',
      name: MODE_INFO['normal'].name,
      description: MODE_INFO['normal'].description,
      cards: [],
      cardChips: 0,
      statCount: { power: 0, contact: 0, speed: 0, eye: 0 },
      hitBonus: 0,
      extraBaseChance: 0,
    };
  }

  const statCount = countStats(cards);
  const mode = determineMode(statCount);
  const modeInfo = MODE_INFO[mode];
  const cardChips = calculateCardChips(cards);

  return {
    mode,
    name: modeInfo.name,
    description: modeInfo.description,
    cards,
    cardChips,
    statCount,
    hitBonus: modeInfo.hitBonus,
    extraBaseChance: modeInfo.extraBaseChance,
    specialEffect: mode !== 'normal' ? getSpecialEffect(mode) : undefined,
  };
}

/**
 * 모드별 특수 효과 설명
 */
function getSpecialEffect(mode: ActionMode): string | undefined {
  switch (mode) {
    case 'power_swing':
      return '장타 확률 상승, 삼진 위험';
    case 'contact_hit':
      return '안타 확률 대폭 상승';
    case 'speed_play':
      return '안타 시 추가 진루 기회';
    case 'eye_mode':
      return '볼넷 확률 상승';
    case 'balanced':
      return '균형잡힌 결과';
    default:
      return undefined;
  }
}

/**
 * 선수 태그와 모드의 시너지 체크
 */
export function checkSynergy(
  playerTags: string[],
  mode: ActionMode
): { hasSynergy: boolean; bonus: number; description: string } {
  const synergyMap: Record<ActionMode, { tag: string; bonus: number; desc: string }> = {
    'power_swing': { tag: 'power', bonus: 0.15, desc: '파워 시너지! 홈런 확률 UP' },
    'contact_hit': { tag: 'contact', bonus: 0.10, desc: '컨택 시너지! 안타 거의 확정' },
    'speed_play': { tag: 'speed', bonus: 0.10, desc: '스피드 시너지! 진루 +1' },
    'eye_mode': { tag: 'eye', bonus: 0.10, desc: '선구안 시너지! 출루 확률 UP' },
    'balanced': { tag: '', bonus: 0, desc: '' },  // 밸런스는 시너지 없음
    'normal': { tag: '', bonus: 0, desc: '' },
  };

  const synergy = synergyMap[mode];

  if (synergy.tag && playerTags.includes(synergy.tag)) {
    return {
      hasSynergy: true,
      bonus: synergy.bonus,
      description: synergy.desc,
    };
  }

  return { hasSynergy: false, bonus: 0, description: '' };
}

/**
 * 모드에 따른 기본 야구 결과 결정
 */
export function getModeBaseResult(mode: ActionMode): 'single' | 'double' | 'triple' | 'homerun' {
  switch (mode) {
    case 'power_swing':
      return 'double';  // 기본 2루타, 장타 확률로 업그레이드
    case 'contact_hit':
      return 'single';  // 기본 1루타
    case 'speed_play':
      return 'single';  // 기본 1루타, 추가 진루
    case 'eye_mode':
      return 'single';  // 기본 1루타
    case 'balanced':
      return 'single';  // 기본 1루타
    case 'normal':
      return 'single';  // 기본 1루타
  }
}
