import { create } from 'zustand';
import { GameState, GamePhase, ActionCard, BaseState } from '../game/types';
import { shuffle, drawPlayers, addToBottom, createActionDeck, drawActionCards, toggleActionCardSelection, getSelectedActionCards } from '../game/deck';
import { emptyBases, executePlay, advanceRunners } from '../game/scoring';
import { evaluateActionMode } from '../game/actionMode';
import { starterPlayers } from '../data/starterPlayers';
import { createDefaultPitcherLineup } from '../data/pitchers';

interface GameActions {
  initGame: () => void;
  selectPlayer: (playerId: string) => void;
  toggleActionCard: (cardId: string) => void;
  discardAndDraw: () => void;      // 선택한 카드 버리고 새로 뽑기
  executeSelectedPlay: () => void;
  nextTurn: () => void;
  nextPitcher: () => void;         // 다음 투수로 전환
  resetAfterOuts: () => void;      // 3아웃 후 리셋
  resetGame: () => void;
}

const INITIAL_DISCARDS = 3;          // 투수당 버리기 횟수
const MAX_DISCARD_COUNT = 5;         // 한번에 최대 버리기 장수
const HAND_SIZE = 8;                 // 액션 핸드 크기

const initialState: GameState = {
  currentInning: 1,
  outs: 0,
  score: 0,
  totalPoints: 0,
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
  // 액션 카드
  actionDeck: [],
  actionHand: [],
  selectedActionCards: [],
  currentResult: null,
  phase: 'selectPlayer',
  discardsRemaining: INITIAL_DISCARDS,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  initGame: () => {
    // 선수 카드 초기화
    const freshPlayers = starterPlayers.map(p => ({ ...p, revealed: false }));
    const shuffledPlayers = shuffle(freshPlayers);
    const shuffledAction = shuffle(createActionDeck());

    // 최초 3장 드로우
    const { drawn, remaining: playerDeck } = drawPlayers(shuffledPlayers, 3);
    const playerHand = drawn.map(p => ({ ...p, revealed: true }));
    // 액션 카드 8장 드로우
    const { drawn: actionHand, remaining: actionDeck } = drawActionCards(shuffledAction, HAND_SIZE);

    // 투수 라인업 생성
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
      phase: 'selectPlayer',
    });
  },

  selectPlayer: (playerId: string) => {
    const state = get();
    if (state.phase !== 'selectPlayer') return;

    const selectedPlayer = state.playerHand.find(p => p.id === playerId);
    if (!selectedPlayer) return;

    // 선택하지 않은 선수들은 핸드에 유지
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

    // 최대 5장까지만 선택 가능
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

    // 선택한 카드 제거
    const remainingHand = state.actionHand.filter(c => !c.selected);
    const discardCount = state.selectedActionCards.length;

    // 새 카드 뽑기
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

    // 선택한 카드로 모드 판정
    const modeResult = evaluateActionMode(state.selectedActionCards);

    // 확률 기반 플레이 실행
    const playResult = executePlay(modeResult, state.selectedPlayer, state.bases, state.outs, state.isFirstAtBat);

    const isOut = playResult.baseballResult === 'out';
    let newOuts = state.outs;
    let newPhase: GamePhase = 'showResult';
    let updatedPlayerDeck = state.playerDeck;
    let newBases: BaseState = state.bases;
    let newPitcherPoints = state.pitcherPoints;

    if (isOut) {
      newOuts += 1;
      // 사용한 카드를 큐 뒤로
      const revealedPlayer = { ...state.selectedPlayer, revealed: true };
      updatedPlayerDeck = addToBottom(state.playerDeck, revealedPlayer);
    } else {
      // 안타 시 베이스 상태 업데이트
      const advanceCount = playResult.baseballResult === 'single' ? 1
        : playResult.baseballResult === 'double' ? 2
        : playResult.baseballResult === 'triple' ? 3 : 4;
      const advanceResult = advanceRunners(state.bases, state.selectedPlayer, advanceCount);
      newBases = advanceResult.newBases;

      // 득점한 주자들을 덱 뒤로
      advanceResult.scoredRunners.forEach(runner => {
        const revealedRunner = { ...runner, revealed: true };
        updatedPlayerDeck = addToBottom(updatedPlayerDeck, revealedRunner);
      });

      // 포인트 획득 -> 투수 포인트에 누적
      newPitcherPoints += playResult.pointsEarned;
    }

    // 투수 강판 체크
    const currentPitcher = state.currentPitcher;
    if (currentPitcher && newPitcherPoints >= currentPitcher.targetPoints) {
      newPhase = 'pitcherDefeated';
    }

    // 사용한 카드 제거
    const usedCardIds = new Set(state.selectedActionCards.map(c => c.id));
    const remainingActionHand = state.actionHand.filter(c => !usedCardIds.has(c.id));

    set({
      playerDeck: updatedPlayerDeck,
      bases: newBases,
      score: state.score + playResult.runsScored,
      totalPoints: state.totalPoints + playResult.pointsEarned,
      pitcherPoints: newPitcherPoints,
      outs: newOuts,
      currentResult: playResult,
      phase: newPhase,
      actionHand: remainingActionHand,
      selectedActionCards: [],
    });
  },

  nextTurn: () => {
    const state = get();

    // 3아웃이면 리셋
    if (state.outs >= 3) {
      get().resetAfterOuts();
      return;
    }

    // 선수 카드: 현재 핸드에 1장 추가
    let newPlayerDeck = state.playerDeck;

    if (newPlayerDeck.length === 0) {
      const freshPlayers = starterPlayers.map(p => ({ ...p, revealed: false }));
      newPlayerDeck = shuffle(freshPlayers);
    }

    const { drawn, remaining } = drawPlayers(newPlayerDeck, 1);
    const drawnPlayer = drawn.map(p => ({ ...p, revealed: true }));
    newPlayerDeck = remaining;

    const newPlayerHand = [...state.playerHand, ...drawnPlayer];

    // 액션 카드 채우기
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

    // 루상 주자들을 덱 하단으로
    let newPlayerDeck = state.playerDeck;
    if (state.bases.third) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.third, revealed: true });
    if (state.bases.second) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.second, revealed: true });
    if (state.bases.first) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.first, revealed: true });

    // 선수 패 유지, 부족하면 채우기
    const currentPlayerHand = state.playerHand;
    const needToDraw = 3 - currentPlayerHand.length;
    let newPlayerHand = currentPlayerHand;

    if (needToDraw > 0) {
      const { drawn, remaining } = drawPlayers(newPlayerDeck, needToDraw);
      newPlayerHand = [...currentPlayerHand, ...drawn.map(p => ({ ...p, revealed: true }))];
      newPlayerDeck = remaining;
    }

    // 액션덱 재셔플
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
    });
  },

  nextPitcher: () => {
    const state = get();
    const currentPitcher = state.currentPitcher;

    // 현재 투수를 격파 목록에 추가
    const defeatedPitchers = currentPitcher
      ? [...state.defeatedPitchers, currentPitcher]
      : state.defeatedPitchers;

    // 다음 투수 가져오기
    if (state.pitcherLineup.length === 0) {
      // 모든 투수 강판 -> 게임 승리
      set({
        defeatedPitchers,
        currentPitcher: null,
        phase: 'gameEnd',
      });
      return;
    }

    const [nextPitcher, ...remainingPitchers] = state.pitcherLineup;

    // 루상 주자들을 덱 하단으로
    let newPlayerDeck = state.playerDeck;
    if (state.bases.third) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.third, revealed: true });
    if (state.bases.second) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.second, revealed: true });
    if (state.bases.first) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.first, revealed: true });

    // 선수 패 유지, 부족하면 채우기
    const currentPlayerHand = state.playerHand;
    const needToDraw = 3 - currentPlayerHand.length;
    let newPlayerHand = currentPlayerHand;

    if (needToDraw > 0) {
      const { drawn, remaining } = drawPlayers(newPlayerDeck, needToDraw);
      newPlayerHand = [...currentPlayerHand, ...drawn.map(p => ({ ...p, revealed: true }))];
      newPlayerDeck = remaining;
    }

    // 액션덱 재셔플
    const reshuffledAction = shuffle(createActionDeck());
    const { drawn: actionHand, remaining: actionDeck } = drawActionCards(reshuffledAction, HAND_SIZE);

    set({
      currentPitcher: nextPitcher,
      pitcherLineup: remainingPitchers,
      defeatedPitchers,
      pitcherPoints: 0,
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
    });
  },

  resetGame: () => {
    set(initialState);
  },
}));
