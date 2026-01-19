import { PlayerCard, BaseState, ModeResult, BaseballResult, PlayResult, ScoreBreakdown } from './types';
import { MODE_INFO, checkSynergy } from './actionMode';

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
 */
export function advanceRunners(
  bases: BaseState,
  batter: PlayerCard,
  advanceCount: number
): { runsScored: number; newBases: BaseState; scoredRunners: PlayerCard[] } {
  let runsScored = 0;
  const scoredRunners: PlayerCard[] = [];
  const runners: (PlayerCard | null)[] = [
    batter,
    bases.first,
    bases.second,
    bases.third,
  ];

  const newBases: BaseState = {
    first: null,
    second: null,
    third: null,
  };

  runners.forEach((runner, currentBase) => {
    if (!runner) return;

    const newBase = currentBase + advanceCount;

    if (newBase >= 4) {
      runsScored++;
      scoredRunners.push(runner);
    } else if (newBase === 1) {
      newBases.first = runner;
    } else if (newBase === 2) {
      newBases.second = runner;
    } else if (newBase === 3) {
      newBases.third = runner;
    }
  });

  return { runsScored, newBases, scoredRunners };
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
 * 장타 확률로 결과 업그레이드
 */
function tryUpgradeResult(
  baseResult: BaseballResult,
  extraBaseChance: number,
  isPowerSwing: boolean
): BaseballResult {
  if (baseResult === 'out') return 'out';

  const roll = Math.random();

  if (isPowerSwing) {
    // 파워 스윙: 홈런 기회
    if (roll < extraBaseChance * 0.5) return 'homerun';
    if (roll < extraBaseChance) return 'triple';
    return baseResult;
  }

  // 일반 장타 업그레이드
  if (roll < extraBaseChance) {
    switch (baseResult) {
      case 'single': return 'double';
      case 'double': return 'triple';
      case 'triple': return 'homerun';
      default: return baseResult;
    }
  }

  return baseResult;
}

/**
 * 모드 기반 플레이 실행
 */
export function executePlay(
  modeResult: ModeResult,
  batter: PlayerCard,
  bases: BaseState
): PlayResult {
  const modeInfo = MODE_INFO[modeResult.mode];

  // 시너지 체크
  const synergy = checkSynergy(batter.tags, modeResult.mode);

  // 안타 확률 = 선수 타율 + 모드 보너스 + 시너지 보너스
  let hitProbability = batter.battingAverage + modeResult.hitBonus;
  if (synergy.hasSynergy) {
    hitProbability += synergy.bonus;
  }

  // 확률 판정
  const roll = Math.random();
  const isHit = hitProbability >= 1.0 || roll < hitProbability;
  const wasLucky = hitProbability < 1.0 && isHit;

  // 결과 결정
  let baseballResult: BaseballResult;
  if (!isHit) {
    baseballResult = 'out';
  } else {
    // 기본 결과
    baseballResult = 'single';

    // 모드에 따른 기본 결과
    if (modeResult.mode === 'power_swing') {
      baseballResult = 'single'; // 기본은 1루타, 장타 확률로 업그레이드
    }

    // 장타 확률로 업그레이드 시도
    const effectiveExtraBaseChance = modeResult.extraBaseChance + (synergy.hasSynergy ? 0.1 : 0);
    baseballResult = tryUpgradeResult(
      baseballResult,
      effectiveExtraBaseChance,
      modeResult.mode === 'power_swing'
    );
  }

  // 스피드 플레이 특수 효과: 안타 시 추가 진루
  let advanceCount = getAdvanceCount(baseballResult);
  if (modeResult.mode === 'speed_play' && baseballResult !== 'out' && baseballResult !== 'homerun') {
    if (synergy.hasSynergy || Math.random() < 0.5) {
      advanceCount = Math.min(advanceCount + 1, 3);
      // 결과 텍스트 업데이트
      if (advanceCount === 2) baseballResult = 'double';
      if (advanceCount === 3) baseballResult = 'triple';
    }
  }

  // 진루 처리
  let runsScored = 0;
  if (!isHit) {
    // 아웃
  } else {
    const advanceResult = advanceRunners(bases, batter, advanceCount);
    runsScored = advanceResult.runsScored;
  }

  // 포인트 계산 (단순화)
  const cardChips = modeResult.cardChips;
  const modeBonus = modeInfo.bonusPoints;
  const synergyBonus = synergy.hasSynergy ? 20 : 0;
  const runBonus = runsScored * 20;

  const basePoints = cardChips + modeBonus + synergyBonus;
  const pointsEarned = isHit ? basePoints + runBonus : 0;

  const scoreBreakdown: ScoreBreakdown = {
    cardChips,
    modeBonus,
    synergyBonus,
    runBonus,
    finalScore: pointsEarned,
  };

  // 설명 생성
  const probPercent = Math.min(Math.round(hitProbability * 100), 100);
  let description = '';

  if (!isHit) {
    description = `${batter.name} - ${modeResult.name} (${probPercent}%) 아웃...`;
  } else {
    const luckyText = wasLucky ? ' (Lucky!)' : '';
    const synergyText = synergy.hasSynergy ? ` [${synergy.description}]` : '';
    description = `${batter.name}의 ${modeResult.name}!${luckyText} ${getResultName(baseballResult)}!${synergyText}`;
    if (runsScored > 0) {
      description += ` ${runsScored}점 득점!`;
    }
    description += ` (+${pointsEarned}P)`;
  }

  return {
    baseballResult,
    modeResult,
    runsScored,
    pointsEarned,
    description,
    hitProbability,
    wasLucky,
    hasSynergy: synergy.hasSynergy,
    synergyDescription: synergy.hasSynergy ? synergy.description : undefined,
    scoreBreakdown,
  };
}
