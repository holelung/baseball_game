import { create } from 'zustand';
import {
  GameState,
  GamePhase,
  ActionCard,
  BaseState,
  ShopItem,
  ShopTier,
  PlayerCard,
  StatType,
  ActionMode,
} from '../game/types';
import { shuffle, drawPlayers, addToBottom, createActionDeck, drawActionCards, toggleActionCardSelection, getSelectedActionCards } from '../game/deck';
import { emptyBases, executePlay, advanceRunners } from '../game/scoring';
import { evaluateActionMode } from '../game/actionMode';
import { starterPlayers } from '../data/starterPlayers';
import { createDefaultPitcherLineup } from '../data/pitchers';
import { generateShopItems } from '../game/shop';

interface GameActions {
  initGame: () => void;
  selectPlayer: (playerId: string) => void;
  toggleActionCard: (cardId: string) => void;
  discardAndDraw: () => void;
  executeSelectedPlay: () => void;
  nextTurn: () => void;
  nextPitcher: () => void;
  resetAfterOuts: () => void;
  resetGame: () => void;
  // 상점 관련
  openShop: (tier: ShopTier) => void;
  closeShop: () => void;
  buyPlayer: (item: ShopItem) => void;
  replacePlayer: (newPlayer: PlayerCard, oldPlayerId: string) => void;
  buyCoach: (item: ShopItem) => void;
  buyVoucher: (item: ShopItem) => void;
  buyPlayerUpgrade: (item: ShopItem, targetPlayerId: string) => void;
  buyActionUpgrade: (item: ShopItem) => void;
}

const INITIAL_DISCARDS = 3;
const MAX_DISCARD_COUNT = 5;
const HAND_SIZE = 8;
const MAX_ROSTER_SIZE = 12;
const MAX_COACHES = 5;

const initialStatBonuses: Record<StatType, number> = {
  power: 0,
  contact: 0,
  speed: 0,
  eye: 0,
};

const initialModeBonuses: Record<ActionMode, number> = {
  power_swing: 0,
  contact_hit: 0,
  speed_play: 0,
  eye_mode: 0,
  balanced: 0,
  normal: 0,
};

const initialState: GameState = {
  currentInning: 1,
  outs: 0,
  score: 0,
  totalPoints: 0,
  gold: 0,
  // 투수 시스템
  currentPitcher: null,
  pitcherPoints: 0,
  pitcherLineup: [],
  defeatedPitchers: [],
  // 루 상태
  bases: emptyBases(),
  // 선수 카드
  playerDeck: [],
  playerHand: [],
  selectedPlayer: null,
  isFirstAtBat: true,
  maxRosterSize: MAX_ROSTER_SIZE,
  // 액션 카드
  actionDeck: [],
  actionHand: [],
  selectedActionCards: [],
  currentResult: null,
  phase: 'selectPlayer',
  discardsRemaining: INITIAL_DISCARDS,
  // 상점
  shop: {
    isOpen: false,
    tier: 'basic',
    items: [],
  },
  // 코치 & 바우처
  coaches: [],
  maxCoaches: MAX_COACHES,
  vouchers: [],
  // 강화 보너스
  statBonuses: { ...initialStatBonuses },
  modeBonuses: { ...initialModeBonuses },
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  initGame: () => {
    const freshPlayers = starterPlayers.map(p => ({ ...p, revealed: false }));
    const shuffledPlayers = shuffle(freshPlayers);
    const shuffledAction = shuffle(createActionDeck());

    const { drawn, remaining: playerDeck } = drawPlayers(shuffledPlayers, 3);
    const playerHand = drawn.map(p => ({ ...p, revealed: true }));
    const { drawn: actionHand, remaining: actionDeck } = drawActionCards(shuffledAction, HAND_SIZE);

    const pitcherLineup = createDefaultPitcherLineup();
    const [firstPitcher, ...remainingPitchers] = pitcherLineup;

    set({
      ...initialState,
      playerDeck,
      playerHand,
      actionDeck,
      actionHand,
      isFirstAtBat: true,
      currentPitcher: firstPitcher,
      pitcherLineup: remainingPitchers,
      defeatedPitchers: [],
      pitcherPoints: 0,
      gold: 0,
      phase: 'selectPlayer',
    });
  },

  selectPlayer: (playerId: string) => {
    const state = get();
    if (state.phase !== 'selectPlayer') return;

    const selectedPlayer = state.playerHand.find(p => p.id === playerId);
    if (!selectedPlayer) return;

    const remainingHand = state.playerHand.filter(p => p.id !== playerId);

    set({
      selectedPlayer,
      playerHand: remainingHand,
      selectedActionCards: [],
      phase: 'selectCards',
    });
  },

  toggleActionCard: (cardId: string) => {
    const state = get();
    if (state.phase !== 'selectCards') return;

    const newActionHand = toggleActionCardSelection(state.actionHand, cardId);
    const selectedCards = getSelectedActionCards(newActionHand);

    if (selectedCards.length > MAX_DISCARD_COUNT) return;

    set({
      actionHand: newActionHand,
      selectedActionCards: selectedCards,
    });
  },

  discardAndDraw: () => {
    const state = get();
    if (state.discardsRemaining <= 0) return;
    if (state.phase !== 'selectCards') return;
    if (state.selectedActionCards.length === 0) return;
    if (state.selectedActionCards.length > MAX_DISCARD_COUNT) return;

    const remainingHand = state.actionHand.filter(c => !c.selected);
    const discardCount = state.selectedActionCards.length;

    let newActionDeck = state.actionDeck;
    let drawnCards: ActionCard[] = [];

    if (newActionDeck.length < discardCount) {
      newActionDeck = shuffle(createActionDeck());
    }

    const drawResult = drawActionCards(newActionDeck, discardCount);
    drawnCards = drawResult.drawn;
    newActionDeck = drawResult.remaining;

    const newHand = [...remainingHand, ...drawnCards].map(c => ({ ...c, selected: false }));

    set({
      actionDeck: newActionDeck,
      actionHand: newHand,
      selectedActionCards: [],
      discardsRemaining: state.discardsRemaining - 1,
    });
  },

  executeSelectedPlay: () => {
    const state = get();
    if (state.phase !== 'selectCards') return;
    if (!state.selectedPlayer) return;
    if (state.selectedActionCards.length === 0) return;

    const modeResult = evaluateActionMode(state.selectedActionCards);
    const playResult = executePlay(modeResult, state.selectedPlayer, state.bases, state.outs, state.isFirstAtBat);

    const isOut = playResult.baseballResult === 'out';
    let newOuts = state.outs;
    let newPhase: GamePhase = 'showResult';
    let updatedPlayerDeck = state.playerDeck;
    let newBases: BaseState = state.bases;
    let newPitcherPoints = state.pitcherPoints;
    let newGold = state.gold;

    if (isOut) {
      newOuts += 1;
      const revealedPlayer = { ...state.selectedPlayer, revealed: true };
      updatedPlayerDeck = addToBottom(state.playerDeck, revealedPlayer);
    } else {
      const advanceCount = playResult.baseballResult === 'single' ? 1
        : playResult.baseballResult === 'double' ? 2
        : playResult.baseballResult === 'triple' ? 3 : 4;
      const advanceResult = advanceRunners(state.bases, state.selectedPlayer, advanceCount);
      newBases = advanceResult.newBases;

      advanceResult.scoredRunners.forEach(runner => {
        const revealedRunner = { ...runner, revealed: true };
        updatedPlayerDeck = addToBottom(updatedPlayerDeck, revealedRunner);
      });

      newPitcherPoints += playResult.pointsEarned;
      // 포인트 획득 시 골드도 획득 (1:1 비율)
      newGold += playResult.pointsEarned;
    }

    // 투수 강판 체크
    const currentPitcher = state.currentPitcher;
    if (currentPitcher && newPitcherPoints >= currentPitcher.targetPoints) {
      newPhase = 'pitcherDefeated';
    }

    const usedCardIds = new Set(state.selectedActionCards.map(c => c.id));
    const remainingActionHand = state.actionHand.filter(c => !usedCardIds.has(c.id));

    set({
      playerDeck: updatedPlayerDeck,
      bases: newBases,
      score: state.score + playResult.runsScored,
      totalPoints: state.totalPoints + playResult.pointsEarned,
      pitcherPoints: newPitcherPoints,
      gold: newGold,
      outs: newOuts,
      currentResult: playResult,
      phase: newPhase,
      actionHand: remainingActionHand,
      selectedActionCards: [],
    });
  },

  nextTurn: () => {
    const state = get();

    // 3아웃이면 상점 오픈 후 리셋
    if (state.outs >= 3) {
      get().openShop('basic');
      return;
    }

    let newPlayerDeck = state.playerDeck;

    if (newPlayerDeck.length === 0) {
      const freshPlayers = starterPlayers.map(p => ({ ...p, revealed: false }));
      newPlayerDeck = shuffle(freshPlayers);
    }

    const { drawn, remaining } = drawPlayers(newPlayerDeck, 1);
    const drawnPlayer = drawn.map(p => ({ ...p, revealed: true }));
    newPlayerDeck = remaining;

    const newPlayerHand = [...state.playerHand, ...drawnPlayer];

    const currentActionHand = state.actionHand.map(c => ({ ...c, selected: false }));
    const needToDraw = HAND_SIZE - currentActionHand.length;

    let newActionDeck = state.actionDeck;
    let newActionHand = currentActionHand;

    if (needToDraw > 0) {
      if (newActionDeck.length < needToDraw) {
        newActionDeck = shuffle(createActionDeck());
      }
      const { drawn: drawnAction, remaining: remainingDeck } = drawActionCards(newActionDeck, needToDraw);
      newActionHand = [...currentActionHand, ...drawnAction];
      newActionDeck = remainingDeck;
    }

    set({
      playerHand: newPlayerHand,
      playerDeck: newPlayerDeck,
      selectedPlayer: null,
      actionHand: newActionHand,
      actionDeck: newActionDeck,
      selectedActionCards: [],
      currentResult: null,
      isFirstAtBat: false,
      phase: 'selectPlayer',
    });
  },

  resetAfterOuts: () => {
    const state = get();

    let newPlayerDeck = state.playerDeck;
    if (state.bases.third) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.third, revealed: true });
    if (state.bases.second) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.second, revealed: true });
    if (state.bases.first) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.first, revealed: true });

    const currentPlayerHand = state.playerHand;
    const needToDraw = 3 - currentPlayerHand.length;
    let newPlayerHand = currentPlayerHand;

    if (needToDraw > 0) {
      const { drawn, remaining } = drawPlayers(newPlayerDeck, needToDraw);
      newPlayerHand = [...currentPlayerHand, ...drawn.map(p => ({ ...p, revealed: true }))];
      newPlayerDeck = remaining;
    }

    const reshuffledAction = shuffle(createActionDeck());
    const { drawn: actionHand, remaining: actionDeck } = drawActionCards(reshuffledAction, HAND_SIZE);

    set({
      currentInning: state.currentInning + 1,
      outs: 0,
      bases: emptyBases(),
      playerDeck: newPlayerDeck,
      playerHand: newPlayerHand,
      selectedPlayer: null,
      isFirstAtBat: true,
      actionDeck,
      actionHand,
      selectedActionCards: [],
      currentResult: null,
      phase: 'selectPlayer',
      discardsRemaining: INITIAL_DISCARDS,
      shop: { isOpen: false, tier: 'basic', items: [] },
    });
  },

  nextPitcher: () => {
    const state = get();
    const currentPitcher = state.currentPitcher;

    const defeatedPitchers = currentPitcher
      ? [...state.defeatedPitchers, currentPitcher]
      : state.defeatedPitchers;

    // 투수 강판 보너스 골드
    const bonusGold = currentPitcher ? Math.floor(currentPitcher.targetPoints * 0.5) : 0;

    if (state.pitcherLineup.length === 0) {
      set({
        defeatedPitchers,
        currentPitcher: null,
        gold: state.gold + bonusGold,
        phase: 'gameEnd',
      });
      return;
    }

    // 투수 강판 시 중급 상점 오픈
    get().openShop('medium');

    set({
      defeatedPitchers,
      gold: state.gold + bonusGold,
    });
  },

  // ========== 상점 관련 ==========

  openShop: (tier: ShopTier) => {
    const state = get();
    const currentRoster = [...state.playerDeck, ...state.playerHand];
    if (state.selectedPlayer) currentRoster.push(state.selectedPlayer);
    // 베이스 주자도 포함
    if (state.bases.first) currentRoster.push(state.bases.first);
    if (state.bases.second) currentRoster.push(state.bases.second);
    if (state.bases.third) currentRoster.push(state.bases.third);

    // 이미 보유한 코치/바우처 ID
    const context = {
      ownedCoachIds: new Set(state.coaches.map(c => c.id)),
      ownedVoucherIds: new Set(state.vouchers.map(v => v.id)),
    };

    const items = generateShopItems(tier, currentRoster, context);

    set({
      phase: 'shop',
      shop: {
        isOpen: true,
        tier,
        items,
      },
    });
  },

  closeShop: () => {
    const state = get();
    const tier = state.shop.tier;

    // 상점 닫을 때 다음 단계로 진행
    if (tier === 'basic') {
      // 이닝 종료 상점 → 다음 이닝
      get().resetAfterOuts();
    } else if (tier === 'medium') {
      // 투수 강판 상점 → 다음 투수
      const [nextPitcher, ...remainingPitchers] = state.pitcherLineup;

      let newPlayerDeck = state.playerDeck;
      if (state.bases.third) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.third, revealed: true });
      if (state.bases.second) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.second, revealed: true });
      if (state.bases.first) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.first, revealed: true });

      const currentPlayerHand = state.playerHand;
      const needToDraw = 3 - currentPlayerHand.length;
      let newPlayerHand = currentPlayerHand;

      if (needToDraw > 0) {
        const { drawn, remaining } = drawPlayers(newPlayerDeck, needToDraw);
        newPlayerHand = [...currentPlayerHand, ...drawn.map(p => ({ ...p, revealed: true }))];
        newPlayerDeck = remaining;
      }

      const reshuffledAction = shuffle(createActionDeck());
      const { drawn: actionHand, remaining: actionDeck } = drawActionCards(reshuffledAction, HAND_SIZE);

      set({
        currentPitcher: nextPitcher,
        pitcherLineup: remainingPitchers,
        // pitcherPoints는 누적되므로 리셋하지 않음
        outs: 0,
        bases: emptyBases(),
        playerDeck: newPlayerDeck,
        playerHand: newPlayerHand,
        selectedPlayer: null,
        isFirstAtBat: true,
        actionDeck,
        actionHand,
        selectedActionCards: [],
        currentResult: null,
        phase: 'selectPlayer',
        discardsRemaining: INITIAL_DISCARDS,
        shop: { isOpen: false, tier: 'basic', items: [] },
      });
    }
  },

  buyPlayer: (item: ShopItem) => {
    const state = get();
    if (!item.player) return;
    if (state.gold < item.price) return;

    // 현재 로스터 수 계산
    const currentRoster = [...state.playerDeck, ...state.playerHand];
    if (state.selectedPlayer) currentRoster.push(state.selectedPlayer);
    if (state.bases.first) currentRoster.push(state.bases.first);
    if (state.bases.second) currentRoster.push(state.bases.second);
    if (state.bases.third) currentRoster.push(state.bases.third);

    if (currentRoster.length >= state.maxRosterSize) {
      // 교체 필요 - UI에서 replacePlayer 호출해야 함
      return;
    }

    // 덱에 선수 추가
    const newPlayer = { ...item.player, revealed: false };
    const newPlayerDeck = [...state.playerDeck, newPlayer];

    // 상점에서 해당 아이템 제거
    const newItems = state.shop.items.filter(i => i.id !== item.id);

    set({
      gold: state.gold - item.price,
      playerDeck: newPlayerDeck,
      shop: { ...state.shop, items: newItems },
    });
  },

  replacePlayer: (newPlayer: PlayerCard, oldPlayerId: string) => {
    const state = get();

    // 기존 선수 제거하고 새 선수 추가
    let newPlayerDeck = state.playerDeck.filter(p => p.id !== oldPlayerId);
    let newPlayerHand = state.playerHand.filter(p => p.id !== oldPlayerId);

    // 베이스에서도 제거
    let newBases = { ...state.bases };
    if (newBases.first?.id === oldPlayerId) newBases.first = null;
    if (newBases.second?.id === oldPlayerId) newBases.second = null;
    if (newBases.third?.id === oldPlayerId) newBases.third = null;

    // 새 선수 덱에 추가
    const playerToAdd = { ...newPlayer, revealed: false };
    newPlayerDeck = [...newPlayerDeck, playerToAdd];

    set({
      playerDeck: newPlayerDeck,
      playerHand: newPlayerHand,
      bases: newBases,
    });
  },

  buyCoach: (item: ShopItem) => {
    const state = get();
    if (!item.coach) return;
    if (state.gold < item.price) return;
    if (state.coaches.length >= state.maxCoaches) return;

    // 이미 보유한 코치인지 확인
    if (state.coaches.some(c => c.id === item.coach!.id)) return;

    const newCoaches = [...state.coaches, item.coach];
    const newItems = state.shop.items.filter(i => i.id !== item.id);

    // 바우처 효과 적용: 버리기 횟수 증가
    let newDiscardsRemaining = state.discardsRemaining;
    if (item.coach.effectType === 'extra_discard') {
      newDiscardsRemaining += item.coach.effectValue;
    }

    set({
      gold: state.gold - item.price,
      coaches: newCoaches,
      discardsRemaining: newDiscardsRemaining,
      shop: { ...state.shop, items: newItems },
    });
  },

  buyVoucher: (item: ShopItem) => {
    const state = get();
    if (!item.voucher) return;
    if (state.gold < item.price) return;

    // 이미 보유한 바우처인지 확인
    if (state.vouchers.some(v => v.id === item.voucher!.id)) return;

    const newVouchers = [...state.vouchers, item.voucher];
    const newItems = state.shop.items.filter(i => i.id !== item.id);

    // 바우처 효과 즉시 적용
    let newMaxRosterSize = state.maxRosterSize;
    if (item.voucher.effectType === 'roster_expand') {
      newMaxRosterSize += item.voucher.effectValue;
    }

    set({
      gold: state.gold - item.price,
      vouchers: newVouchers,
      maxRosterSize: newMaxRosterSize,
      shop: { ...state.shop, items: newItems },
    });
  },

  buyPlayerUpgrade: (item: ShopItem, targetPlayerId: string) => {
    const state = get();
    if (!item.playerUpgrade) return;
    if (state.gold < item.price) return;

    const upgrade = item.playerUpgrade;

    // 선수 찾기 및 강화 적용
    const applyUpgrade = (player: PlayerCard): PlayerCard => {
      if (player.id !== targetPlayerId) return player;

      switch (upgrade.upgradeType) {
        case 'batting_training':
          return { ...player, battingAverage: Math.min(player.battingAverage + upgrade.effectValue, 0.5) };
        case 'power_training':
          return { ...player, power: Math.min(player.power + upgrade.effectValue, 10) };
        case 'speed_training':
          return { ...player, speed: Math.min(player.speed + upgrade.effectValue, 10) };
        default:
          return player;
      }
    };

    const newPlayerDeck = state.playerDeck.map(applyUpgrade);
    const newPlayerHand = state.playerHand.map(applyUpgrade);
    const newItems = state.shop.items.filter(i => i.id !== item.id);

    set({
      gold: state.gold - item.price,
      playerDeck: newPlayerDeck,
      playerHand: newPlayerHand,
      shop: { ...state.shop, items: newItems },
    });
  },

  buyActionUpgrade: (item: ShopItem) => {
    const state = get();
    if (!item.actionUpgrade) return;
    if (state.gold < item.price) return;

    const upgrade = item.actionUpgrade;
    const newItems = state.shop.items.filter(i => i.id !== item.id);

    if (upgrade.upgradeType === 'stat_bonus' && upgrade.targetStat) {
      const newStatBonuses = { ...state.statBonuses };
      newStatBonuses[upgrade.targetStat] += upgrade.effectValue;
      set({
        gold: state.gold - item.price,
        statBonuses: newStatBonuses,
        shop: { ...state.shop, items: newItems },
      });
    } else if (upgrade.upgradeType === 'mode_bonus' && upgrade.targetMode) {
      const newModeBonuses = { ...state.modeBonuses };
      newModeBonuses[upgrade.targetMode] += upgrade.effectValue;
      set({
        gold: state.gold - item.price,
        modeBonuses: newModeBonuses,
        shop: { ...state.shop, items: newItems },
      });
    }
  },

  resetGame: () => {
    set(initialState);
  },
}));
