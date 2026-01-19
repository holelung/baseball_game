import { AbilityType, AbilityInfo, BaseState, BaseballResult } from './types';

/**
 * 능력 정보 정의
 */
export const ABILITY_INFO: Record<AbilityType, AbilityInfo> = {
  clutch: {
    type: 'clutch',
    name: '결정력',
    description: '2사 상황에서 안타 확률 +15%',
    icon: '🔥',
  },
  leadoff: {
    type: 'leadoff',
    name: '선두타자',
    description: '이닝 첫 타석 출루 시 추가 진루',
    icon: '🚀',
  },
  cleanup: {
    type: 'cleanup',
    name: '클린업',
    description: '주자가 있을 때 장타 확률 +15%',
    icon: '💪',
  },
  speedster: {
    type: 'speedster',
    name: '쾌속',
    description: '1루타 시 50% 확률로 2루타',
    icon: '⚡',
  },
  run_producer: {
    type: 'run_producer',
    name: '타점 제조기',
    description: '타점 획득 시 포인트 1.5배',
    icon: '💰',
  },
  contact_master: {
    type: 'contact_master',
    name: '안타 장인',
    description: '아웃 시 20% 확률로 내야안타',
    icon: '🎯',
  },
  power_hitter: {
    type: 'power_hitter',
    name: '장타자',
    description: '안타 시 장타 확률 +20%',
    icon: '💥',
  },
  patient: {
    type: 'patient',
    name: '인내심',
    description: '일반 모드에서도 안타 확률 +10%',
    icon: '👀',
  },
  hot_streak: {
    type: 'hot_streak',
    name: '연속 안타',
    description: '직전 안타 시 이번 타석 +15%',
    icon: '🔥',
  },
};

/**
 * 게임 상황 컨텍스트
 */
export interface GameContext {
  outs: number;
  isFirstAtBat: boolean;
  bases: BaseState;
  lastAtBatWasHit?: boolean;  // 직전 타석 안타 여부 (hot_streak용)
}

/**
 * 능력 효과 결과
 */
export interface AbilityEffect {
  hitBonusAdd: number;           // 안타 확률 추가
  extraBaseChanceAdd: number;    // 장타 확률 추가
  pointsMultiplier: number;      // 포인트 배율
  canSaveFromOut: boolean;       // 아웃에서 구제 가능 (contact_master)
  extraAdvance: boolean;         // 추가 진루 (leadoff, speedster)
  triggered: boolean;            // 능력 발동 여부
  description: string;           // 발동 설명
}

/**
 * 주자가 있는지 확인
 */
function hasRunners(bases: BaseState): boolean {
  return bases.first !== null || bases.second !== null || bases.third !== null;
}

/**
 * 득점권에 주자가 있는지 확인 (2루 또는 3루)
 */
function hasRunnersInScoringPosition(bases: BaseState): boolean {
  return bases.second !== null || bases.third !== null;
}

/**
 * 능력 발동 조건 체크 및 효과 계산 (타격 전)
 */
export function checkAbilityBeforeHit(
  ability: AbilityType | undefined,
  context: GameContext,
  isNormalMode: boolean
): AbilityEffect {
  const defaultEffect: AbilityEffect = {
    hitBonusAdd: 0,
    extraBaseChanceAdd: 0,
    pointsMultiplier: 1,
    canSaveFromOut: false,
    extraAdvance: false,
    triggered: false,
    description: '',
  };

  if (!ability) return defaultEffect;

  const info = ABILITY_INFO[ability];

  switch (ability) {
    case 'clutch':
      // 2사 상황에서 안타 확률 +15%
      if (context.outs === 2) {
        return {
          ...defaultEffect,
          hitBonusAdd: 0.15,
          triggered: true,
          description: `${info.icon} ${info.name} 발동! 2사 상황에서 안타 확률 +15%`,
        };
      }
      break;

    case 'cleanup':
      // 주자가 있을 때 장타 확률 +15%
      if (hasRunners(context.bases)) {
        return {
          ...defaultEffect,
          extraBaseChanceAdd: 0.15,
          triggered: true,
          description: `${info.icon} ${info.name} 발동! 주자 상황에서 장타 확률 +15%`,
        };
      }
      break;

    case 'patient':
      // 일반 모드에서도 안타 확률 +10%
      if (isNormalMode) {
        return {
          ...defaultEffect,
          hitBonusAdd: 0.10,
          triggered: true,
          description: `${info.icon} ${info.name} 발동! 인내심으로 안타 확률 +10%`,
        };
      }
      break;

    case 'hot_streak':
      // 직전 타석 안타 시 이번 타석 +15%
      if (context.lastAtBatWasHit) {
        return {
          ...defaultEffect,
          hitBonusAdd: 0.15,
          triggered: true,
          description: `${info.icon} ${info.name} 발동! 연속 안타 도전! +15%`,
        };
      }
      break;

    case 'power_hitter':
      // 항상 장타 확률 +20%
      return {
        ...defaultEffect,
        extraBaseChanceAdd: 0.20,
        triggered: true,
        description: `${info.icon} ${info.name} 발동! 장타 확률 +20%`,
      };

    case 'contact_master':
      // 아웃 시 구제 가능
      return {
        ...defaultEffect,
        canSaveFromOut: true,
        triggered: false, // 실제 아웃 시에만 발동 체크
        description: '',
      };

    case 'run_producer':
      // 타점 시 포인트 1.5배 (득점권에 주자가 있어야 의미)
      if (hasRunnersInScoringPosition(context.bases)) {
        return {
          ...defaultEffect,
          pointsMultiplier: 1.5,
          triggered: true,
          description: `${info.icon} ${info.name} 대기 중! 타점 시 포인트 1.5배`,
        };
      }
      break;

    case 'leadoff':
    case 'speedster':
      // 안타 후에 발동 체크
      break;
  }

  return defaultEffect;
}

/**
 * 능력 발동 체크 (타격 후)
 */
export function checkAbilityAfterHit(
  ability: AbilityType | undefined,
  context: GameContext,
  baseballResult: BaseballResult,
  runsScored: number
): AbilityEffect {
  const defaultEffect: AbilityEffect = {
    hitBonusAdd: 0,
    extraBaseChanceAdd: 0,
    pointsMultiplier: 1,
    canSaveFromOut: false,
    extraAdvance: false,
    triggered: false,
    description: '',
  };

  if (!ability) return defaultEffect;

  const info = ABILITY_INFO[ability];

  switch (ability) {
    case 'leadoff':
      // 이닝 첫 타석 출루 시 추가 진루
      if (context.isFirstAtBat && baseballResult !== 'out' && baseballResult !== 'homerun') {
        return {
          ...defaultEffect,
          extraAdvance: true,
          triggered: true,
          description: `${info.icon} ${info.name} 발동! 선두타자 출루로 추가 진루!`,
        };
      }
      break;

    case 'speedster':
      // 1루타 시 50% 확률로 2루타
      if (baseballResult === 'single' && Math.random() < 0.5) {
        return {
          ...defaultEffect,
          extraAdvance: true,
          triggered: true,
          description: `${info.icon} ${info.name} 발동! 쾌속 주루로 2루까지!`,
        };
      }
      break;

    case 'run_producer':
      // 실제 타점이 있을 때 포인트 1.5배
      if (runsScored > 0) {
        return {
          ...defaultEffect,
          pointsMultiplier: 1.5,
          triggered: true,
          description: `${info.icon} ${info.name} 발동! ${runsScored}타점으로 포인트 1.5배!`,
        };
      }
      break;

    case 'contact_master':
      // 아웃 판정 시 20% 확률로 내야안타
      if (baseballResult === 'out' && Math.random() < 0.2) {
        return {
          ...defaultEffect,
          triggered: true,
          description: `${info.icon} ${info.name} 발동! 집념의 내야안타!`,
        };
      }
      break;
  }

  return defaultEffect;
}

/**
 * 능력 발동 시 추가 포인트 계산
 */
export function calculateAbilityBonus(
  ability: AbilityType | undefined,
  triggered: boolean
): number {
  if (!ability || !triggered) return 0;

  // 능력 발동 시 기본 15포인트 보너스
  return 15;
}
