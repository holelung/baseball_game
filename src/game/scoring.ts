import { PlayerCard, BaseState, ActionResult, HandResult, HandRank, BaseballResult, PlayResult } from './types';

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
 * 현재 루상 주자 수 계산
 */
export function countRunners(bases: BaseState): number {
  let count = 0;
  if (bases.first) count++;
  if (bases.second) count++;
  if (bases.third) count++;
  return count;
}

// ========== 족보 → 야구 결과 매핑 ==========

/**
 * 족보에 따른 야구 결과 매핑
 */
const HAND_TO_BASEBALL: Record<HandRank, { result: BaseballResult; baseScore: number }> = {
  'high_card':       { result: 'out', baseScore: 0 },      // 하이카드 = 아웃
  'one_pair':        { result: 'single', baseScore: 10 },  // 원페어 = 1루타
  'two_pair':        { result: 'single', baseScore: 15 },  // 투페어 = 1루타 (보너스)
  'three_of_kind':   { result: 'double', baseScore: 20 },  // 트리플 = 2루타
  'straight':        { result: 'double', baseScore: 25 },  // 스트레이트 = 2루타 (보너스)
  'flush':           { result: 'triple', baseScore: 30 },  // 플러시 = 3루타
  'full_house':      { result: 'triple', baseScore: 40 },  // 풀하우스 = 3루타 (보너스)
  'four_of_kind':    { result: 'homerun', baseScore: 50 }, // 포카드 = 홈런
  'straight_flush':  { result: 'homerun', baseScore: 100 },// 스트레이트 플러시 = 홈런 (대보너스)
};

/**
 * 야구 결과에 따른 진루 수
 */
function getAdvanceCount(result: BaseballResult): number {
  switch (result) {
    case 'out': return 0;
    case 'single': return 1;
    case 'double': return 2;
    case 'triple': return 3;
    case 'homerun': return 4;
  }
}

/**
 * 야구 결과 이름
 */
function getResultName(result: BaseballResult): string {
  switch (result) {
    case 'out': return '아웃';
    case 'single': return '1루타';
    case 'double': return '2루타';
    case 'triple': return '3루타';
    case 'homerun': return '홈런';
  }
}

/**
 * 족보로 플레이 실행
 */
export function executePlay(
  handResult: HandResult,
  batter: PlayerCard,
  bases: BaseState
): PlayResult {
  const mapping = HAND_TO_BASEBALL[handResult.rank];
  const baseballResult = mapping.result;
  
  let runsScored = 0;
  let newBases = bases;
  const isOut = baseballResult === 'out';
  
  if (!isOut) {
    const advanceCount = getAdvanceCount(baseballResult);
    const advanceResult = advanceRunners(bases, batter, advanceCount);
    runsScored = advanceResult.runsScored;
    newBases = advanceResult.newBases;
  }
  
  // Point 계산: 기본 점수 × 배율 + 득점 보너스
  const basePoints = mapping.baseScore;
  const multiplier = handResult.multiplier;
  const runBonus = runsScored * 20; // 득점당 20점 보너스
  const pointsEarned = (basePoints * multiplier) + runBonus;
  
  // 설명 생성
  let description = '';
  if (isOut) {
    description = `${batter.name} - ${handResult.name}으로 아웃...`;
  } else if (baseballResult === 'homerun') {
    description = `🎉 ${batter.name}의 ${handResult.name}! ${getResultName(baseballResult)}! ${runsScored}점 득점! (+${pointsEarned}P)`;
  } else {
    description = `${batter.name}의 ${handResult.name}! ${getResultName(baseballResult)}!${runsScored > 0 ? ` ${runsScored}점 득점!` : ''} (+${pointsEarned}P)`;
  }
  
  return {
    baseballResult,
    handResult,
    runsScored,
    pointsEarned: isOut ? 0 : pointsEarned,
    description,
  };
}

/**
 * 족보 결과를 ActionResult로 변환 (기존 호환용)
 */
export function playResultToActionResult(
  playResult: PlayResult,
  batter: PlayerCard,
  bases: BaseState
): ActionResult {
  const advanceCount = getAdvanceCount(playResult.baseballResult);
  
  if (playResult.baseballResult === 'out') {
    return {
      runsScored: 0,
      newBases: bases,
      isOut: true,
      description: playResult.description,
      pointsEarned: 0,
    };
  }
  
  const { runsScored, newBases } = advanceRunners(bases, batter, advanceCount);
  
  return {
    runsScored,
    newBases,
    isOut: false,
    description: playResult.description,
    pointsEarned: playResult.pointsEarned,
  };
}
