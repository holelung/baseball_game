import { PlayerCard, ActionCard, BaseState, ActionResult, ActionType } from './types';

/**
 * 빈 베이스 상태
 */
export function emptyBases(): BaseState {
  return {
    first: null,
    second: null,
    third: null,
  };
}

/**
 * 주자 진루 처리
 * @param bases 현재 베이스 상태
 * @param batter 타자
 * @param advanceCount 진루 수 (1=안타, 2=2루타, 3=3루타, 4=홈런)
 * @returns 득점 수와 새로운 베이스 상태
 */
export function advanceRunners(
  bases: BaseState,
  batter: PlayerCard,
  advanceCount: number
): { runsScored: number; newBases: BaseState } {
  let runsScored = 0;
  const runners: (PlayerCard | null)[] = [
    batter,           // 타자 (0번 = 홈)
    bases.first,      // 1루 주자
    bases.second,     // 2루 주자
    bases.third,      // 3루 주자
  ];

  // 새로운 베이스 상태 초기화
  const newBases: BaseState = {
    first: null,
    second: null,
    third: null,
  };

  // 각 주자를 진루시킴
  runners.forEach((runner, currentBase) => {
    if (!runner) return;
    
    const newBase = currentBase + advanceCount;
    
    if (newBase >= 4) {
      // 홈 도착 = 득점
      runsScored++;
    } else if (newBase === 1) {
      newBases.first = runner;
    } else if (newBase === 2) {
      newBases.second = runner;
    } else if (newBase === 3) {
      newBases.third = runner;
    }
  });

  return { runsScored, newBases };
}

/**
 * 볼넷 처리 (밀어내기)
 */
export function handleWalk(
  bases: BaseState,
  batter: PlayerCard
): { runsScored: number; newBases: BaseState } {
  let runsScored = 0;
  const newBases: BaseState = { ...bases };

  // 만루에서 볼넷 = 밀어내기 득점
  if (bases.first && bases.second && bases.third) {
    runsScored = 1;
    newBases.third = bases.second;
    newBases.second = bases.first;
    newBases.first = batter;
  } else if (bases.first && bases.second) {
    newBases.third = bases.second;
    newBases.second = bases.first;
    newBases.first = batter;
  } else if (bases.first) {
    newBases.second = bases.first;
    newBases.first = batter;
  } else {
    newBases.first = batter;
  }

  return { runsScored, newBases };
}

/**
 * 액션 카드 결과 처리
 */
export function resolveAction(
  action: ActionCard,
  batter: PlayerCard,
  bases: BaseState
): ActionResult {
  const actionHandlers: Record<ActionType, () => ActionResult> = {
    single: () => {
      const { runsScored, newBases } = advanceRunners(bases, batter, 1);
      return {
        runsScored,
        newBases,
        isOut: false,
        description: `${batter.name}의 안타! ${runsScored > 0 ? `${runsScored}점 득점!` : ''}`,
      };
    },
    double: () => {
      const { runsScored, newBases } = advanceRunners(bases, batter, 2);
      return {
        runsScored,
        newBases,
        isOut: false,
        description: `${batter.name}의 2루타! ${runsScored > 0 ? `${runsScored}점 득점!` : ''}`,
      };
    },
    triple: () => {
      const { runsScored, newBases } = advanceRunners(bases, batter, 3);
      return {
        runsScored,
        newBases,
        isOut: false,
        description: `${batter.name}의 3루타! ${runsScored > 0 ? `${runsScored}점 득점!` : ''}`,
      };
    },
    homerun: () => {
      const { runsScored, newBases } = advanceRunners(bases, batter, 4);
      return {
        runsScored,
        newBases,
        isOut: false,
        description: `🎉 ${batter.name}의 홈런! ${runsScored}점 득점!`,
      };
    },
    walk: () => {
      const { runsScored, newBases } = handleWalk(bases, batter);
      return {
        runsScored,
        newBases,
        isOut: false,
        description: `${batter.name} 볼넷으로 출루${runsScored > 0 ? ` (밀어내기 ${runsScored}점!)` : ''}`,
      };
    },
    groundout: () => ({
      runsScored: 0,
      newBases: bases,
      isOut: true,
      description: `${batter.name} 땅볼 아웃...`,
    }),
    flyout: () => ({
      runsScored: 0,
      newBases: bases,
      isOut: true,
      description: `${batter.name} 플라이 아웃...`,
    }),
    strikeout: () => ({
      runsScored: 0,
      newBases: bases,
      isOut: true,
      description: `${batter.name} 삼진...`,
    }),
  };

  return actionHandlers[action.type]();
}

/**
 * 현재 루상 주자 수 계산
 */
export function countRunners(bases: BaseState): number {
  let count = 0;
  if (bases.first) count++;
  if (bases.second) count++;
  if (bases.third) count++;
  return count;
}
