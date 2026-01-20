import {
  ShopItem,
  ShopTier,
  PlayerCard,
  Coach,
  Voucher,
  PlayerUpgrade,
  ActionUpgrade,
} from './types';
import {
  commonPlayers,
  rarePlayers,
  epicPlayers,
  legendaryPlayers,
  RARITY_INFO,
  PlayerRarity,
} from '../data/playerPool';

// ========== 코치 데이터 ==========

const ALL_COACHES: Coach[] = [
  {
    id: 'coach_batting',
    name: '타격 코치',
    icon: '🧢',
    effectType: 'batting_all',
    effectValue: 2,  // 타율 +2%
    description: '모든 선수 타율 +2%',
    price: 200,
  },
  {
    id: 'coach_power',
    name: '파워 코치',
    icon: '💪',
    effectType: 'power_all',
    effectValue: 1,
    description: '모든 선수 파워 +1',
    price: 180,
  },
  {
    id: 'coach_extra_base',
    name: '슬러거 코치',
    icon: '🔥',
    effectType: 'extra_base',
    effectValue: 10,  // 장타 확률 +10%
    description: '장타 확률 +10%',
    price: 220,
  },
  {
    id: 'coach_speed_mode',
    name: '주루 코치',
    icon: '👟',
    effectType: 'speed_mode_bonus',
    effectValue: 15,  // 스피드 모드 보너스 +15P
    description: '스피드 모드 포인트 +15',
    price: 150,
  },
  {
    id: 'coach_power_mode',
    name: '파워 트레이너',
    icon: '🏋️',
    effectType: 'power_mode_bonus',
    effectValue: 15,
    description: '파워 모드 포인트 +15',
    price: 150,
  },
  {
    id: 'coach_contact_mode',
    name: '컨택 트레이너',
    icon: '🎯',
    effectType: 'contact_mode_bonus',
    effectValue: 15,
    description: '컨택 모드 포인트 +15',
    price: 150,
  },
  {
    id: 'coach_strategy',
    name: '전략 코치',
    icon: '📋',
    effectType: 'extra_discard',
    effectValue: 1,  // 버리기 +1회
    description: '버리기 횟수 +1',
    price: 250,
  },
  {
    id: 'coach_mental',
    name: '멘탈 코치',
    icon: '🧠',
    effectType: 'clutch_bonus',
    effectValue: 10,  // 2사 상황 안타 확률 +10%
    description: '2사 상황 안타 확률 +10%',
    price: 180,
  },
  {
    id: 'coach_run',
    name: '득점 코치',
    icon: '🏠',
    effectType: 'run_bonus',
    effectValue: 10,  // 득점 시 추가 포인트 +10
    description: '득점 시 추가 포인트 +10',
    price: 200,
  },
];

// ========== 바우처 데이터 ==========

const ALL_VOUCHERS: Voucher[] = [
  {
    id: 'voucher_discount',
    name: '할인권',
    icon: '🏷️',
    effectType: 'shop_discount',
    effectValue: 10,  // 10% 할인
    description: '모든 상점 가격 10% 할인',
    price: 150,
  },
  {
    id: 'voucher_extra_item',
    name: '대량 구매',
    icon: '📦',
    effectType: 'shop_extra_item',
    effectValue: 1,  // 아이템 +1
    description: '상점 아이템 +1개 표시',
    price: 180,
  },
  {
    id: 'voucher_roster',
    name: '선수단 확장',
    icon: '📝',
    effectType: 'roster_expand',
    effectValue: 1,  // 로스터 +1
    description: '최대 선수 수 +1',
    price: 200,
  },
  {
    id: 'voucher_rare',
    name: 'VIP',
    icon: '⭐',
    effectType: 'rare_chance',
    effectValue: 10,  // 희귀 확률 +10%
    description: '희귀 아이템 출현 확률 +10%',
    price: 220,
  },
  {
    id: 'voucher_gold',
    name: '골드 러쉬',
    icon: '💰',
    effectType: 'gold_bonus',
    effectValue: 20,  // 골드 +20%
    description: '골드 획득량 +20%',
    price: 250,
  },
];

// ========== 선수 강화 데이터 ==========

const PLAYER_UPGRADES: PlayerUpgrade[] = [
  {
    id: 'upgrade_batting',
    upgradeType: 'batting_training',
    name: '타율 훈련',
    description: '선택한 선수 타율 +2%',
    price: 100,
    effectValue: 0.02,
  },
  {
    id: 'upgrade_power',
    upgradeType: 'power_training',
    name: '파워 훈련',
    description: '선택한 선수 파워 +1',
    price: 80,
    effectValue: 1,
  },
  {
    id: 'upgrade_speed',
    upgradeType: 'speed_training',
    name: '스피드 훈련',
    description: '선택한 선수 스피드 +1',
    price: 80,
    effectValue: 1,
  },
];

// ========== 액션 강화 데이터 ==========

const ACTION_UPGRADES: ActionUpgrade[] = [
  {
    id: 'action_power_bonus',
    upgradeType: 'stat_bonus',
    name: '파워 강화',
    description: '파워 카드 사용 시 +5P',
    price: 60,
    targetStat: 'power',
    effectValue: 5,
  },
  {
    id: 'action_contact_bonus',
    upgradeType: 'stat_bonus',
    name: '컨택 강화',
    description: '컨택 카드 사용 시 +5P',
    price: 60,
    targetStat: 'contact',
    effectValue: 5,
  },
  {
    id: 'action_speed_bonus',
    upgradeType: 'stat_bonus',
    name: '스피드 강화',
    description: '스피드 카드 사용 시 +5P',
    price: 60,
    targetStat: 'speed',
    effectValue: 5,
  },
  {
    id: 'action_eye_bonus',
    upgradeType: 'stat_bonus',
    name: '선구안 강화',
    description: '선구안 카드 사용 시 +5P',
    price: 60,
    targetStat: 'eye',
    effectValue: 5,
  },
  {
    id: 'action_power_mode',
    upgradeType: 'mode_bonus',
    name: '파워 스윙 마스터',
    description: '파워 스윙 모드 +10P',
    price: 100,
    targetMode: 'power_swing',
    effectValue: 10,
  },
  {
    id: 'action_contact_mode',
    upgradeType: 'mode_bonus',
    name: '정확한 타격 마스터',
    description: '정확한 타격 모드 +10P',
    price: 100,
    targetMode: 'contact_hit',
    effectValue: 10,
  },
  {
    id: 'action_speed_mode',
    upgradeType: 'mode_bonus',
    name: '스피드 플레이 마스터',
    description: '스피드 플레이 모드 +10P',
    price: 100,
    targetMode: 'speed_play',
    effectValue: 10,
  },
];

// ========== 상점 아이템 생성 ==========

interface ShopContext {
  ownedCoachIds: Set<string>;
  ownedVoucherIds: Set<string>;
}

/**
 * 상점 아이템 생성
 */
export function generateShopItems(
  tier: ShopTier,
  currentRoster: PlayerCard[],
  context?: ShopContext
): ShopItem[] {
  const items: ShopItem[] = [];
  const currentIds = new Set(currentRoster.map(p => p.id));
  const ownedCoachIds = context?.ownedCoachIds ?? new Set();
  const ownedVoucherIds = context?.ownedVoucherIds ?? new Set();

  // 등급별 아이템 수
  const counts = getItemCountsForTier(tier);

  // 1. 선수 카드 생성
  for (let i = 0; i < counts.players; i++) {
    const player = getRandomPlayerForShop(tier, currentIds);
    if (player) {
      const rarity = getPlayerRarityFromId(player.id);
      items.push({
        id: `shop_player_${player.id}_${Date.now()}_${i}`,
        type: 'player',
        name: player.name,
        description: getPlayerDescription(player),
        price: RARITY_INFO[rarity].price,
        player: { ...player },
        rarity,
      });
      currentIds.add(player.id);
    }
  }

  // 2. 선수 강화 생성 (medium, high 등급에서만)
  if (tier !== 'basic' && counts.playerUpgrades > 0) {
    const upgrades = getRandomItems(PLAYER_UPGRADES, counts.playerUpgrades);
    upgrades.forEach((upgrade, i) => {
      items.push({
        id: `shop_pupgrade_${upgrade.id}_${Date.now()}_${i}`,
        type: 'playerUpgrade',
        name: upgrade.name,
        description: upgrade.description,
        price: upgrade.price,
        playerUpgrade: { ...upgrade },
      });
    });
  }

  // 3. 액션 강화 생성
  if (counts.actionUpgrades > 0) {
    const upgrades = getRandomItems(ACTION_UPGRADES, counts.actionUpgrades);
    upgrades.forEach((upgrade, i) => {
      items.push({
        id: `shop_aupgrade_${upgrade.id}_${Date.now()}_${i}`,
        type: 'actionUpgrade',
        name: upgrade.name,
        description: upgrade.description,
        price: upgrade.price,
        actionUpgrade: { ...upgrade },
      });
    });
  }

  // 4. 코치 생성 (medium, high 등급에서만)
  if (tier !== 'basic' && counts.coaches > 0) {
    const availableCoaches = ALL_COACHES.filter(c => !ownedCoachIds.has(c.id));
    const coaches = getRandomItems(availableCoaches, counts.coaches);
    coaches.forEach((coach, i) => {
      items.push({
        id: `shop_coach_${coach.id}_${Date.now()}_${i}`,
        type: 'coach',
        name: coach.name,
        description: coach.description,
        price: coach.price,
        coach: { ...coach },
      });
    });
  }

  // 5. 바우처 생성 (high 등급에서만)
  if (tier === 'high' && counts.vouchers > 0) {
    const availableVouchers = ALL_VOUCHERS.filter(v => !ownedVoucherIds.has(v.id));
    const vouchers = getRandomItems(availableVouchers, counts.vouchers);
    vouchers.forEach((voucher, i) => {
      items.push({
        id: `shop_voucher_${voucher.id}_${Date.now()}_${i}`,
        type: 'voucher',
        name: voucher.name,
        description: voucher.description,
        price: voucher.price,
        voucher: { ...voucher },
      });
    });
  }

  return items;
}

/**
 * 등급별 아이템 수
 */
function getItemCountsForTier(tier: ShopTier): {
  players: number;
  playerUpgrades: number;
  actionUpgrades: number;
  coaches: number;
  vouchers: number;
} {
  switch (tier) {
    case 'basic':
      return { players: 3, playerUpgrades: 0, actionUpgrades: 1, coaches: 0, vouchers: 0 };
    case 'medium':
      return { players: 3, playerUpgrades: 1, actionUpgrades: 2, coaches: 1, vouchers: 0 };
    case 'high':
      return { players: 4, playerUpgrades: 2, actionUpgrades: 2, coaches: 2, vouchers: 1 };
  }
}

/**
 * 배열에서 랜덤하게 n개 선택
 */
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 상점 등급에 따른 랜덤 선수 선택
 */
function getRandomPlayerForShop(tier: ShopTier, excludeIds: Set<string>): PlayerCard | null {
  const dropRates = getDropRatesForTier(tier);

  const roll = Math.random() * 100;
  let rarity: PlayerRarity;

  if (roll < dropRates.legendary) {
    rarity = 'legendary';
  } else if (roll < dropRates.legendary + dropRates.epic) {
    rarity = 'epic';
  } else if (roll < dropRates.legendary + dropRates.epic + dropRates.rare) {
    rarity = 'rare';
  } else {
    rarity = 'common';
  }

  const pool = getPoolByRarity(rarity);
  const available = pool.filter(p => !excludeIds.has(p.id));

  if (available.length === 0) {
    const allAvailable = [...commonPlayers, ...rarePlayers, ...epicPlayers, ...legendaryPlayers]
      .filter(p => !excludeIds.has(p.id));
    if (allAvailable.length === 0) return null;
    return allAvailable[Math.floor(Math.random() * allAvailable.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * 등급별 드롭률
 */
function getDropRatesForTier(tier: ShopTier): Record<PlayerRarity, number> {
  switch (tier) {
    case 'basic':
      return { legendary: 1, epic: 5, rare: 24, common: 70 };
    case 'medium':
      return { legendary: 3, epic: 12, rare: 35, common: 50 };
    case 'high':
      return { legendary: 10, epic: 25, rare: 40, common: 25 };
  }
}

/**
 * 등급별 선수 풀 반환
 */
function getPoolByRarity(rarity: PlayerRarity): PlayerCard[] {
  switch (rarity) {
    case 'legendary': return legendaryPlayers;
    case 'epic': return epicPlayers;
    case 'rare': return rarePlayers;
    default: return commonPlayers;
  }
}

/**
 * 선수 ID로 등급 판단
 */
function getPlayerRarityFromId(id: string): PlayerRarity {
  if (id.startsWith('l')) return 'legendary';
  if (id.startsWith('e')) return 'epic';
  if (id.startsWith('r')) return 'rare';
  return 'common';
}

/**
 * 선수 설명 생성
 */
function getPlayerDescription(player: PlayerCard): string {
  const stats = `타율 ${(player.battingAverage * 100).toFixed(0)}% | 파워 ${player.power} | 스피드 ${player.speed}`;
  const tags = player.tags.length > 0 ? ` | ${player.tags.join(', ')}` : '';
  return stats + tags;
}

// ========== 디버그용: 전체 아이템 목록 ==========

export interface AllShopItems {
  coaches: Coach[];
  vouchers: Voucher[];
  playerUpgrades: PlayerUpgrade[];
  actionUpgrades: ActionUpgrade[];
  players: {
    common: PlayerCard[];
    rare: PlayerCard[];
    epic: PlayerCard[];
    legendary: PlayerCard[];
  };
}

/**
 * 개발용: 모든 상점 아이템 목록 반환
 */
export function getAllShopItems(): AllShopItems {
  return {
    coaches: ALL_COACHES,
    vouchers: ALL_VOUCHERS,
    playerUpgrades: PLAYER_UPGRADES,
    actionUpgrades: ACTION_UPGRADES,
    players: {
      common: commonPlayers,
      rare: rarePlayers,
      epic: epicPlayers,
      legendary: legendaryPlayers,
    },
  };
}
