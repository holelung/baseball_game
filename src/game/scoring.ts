import { PlayerCard, BaseState, ActionResult, HandResult, ActionHandRank, BaseballResult, PlayResult } from './types';

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
 * @returns 득점 수, 새로운 베이스 상태, 득점한 주자들
 */
export function advanceRunners(
  bases: BaseState,
  batter: PlayerCard,
  advanceCount: number
): { runsScored: number; newBases: BaseState; scoredRunners: PlayerCard[] } {
  let runsScored = 0;
  const scoredRunners: PlayerCard[] = [];
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

// ========== 족보 → 야구 결과 매핑 (28종) ==========

/**
 * 족보에 따른 야구 결과 매핑
 */
const HAND_TO_BASEBALL: Record<ActionHandRank, { result: BaseballResult; baseScore: number }> = {
  // 기본 포커 족보 (Lv.1-9)
  'high_card':       { result: 'out', baseScore: 5 },       // 하이카드 = 아웃
  'one_pair':        { result: 'single', baseScore: 10 },   // 원페어 = 1루타
  'two_pair':        { result: 'single', baseScore: 20 },   // 투페어 = 1루타
  'three_of_kind':   { result: 'double', baseScore: 30 },   // 트리플 = 2루타
  'straight':        { result: 'double', baseScore: 30 },   // 스트레이트 = 2루타
  'flush':           { result: 'triple', baseScore: 35 },   // 플러시 = 3루타
  'full_house':      { result: 'triple', baseScore: 40 },   // 풀하우스 = 3루타
  'four_of_kind':    { result: 'homerun', baseScore: 60 },  // 포카드 = 홈런
  'straight_flush':  { result: 'homerun', baseScore: 100 }, // 스트레이트 플러시 = 홈런

  // 속성별 원페어 (Lv.10-13)
  'power_pair':      { result: 'single', baseScore: 15 },   // 파워 페어 = 1루타
  'contact_pair':    { result: 'single', baseScore: 15 },   // 컨택 페어 = 1루타
  'speed_pair':      { result: 'single', baseScore: 15 },   // 스피드 페어 = 1루타
  'eye_pair':        { result: 'single', baseScore: 15 },   // 선구안 페어 = 1루타

  // 속성별 트리플 (Lv.14-17)
  'power_triple':    { result: 'double', baseScore: 40 },   // 파워 트리플 = 2루타
  'contact_triple':  { result: 'single', baseScore: 40 },   // 컨택 트리플 = 1루타 (확정!)
  'speed_triple':    { result: 'double', baseScore: 40 },   // 스피드 트리플 = 2루타 (+진루)
  'eye_triple':      { result: 'single', baseScore: 40 },   // 선구안 트리플 = 1루타

  // 이중 속성 투페어 (Lv.18-23)
  'power_contact':   { result: 'single', baseScore: 30 },   // 파워컨택 = 1루타
  'power_speed':     { result: 'double', baseScore: 30 },   // 파워스피드 = 2루타
  'power_eye':       { result: 'single', baseScore: 30 },   // 파워아이 = 1루타
  'contact_speed':   { result: 'single', baseScore: 30 },   // 컨택스피드 = 1루타
  'contact_eye':     { result: 'single', baseScore: 30 },   // 컨택아이 = 1루타
  'speed_eye':       { result: 'double', baseScore: 30 },   // 스피드아이 = 2루타 (2루 스타트)

  // 상위 야구 전용 족보 (Lv.24-28)
  'batting_eye':     { result: 'single', baseScore: 45 },   // 배팅 아이 = 1루타
  'power_surge':     { result: 'homerun', baseScore: 50 },  // 파워 서지 = 홈런
  'speed_star':      { result: 'triple', baseScore: 55 },   // 스피드 스타 = 3루타
  'contact_master':  { result: 'single', baseScore: 65 },   // 컨택 마스터 = 1루타 (확정)
  'perfect_swing':   { result: 'homerun', baseScore: 80 },  // 퍼펙트 스윙 = 홈런
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

// 안타 확정 족보들
const GUARANTEED_HIT_HANDS: ActionHandRank[] = ['contact_triple', 'contact_master'];

// 결과 업그레이드 (perfect_swing 특수효과)
function upgradeResult(result: BaseballResult): BaseballResult {
  switch (result) {
    case 'out': return 'single';
    case 'single': return 'double';
    case 'double': return 'triple';
    case 'triple': return 'homerun';
    case 'homerun': return 'homerun';
  }
}

/**
 * 확률 기반 플레이 실행
 * 안타 확률 = 선수 타율 + 족보 hitBonus
 * 확률 >= 1.0 이면 확정 안타
 * 특수 효과 처리 포함
 */
export function executePlay(
  handResult: HandResult,
  batter: PlayerCard,
  bases: BaseState
): PlayResult {
  const mapping = HAND_TO_BASEBALL[handResult.rank];

  // 확률 계산: 선수 타율 + 족보 보너스
  let hitProbability = batter.battingAverage + handResult.hitBonus;

  // 안타 확정 족보 체크
  const isGuaranteedHit = GUARANTEED_HIT_HANDS.includes(handResult.rank);
  if (isGuaranteedHit) {
    hitProbability = 1.0;
  }

  // 확률 판정 (1.0 이상이면 확정)
  const roll = Math.random();
  const isHit = hitProbability >= 1.0 || roll < hitProbability;
  const wasLucky = hitProbability < 1.0 && isHit;

  // 안타 실패 시 아웃
  let baseballResult: BaseballResult;
  if (!isHit) {
    baseballResult = 'out';
  } else {
    baseballResult = mapping.result === 'out' ? 'single' : mapping.result;
  }

  // 퍼펙트 스윙 특수효과: 결과 한 단계 업그레이드
  if (handResult.rank === 'perfect_swing' && baseballResult !== 'out') {
    baseballResult = upgradeResult(baseballResult);
  }

  let runsScored = 0;
  const isOut = baseballResult === 'out';

  if (!isOut) {
    let advanceCount = getAdvanceCount(baseballResult);

    // 스피드 트리플/파워스피드 특수효과: 진루 +1
    if (handResult.rank === 'speed_triple' || handResult.rank === 'power_speed') {
      advanceCount = Math.min(advanceCount + 1, 4);
    }

    // 스피드아이 특수효과: 출루 시 2루 스타트 (1루타가 2루타 효과)
    if (handResult.rank === 'speed_eye' && advanceCount === 1) {
      advanceCount = 2;
    }

    const advanceResult = advanceRunners(bases, batter, advanceCount);
    runsScored = advanceResult.runsScored;
  }

  // Point 계산
  let basePoints = isOut ? 0 : mapping.baseScore;
  const multiplier = handResult.multiplier;
  const runBonus = runsScored * 20;
  // 확률 1.0 초과 시 추가 보너스
  const overflowBonus = hitProbability > 1.0 ? Math.floor((hitProbability - 1.0) * 50) : 0;

  // 파워아이 특수효과: 홈런 시 포인트 1.5배
  let pointMultiplier = 1;
  if (handResult.rank === 'power_eye' && baseballResult === 'homerun') {
    pointMultiplier = 1.5;
  }

  const pointsEarned = Math.floor(((basePoints * multiplier) + runBonus + overflowBonus) * pointMultiplier);

  // 설명 생성
  const probPercent = Math.min(Math.round(hitProbability * 100), 100);
  let description = '';

  // 특수효과 텍스트
  const specialText = handResult.specialEffect ? ` [${handResult.specialEffect}]` : '';

  if (isOut) {
    description = `${batter.name} - ${handResult.name} (${probPercent}%) 아웃...`;
  } else if (baseballResult === 'homerun') {
    description = `🎉 ${batter.name}의 ${handResult.name}! (${probPercent}%) ${getResultName(baseballResult)}! ${runsScored}점 득점! (+${pointsEarned}P)${specialText}`;
  } else {
    const luckyText = wasLucky ? ' (Lucky!)' : '';
    description = `${batter.name}의 ${handResult.name}! (${probPercent}%)${luckyText} ${getResultName(baseballResult)}!${runsScored > 0 ? ` ${runsScored}점 득점!` : ''} (+${pointsEarned}P)${specialText}`;
  }

  return {
    baseballResult,
    handResult,
    runsScored,
    pointsEarned: isOut ? 0 : pointsEarned,
    description,
    hitProbability,
    wasLucky,
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
