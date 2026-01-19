import { PlayerCard } from '../game/types';

/**
 * 상점에서 획득 가능한 선수 풀
 * 등급: common(일반), rare(희귀), epic(영웅), legendary(전설)
 */

// ========== 일반 등급 (Common) ==========
// 기본적인 능력치, 흔하게 등장
export const commonPlayers: PlayerCard[] = [
  {
    id: 'c1',
    name: '오민석',
    tags: ['contact'],
    battingAverage: 0.255,
    power: 4,
    speed: 5,
    ability: 'contact_master',
    revealed: false,
  },
  {
    id: 'c2',
    name: '장현우',
    tags: ['speed'],
    battingAverage: 0.245,
    power: 3,
    speed: 7,
    ability: 'speedster',
    revealed: false,
  },
  {
    id: 'c3',
    name: '권태훈',
    tags: ['power'],
    battingAverage: 0.235,
    power: 6,
    speed: 4,
    ability: 'power_hitter',
    revealed: false,
  },
  {
    id: 'c4',
    name: '신동현',
    tags: ['eye'],
    battingAverage: 0.260,
    power: 3,
    speed: 5,
    ability: 'patient',
    revealed: false,
  },
  {
    id: 'c5',
    name: '유승민',
    tags: [],
    battingAverage: 0.250,
    power: 4,
    speed: 5,
    ability: 'leadoff',
    revealed: false,
  },
  {
    id: 'c6',
    name: '조영준',
    tags: ['contact'],
    battingAverage: 0.265,
    power: 4,
    speed: 4,
    ability: 'hot_streak',
    revealed: false,
  },
];

// ========== 희귀 등급 (Rare) ==========
// 좋은 능력치, 가끔 등장
export const rarePlayers: PlayerCard[] = [
  {
    id: 'r1',
    name: '김도윤',
    tags: ['contact', 'eye'],
    battingAverage: 0.295,
    power: 4,
    speed: 5,
    ability: 'contact_master',
    revealed: false,
  },
  {
    id: 'r2',
    name: '이시우',
    tags: ['speed', 'contact'],
    battingAverage: 0.280,
    power: 3,
    speed: 8,
    ability: 'speedster',
    revealed: false,
  },
  {
    id: 'r3',
    name: '박준서',
    tags: ['power'],
    battingAverage: 0.270,
    power: 8,
    speed: 3,
    ability: 'cleanup',
    revealed: false,
  },
  {
    id: 'r4',
    name: '최민재',
    tags: ['power', 'contact'],
    battingAverage: 0.285,
    power: 7,
    speed: 4,
    ability: 'clutch',
    revealed: false,
  },
  {
    id: 'r5',
    name: '정우진',
    tags: ['eye'],
    battingAverage: 0.275,
    power: 5,
    speed: 5,
    ability: 'patient',
    revealed: false,
  },
  {
    id: 'r6',
    name: '강현수',
    tags: ['contact', 'speed'],
    battingAverage: 0.290,
    power: 4,
    speed: 6,
    ability: 'run_producer',
    revealed: false,
  },
  {
    id: 'r7',
    name: '윤재호',
    tags: ['speed'],
    battingAverage: 0.270,
    power: 3,
    speed: 9,
    ability: 'leadoff',
    revealed: false,
  },
  {
    id: 'r8',
    name: '임성준',
    tags: ['power'],
    battingAverage: 0.265,
    power: 7,
    speed: 4,
    ability: 'power_hitter',
    revealed: false,
  },
];

// ========== 영웅 등급 (Epic) ==========
// 뛰어난 능력치, 드물게 등장
export const epicPlayers: PlayerCard[] = [
  {
    id: 'e1',
    name: '서진우',
    tags: ['contact', 'eye'],
    battingAverage: 0.320,
    power: 5,
    speed: 6,
    ability: 'contact_master',
    revealed: false,
  },
  {
    id: 'e2',
    name: '한동훈',
    tags: ['power', 'contact'],
    battingAverage: 0.305,
    power: 8,
    speed: 4,
    ability: 'cleanup',
    revealed: false,
  },
  {
    id: 'e3',
    name: '배성훈',
    tags: ['speed', 'contact'],
    battingAverage: 0.295,
    power: 4,
    speed: 9,
    ability: 'speedster',
    revealed: false,
  },
  {
    id: 'e4',
    name: '문재현',
    tags: ['power'],
    battingAverage: 0.280,
    power: 9,
    speed: 3,
    ability: 'power_hitter',
    revealed: false,
  },
  {
    id: 'e5',
    name: '안준혁',
    tags: ['contact', 'power'],
    battingAverage: 0.310,
    power: 6,
    speed: 5,
    ability: 'clutch',
    revealed: false,
  },
  {
    id: 'e6',
    name: '노승현',
    tags: ['eye', 'contact'],
    battingAverage: 0.300,
    power: 4,
    speed: 6,
    ability: 'patient',
    revealed: false,
  },
  {
    id: 'e7',
    name: '황민우',
    tags: ['contact', 'speed'],
    battingAverage: 0.305,
    power: 5,
    speed: 7,
    ability: 'run_producer',
    revealed: false,
  },
  {
    id: 'e8',
    name: '추성민',
    tags: ['contact'],
    battingAverage: 0.315,
    power: 5,
    speed: 5,
    ability: 'hot_streak',
    revealed: false,
  },
];

// ========== 전설 등급 (Legendary) ==========
// 최고의 능력치, 매우 드물게 등장
export const legendaryPlayers: PlayerCard[] = [
  {
    id: 'l1',
    name: '이대호',
    tags: ['power', 'contact'],
    battingAverage: 0.330,
    power: 10,
    speed: 3,
    ability: 'cleanup',
    revealed: false,
  },
  {
    id: 'l2',
    name: '추신수',
    tags: ['eye', 'contact', 'power'],
    battingAverage: 0.340,
    power: 7,
    speed: 6,
    ability: 'patient',
    revealed: false,
  },
  {
    id: 'l3',
    name: '이종범',
    tags: ['speed', 'contact'],
    battingAverage: 0.335,
    power: 4,
    speed: 10,
    ability: 'speedster',
    revealed: false,
  },
  {
    id: 'l4',
    name: '양준혁',
    tags: ['power', 'contact'],
    battingAverage: 0.325,
    power: 9,
    speed: 4,
    ability: 'clutch',
    revealed: false,
  },
  {
    id: 'l5',
    name: '박용택',
    tags: ['contact'],
    battingAverage: 0.350,
    power: 5,
    speed: 5,
    ability: 'contact_master',
    revealed: false,
  },
  {
    id: 'l6',
    name: '이승엽',
    tags: ['power'],
    battingAverage: 0.310,
    power: 10,
    speed: 3,
    ability: 'power_hitter',
    revealed: false,
  },
];

// ========== 전체 선수 풀 ==========
export const allPlayers: PlayerCard[] = [
  ...commonPlayers,
  ...rarePlayers,
  ...epicPlayers,
  ...legendaryPlayers,
];

// ========== 등급별 정보 ==========
export type PlayerRarity = 'common' | 'rare' | 'epic' | 'legendary';

export const RARITY_INFO: Record<PlayerRarity, {
  name: string;
  color: string;
  bgColor: string;
  dropRate: number;  // 등장 확률 (합계 100)
  price: number;     // 기본 가격
}> = {
  common: {
    name: '일반',
    color: 'text-gray-400',
    bgColor: 'from-gray-500 to-gray-600',
    dropRate: 50,
    price: 50,
  },
  rare: {
    name: '희귀',
    color: 'text-blue-400',
    bgColor: 'from-blue-500 to-blue-600',
    dropRate: 30,
    price: 100,
  },
  epic: {
    name: '영웅',
    color: 'text-purple-400',
    bgColor: 'from-purple-500 to-purple-600',
    dropRate: 15,
    price: 200,
  },
  legendary: {
    name: '전설',
    color: 'text-yellow-400',
    bgColor: 'from-yellow-500 to-orange-500',
    dropRate: 5,
    price: 500,
  },
};

/**
 * 선수의 등급 가져오기
 */
export function getPlayerRarity(playerId: string): PlayerRarity {
  if (playerId.startsWith('l')) return 'legendary';
  if (playerId.startsWith('e')) return 'epic';
  if (playerId.startsWith('r')) return 'rare';
  if (playerId.startsWith('c')) return 'common';
  return 'common'; // 스타터 선수는 일반 등급
}

/**
 * 등급에 따른 랜덤 선수 선택
 */
export function getRandomPlayerByRarity(rarity: PlayerRarity): PlayerCard {
  let pool: PlayerCard[];
  switch (rarity) {
    case 'legendary': pool = legendaryPlayers; break;
    case 'epic': pool = epicPlayers; break;
    case 'rare': pool = rarePlayers; break;
    default: pool = commonPlayers;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 확률에 따른 랜덤 선수 선택
 */
export function getRandomPlayer(): { player: PlayerCard; rarity: PlayerRarity } {
  const roll = Math.random() * 100;

  if (roll < RARITY_INFO.legendary.dropRate) {
    return { player: getRandomPlayerByRarity('legendary'), rarity: 'legendary' };
  }
  if (roll < RARITY_INFO.legendary.dropRate + RARITY_INFO.epic.dropRate) {
    return { player: getRandomPlayerByRarity('epic'), rarity: 'epic' };
  }
  if (roll < RARITY_INFO.legendary.dropRate + RARITY_INFO.epic.dropRate + RARITY_INFO.rare.dropRate) {
    return { player: getRandomPlayerByRarity('rare'), rarity: 'rare' };
  }
  return { player: getRandomPlayerByRarity('common'), rarity: 'common' };
}
