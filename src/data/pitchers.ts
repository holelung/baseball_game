/**
 * 투수 시스템
 * 각 스테이지마다 5명의 투수 (선발 3명 + 불펜 1명 + 마무리 1명)
 * 4번, 5번 투수는 디버프를 가짐
 */

// ========== 디버프 타입 정의 ==========

export type DebuffType =
  // 카드 방해형
  | 'hand_reduce_1'     // 핸드 8장 → 7장
  | 'hand_reduce_2'     // 핸드 8장 → 6장
  | 'card_seal_1'       // 매 타석 랜덤 1장 봉인
  | 'card_seal_2'       // 매 타석 랜덤 2장 봉인
  // 모드 봉쇄형 (6종 모드 시스템용)
  | 'block_power'       // 파워 스윙 모드 사용 불가
  | 'block_contact'     // 정확한 타격 모드 사용 불가
  | 'block_speed'       // 스피드 플레이 모드 사용 불가
  | 'block_eye'         // 선구안 모드 사용 불가
  | 'block_balanced'    // 밸런스 모드 사용 불가
  // 시스템 제한형
  | 'discard_reduce_1'  // 버리기 3회 → 2회
  | 'discard_reduce_2'  // 버리기 3회 → 1회
  | 'select_reduce_1'   // 최대 선택 5장 → 4장
  | 'select_reduce_2'   // 최대 선택 5장 → 3장
  // 수치 약화형
  | 'hit_reduce_10'     // 안타 확률 -10%
  | 'hit_reduce_20'     // 안타 확률 -20%
  | 'bonus_reduce'      // 모드 보너스 포인트 -50%
  // 속성 약화형
  | 'power_nerf'        // 파워 카드 모드 기여도 -1 (3장 필요 → 4장)
  | 'contact_nerf'      // 컨택 카드 모드 기여도 -1
  | 'speed_nerf'        // 스피드 카드 모드 기여도 -1
  | 'eye_nerf'          // 선구안 카드 모드 기여도 -1
  // 특수형
  | 'synergy_block'     // 시너지 발동 불가
  | 'ability_block';    // 선수 고유 능력 발동 불가

// ========== 디버프 정보 ==========

export interface DebuffInfo {
  type: DebuffType;
  name: string;
  description: string;
  icon: string;
  severity: 'mild' | 'moderate' | 'severe';  // 강도
}

export const DEBUFF_INFO: Record<DebuffType, DebuffInfo> = {
  // 카드 방해형
  hand_reduce_1: {
    type: 'hand_reduce_1',
    name: '봉쇄',
    description: '핸드 8장 → 7장',
    icon: '🃏',
    severity: 'moderate',
  },
  hand_reduce_2: {
    type: 'hand_reduce_2',
    name: '압박',
    description: '핸드 8장 → 6장',
    icon: '🃏',
    severity: 'severe',
  },
  card_seal_1: {
    type: 'card_seal_1',
    name: '교란',
    description: '매 타석 랜덤 1장 봉인',
    icon: '🔒',
    severity: 'moderate',
  },
  card_seal_2: {
    type: 'card_seal_2',
    name: '혼란',
    description: '매 타석 랜덤 2장 봉인',
    icon: '🔒',
    severity: 'severe',
  },
  // 모드 봉쇄형
  block_power: {
    type: 'block_power',
    name: '파워 봉쇄',
    description: '파워 스윙 모드 사용 불가',
    icon: '🚫💪',
    severity: 'moderate',
  },
  block_contact: {
    type: 'block_contact',
    name: '컨택 봉쇄',
    description: '정확한 타격 모드 사용 불가',
    icon: '🚫🎯',
    severity: 'moderate',
  },
  block_speed: {
    type: 'block_speed',
    name: '스피드 봉쇄',
    description: '스피드 플레이 모드 사용 불가',
    icon: '🚫👟',
    severity: 'moderate',
  },
  block_eye: {
    type: 'block_eye',
    name: '선구안 봉쇄',
    description: '선구안 모드 사용 불가',
    icon: '🚫👀',
    severity: 'moderate',
  },
  block_balanced: {
    type: 'block_balanced',
    name: '밸런스 봉쇄',
    description: '밸런스 모드 사용 불가',
    icon: '🚫⚖️',
    severity: 'moderate',
  },
  // 시스템 제한형
  discard_reduce_1: {
    type: 'discard_reduce_1',
    name: '속공',
    description: '버리기 3회 → 2회',
    icon: '🔄',
    severity: 'moderate',
  },
  discard_reduce_2: {
    type: 'discard_reduce_2',
    name: '완봉',
    description: '버리기 3회 → 1회',
    icon: '🔄',
    severity: 'severe',
  },
  select_reduce_1: {
    type: 'select_reduce_1',
    name: '수비',
    description: '최대 선택 5장 → 4장',
    icon: '✋',
    severity: 'moderate',
  },
  select_reduce_2: {
    type: 'select_reduce_2',
    name: '철벽',
    description: '최대 선택 5장 → 3장',
    icon: '✋',
    severity: 'severe',
  },
  // 수치 약화형
  hit_reduce_10: {
    type: 'hit_reduce_10',
    name: '제구왕',
    description: '안타 확률 -10%',
    icon: '📉',
    severity: 'moderate',
  },
  hit_reduce_20: {
    type: 'hit_reduce_20',
    name: '탈삼진왕',
    description: '안타 확률 -20%',
    icon: '📉',
    severity: 'severe',
  },
  bonus_reduce: {
    type: 'bonus_reduce',
    name: '보너스 억제',
    description: '모드 보너스 포인트 -50%',
    icon: '💔',
    severity: 'moderate',
  },
  // 속성 약화형
  power_nerf: {
    type: 'power_nerf',
    name: '파워 킬러',
    description: '파워 모드 활성화에 4장 필요',
    icon: '⬇️💪',
    severity: 'moderate',
  },
  contact_nerf: {
    type: 'contact_nerf',
    name: '컨택 킬러',
    description: '컨택 모드 활성화에 4장 필요',
    icon: '⬇️🎯',
    severity: 'moderate',
  },
  speed_nerf: {
    type: 'speed_nerf',
    name: '스피드 킬러',
    description: '스피드 모드 활성화에 4장 필요',
    icon: '⬇️👟',
    severity: 'moderate',
  },
  eye_nerf: {
    type: 'eye_nerf',
    name: '선구안 킬러',
    description: '선구안 모드 활성화에 4장 필요',
    icon: '⬇️👀',
    severity: 'moderate',
  },
  // 특수형
  synergy_block: {
    type: 'synergy_block',
    name: '시너지 차단',
    description: '선수-모드 시너지 발동 불가',
    icon: '💫',
    severity: 'moderate',
  },
  ability_block: {
    type: 'ability_block',
    name: '능력 봉인',
    description: '선수 고유 능력 발동 불가',
    icon: '⛔',
    severity: 'severe',
  },
};

// ========== 투수 인터페이스 ==========

import { Pitcher as BasePitcher, PitcherType } from '../game/types';

// 디버프 포함 확장 인터페이스 (나중에 디버프 적용 시 사용)
export interface PitcherWithDebuff extends BasePitcher {
  debuffs: DebuffType[];
  icon?: string;
}

// ========== 선발 투수 (디버프 없음) ==========
// 목표 포인트: 약 5이닝(4~6이닝)에 강판되도록 설계
// 이닝당 평균 30-50P 획득 가정

export const starterPitchers: PitcherWithDebuff[] = [
  {
    id: 'starter_1',
    name: '신인 투수',
    type: 'starter',
    targetPoints: 200,
    debuffs: [],
    description: '갓 올라온 신인',
    icon: '🌱',
  },
  {
    id: 'starter_2',
    name: '평범한 투수',
    type: 'starter',
    targetPoints: 400,
    debuffs: [],
    description: '무난한 실력',
    icon: '⚾',
  },
  {
    id: 'starter_3',
    name: '베테랑 투수',
    type: 'starter',
    targetPoints: 700,
    debuffs: [],
    description: '노련한 투구',
    icon: '🧔',
  },
];

// ========== 중계 투수 (단일 디버프, 중간 목표 포인트) ==========

export const relieverPitchers: PitcherWithDebuff[] = [
  // 카드 방해형
  {
    id: 'reliever_seal',
    name: '봉쇄형 투수',
    type: 'reliever',
    targetPoints: 180,
    debuffs: ['hand_reduce_1'],
    description: '핸드 크기를 줄인다',
    icon: '🃏',
  },
  {
    id: 'reliever_disrupt',
    name: '교란형 투수',
    type: 'reliever',
    targetPoints: 180,
    debuffs: ['card_seal_1'],
    description: '카드를 봉인한다',
    icon: '🔒',
  },
  // 시스템 제한형
  {
    id: 'reliever_quick',
    name: '속공형 투수',
    type: 'reliever',
    targetPoints: 200,
    debuffs: ['discard_reduce_1'],
    description: '버리기 기회를 줄인다',
    icon: '🔄',
  },
  {
    id: 'reliever_defense',
    name: '수비형 투수',
    type: 'reliever',
    targetPoints: 200,
    debuffs: ['select_reduce_1'],
    description: '카드 선택을 제한한다',
    icon: '✋',
  },
  // 수치 약화형
  {
    id: 'reliever_control',
    name: '제구형 투수',
    type: 'reliever',
    targetPoints: 220,
    debuffs: ['hit_reduce_10'],
    description: '안타 확률을 낮춘다',
    icon: '📉',
  },
  // 모드 봉쇄형
  {
    id: 'reliever_anti_power',
    name: '파워킬러 투수',
    type: 'reliever',
    targetPoints: 200,
    debuffs: ['block_power'],
    description: '파워 스윙을 막는다',
    icon: '🚫💪',
  },
  {
    id: 'reliever_anti_contact',
    name: '컨택킬러 투수',
    type: 'reliever',
    targetPoints: 200,
    debuffs: ['block_contact'],
    description: '정확한 타격을 막는다',
    icon: '🚫🎯',
  },
  {
    id: 'reliever_anti_speed',
    name: '스피드킬러 투수',
    type: 'reliever',
    targetPoints: 200,
    debuffs: ['block_speed'],
    description: '스피드 플레이를 막는다',
    icon: '🚫👟',
  },
  {
    id: 'reliever_anti_eye',
    name: '선구안킬러 투수',
    type: 'reliever',
    targetPoints: 200,
    debuffs: ['block_eye'],
    description: '선구안 모드를 막는다',
    icon: '🚫👀',
  },
  // 속성 약화형
  {
    id: 'reliever_power_nerf',
    name: '파워억제 투수',
    type: 'reliever',
    targetPoints: 180,
    debuffs: ['power_nerf'],
    description: '파워 모드 조건을 강화',
    icon: '⬇️💪',
  },
  {
    id: 'reliever_contact_nerf',
    name: '컨택억제 투수',
    type: 'reliever',
    targetPoints: 180,
    debuffs: ['contact_nerf'],
    description: '컨택 모드 조건을 강화',
    icon: '⬇️🎯',
  },
  // 특수형
  {
    id: 'reliever_synergy',
    name: '시너지차단 투수',
    type: 'reliever',
    targetPoints: 220,
    debuffs: ['synergy_block'],
    description: '시너지 발동을 막는다',
    icon: '💫',
  },
];

// ========== 마무리 투수 (복합 디버프, 높은 목표 포인트) ==========

export const closerPitchers: PitcherWithDebuff[] = [
  // 단일 강력 디버프
  {
    id: 'closer_pressure',
    name: '압박형 마무리',
    type: 'closer',
    targetPoints: 280,
    debuffs: ['hand_reduce_2'],
    description: '극심한 핸드 압박',
    icon: '😤',
  },
  {
    id: 'closer_shutout',
    name: '완봉형 마무리',
    type: 'closer',
    targetPoints: 280,
    debuffs: ['discard_reduce_2'],
    description: '버리기 극도로 제한',
    icon: '🔒',
  },
  {
    id: 'closer_fortress',
    name: '철벽형 마무리',
    type: 'closer',
    targetPoints: 300,
    debuffs: ['select_reduce_2'],
    description: '카드 선택 극도로 제한',
    icon: '🏰',
  },
  {
    id: 'closer_strikeout',
    name: '탈삼진 에이스',
    type: 'closer',
    targetPoints: 320,
    debuffs: ['hit_reduce_20'],
    description: '안타 확률 대폭 감소',
    icon: '🔥',
  },
  // 복합 디버프
  {
    id: 'closer_combo_1',
    name: '봉쇄+속공 마무리',
    type: 'closer',
    targetPoints: 300,
    debuffs: ['hand_reduce_1', 'discard_reduce_1'],
    description: '핸드 감소 + 버리기 감소',
    icon: '💀',
  },
  {
    id: 'closer_combo_2',
    name: '교란+제구 마무리',
    type: 'closer',
    targetPoints: 300,
    debuffs: ['card_seal_1', 'hit_reduce_10'],
    description: '카드 봉인 + 안타 확률 감소',
    icon: '👻',
  },
  {
    id: 'closer_combo_3',
    name: '수비+봉쇄 마무리',
    type: 'closer',
    targetPoints: 320,
    debuffs: ['select_reduce_1', 'hand_reduce_1'],
    description: '선택 제한 + 핸드 감소',
    icon: '🛡️',
  },
  // 특수 복합
  {
    id: 'closer_ability_seal',
    name: '능력봉인 마무리',
    type: 'closer',
    targetPoints: 350,
    debuffs: ['ability_block', 'synergy_block'],
    description: '능력과 시너지 모두 봉인',
    icon: '⛔',
  },
  {
    id: 'closer_mode_killer',
    name: '모드킬러 마무리',
    type: 'closer',
    targetPoints: 350,
    debuffs: ['block_power', 'block_contact'],
    description: '주요 모드 2개 봉쇄',
    icon: '🚫',
  },
  // 최종 보스급
  {
    id: 'closer_nightmare',
    name: '악몽의 마무리',
    type: 'closer',
    targetPoints: 380,
    debuffs: ['hand_reduce_1', 'discard_reduce_1', 'hit_reduce_10'],
    description: '트리플 디버프',
    icon: '😈',
  },
  {
    id: 'closer_final',
    name: '최종 수호자',
    type: 'closer',
    targetPoints: 400,
    debuffs: ['hand_reduce_2', 'select_reduce_1', 'ability_block'],
    description: '최강의 마무리 투수',
    icon: '👑',
  },
];

// ========== 전체 투수 풀 ==========

export const allPitchers: PitcherWithDebuff[] = [
  ...starterPitchers,
  ...relieverPitchers,
  ...closerPitchers,
];

// ========== 유틸리티 함수 ==========

/**
 * ID로 투수 찾기
 */
export function getPitcherById(id: string): PitcherWithDebuff | undefined {
  return allPitchers.find(p => p.id === id);
}

/**
 * 타입별 투수 가져오기
 */
export function getPitchersByType(type: PitcherType): PitcherWithDebuff[] {
  return allPitchers.filter(p => p.type === type);
}

/**
 * 디버프 강도 합계 계산
 */
export function calculateDebuffSeverity(debuffs: DebuffType[]): number {
  return debuffs.reduce((sum, debuff) => {
    const info = DEBUFF_INFO[debuff];
    switch (info.severity) {
      case 'mild': return sum + 1;
      case 'moderate': return sum + 2;
      case 'severe': return sum + 3;
    }
  }, 0);
}

/**
 * 기본 투수 라인업 생성 (테스트용: 선발 3명)
 */
export function createDefaultPitcherLineup(): BasePitcher[] {
  return starterPitchers.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    targetPoints: p.targetPoints,
    description: p.description,
  }));
}
