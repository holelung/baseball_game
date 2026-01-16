import { create } from 'zustand';
import { GameState, GamePhase, PlayerCard, PokerCard, PlayResult, BaseState } from '../game/types';
import { shuffle, drawPlayers, addToBottom, returnToDeck, createPokerDeck, drawPokerCards, toggleCardSelection, getSelectedCards } from '../game/deck';
import { emptyBases, executePlay, advanceRunners } from '../game/scoring';
import { evaluateHand } from '../game/poker';
import { starterPlayers } from '../data/starterPlayers';

interface GameActions {
  initGame: () => void;
  selectPlayer: (playerId: string) => void;
  togglePokerCard: (cardId: string) => void;
  discardAndDraw: () => void;      // 선택한 카드 버리고 새로 뽑기
  executeSelectedPlay: () => void;
  nextTurn: () => void;
  startNewInning: () => void;
  resetGame: () => void;
}

const MAX_INNINGS = 9;
const INITIAL_DISCARDS = 3;          // 이닝당 버리기 횟수
const MAX_DISCARD_COUNT = 5;         // 한번에 최대 버리기 장수
const HAND_SIZE = 8;                 // 트럼프 핸드 크기
const BASE_TARGET_POINTS = 100;

const initialState: GameState = {
  currentInning: 1,
  maxInnings: MAX_INNINGS,
  outs: 0,
  score: 0,
  totalPoints: 0,
  bases: emptyBases(),
  playerDeck: [],
  playerHand: [],
  selectedPlayer: null,
  isFirstAtBat: true,
  pokerDeck: [],
  pokerHand: [],
  selectedPokerCards: [],
  currentResult: null,
  phase: 'selectPlayer',
  targetPoints: BASE_TARGET_POINTS,
  inningPoints: 0,
  discardsRemaining: INITIAL_DISCARDS,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  initGame: () => {
    // 선수 카드 초기화: 모두 revealed: false (순서 모름)
    const freshPlayers = starterPlayers.map(p => ({ ...p, revealed: false }));
    const shuffledPlayers = shuffle(freshPlayers);
    const shuffledPoker = shuffle(createPokerDeck());
    
    // 최초 3장 드로우 - 핸드에 온 카드는 revealed: true
    const { drawn, remaining: playerDeck } = drawPlayers(shuffledPlayers, 3);
    const playerHand = drawn.map(p => ({ ...p, revealed: true }));
    // 트럼프 8장 드로우
    const { drawn: pokerHand, remaining: pokerDeck } = drawPokerCards(shuffledPoker, HAND_SIZE);
    
    set({
      ...initialState,
      playerDeck,
      playerHand,
      pokerDeck,
      pokerHand,
      isFirstAtBat: true,
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
      playerHand: remainingHand,  // 남은 2장 유지
      selectedPokerCards: [],
      phase: 'selectCards',
    });
  },

  togglePokerCard: (cardId: string) => {
    const state = get();
    if (state.phase !== 'selectCards') return;
    
    const newPokerHand = toggleCardSelection(state.pokerHand, cardId);
    const selectedCards = getSelectedCards(newPokerHand);
    
    // 최대 5장까지만 선택 가능
    if (selectedCards.length > MAX_DISCARD_COUNT) return;
    
    set({
      pokerHand: newPokerHand,
      selectedPokerCards: selectedCards,
    });
  },

  discardAndDraw: () => {
    const state = get();
    if (state.discardsRemaining <= 0) return;
    if (state.phase !== 'selectCards') return;
    if (state.selectedPokerCards.length === 0) return;
    if (state.selectedPokerCards.length > MAX_DISCARD_COUNT) return;
    
    // 선택한 카드 제거
    const remainingHand = state.pokerHand.filter(c => !c.selected);
    const discardCount = state.selectedPokerCards.length;
    
    // 새 카드 뽑기
    let newPokerDeck = state.pokerDeck;
    let drawnCards: PokerCard[] = [];
    
    if (newPokerDeck.length < discardCount) {
      // 덱이 부족하면 재셔플
      newPokerDeck = shuffle(createPokerDeck());
    }
    
    const drawResult = drawPokerCards(newPokerDeck, discardCount);
    drawnCards = drawResult.drawn;
    newPokerDeck = drawResult.remaining;
    
    const newHand = [...remainingHand, ...drawnCards].map(c => ({ ...c, selected: false }));
    
    set({
      pokerDeck: newPokerDeck,
      pokerHand: newHand,
      selectedPokerCards: [],
      discardsRemaining: state.discardsRemaining - 1,
    });
  },

  executeSelectedPlay: () => {
    const state = get();
    if (state.phase !== 'selectCards') return;
    if (!state.selectedPlayer) return;
    if (state.selectedPokerCards.length === 0) return; // 카드 선택 필수
    
    // 선택한 카드로 족보 판정
    const handResult = evaluateHand(state.selectedPokerCards);
    
    // 확률 기반 플레이 실행
    const playResult = executePlay(handResult, state.selectedPlayer, state.bases);
    
    const isOut = playResult.baseballResult === 'out';
    let newOuts = state.outs;
    let newPhase: GamePhase = 'showResult';
    let updatedPlayerDeck = state.playerDeck;
    let newBases: BaseState = state.bases;
    
    if (isOut) {
      newOuts += 1;
      // 사용한 카드를 큐 뒤로 보낼 때 revealed: true
      const revealedPlayer = { ...state.selectedPlayer, revealed: true };
      updatedPlayerDeck = addToBottom(state.playerDeck, revealedPlayer);
      if (newOuts >= 3) {
        newPhase = 'inningEnd';
      }
    } else {
      // 안타 시 베이스 상태 업데이트
      const advanceCount = playResult.baseballResult === 'single' ? 1 
        : playResult.baseballResult === 'double' ? 2
        : playResult.baseballResult === 'triple' ? 3 : 4;
      const advanceResult = advanceRunners(state.bases, state.selectedPlayer, advanceCount);
      newBases = advanceResult.newBases;
      
      // 득점한 주자들을 덱 뒤로 보냄 (revealed: true)
      advanceResult.scoredRunners.forEach(runner => {
        const revealedRunner = { ...runner, revealed: true };
        updatedPlayerDeck = addToBottom(updatedPlayerDeck, revealedRunner);
      });
    }
    
    // 사용한 카드 제거, 남은 카드 유지
    const usedCardIds = new Set(state.selectedPokerCards.map(c => c.id));
    const remainingPokerHand = state.pokerHand.filter(c => !usedCardIds.has(c.id));
    
    set({
      playerDeck: updatedPlayerDeck,
      bases: newBases,
      score: state.score + playResult.runsScored,
      totalPoints: state.totalPoints + playResult.pointsEarned,
      inningPoints: state.inningPoints + playResult.pointsEarned,
      outs: newOuts,
      currentResult: playResult,
      phase: newPhase,
      pokerHand: remainingPokerHand,  // 남은 카드 유지
      selectedPokerCards: [],
    });
  },

  nextTurn: () => {
    const state = get();
    if (state.phase === 'inningEnd') return;
    
    // 선수 카드: 현재 핸드(2장)에 1장 추가해서 3장 유지
    let newPlayerDeck = state.playerDeck;
    
    if (newPlayerDeck.length === 0) {
      // 덱이 비었으면 재구성 (이미 순환한 카드들이므로 revealed 유지)
      const freshPlayers = starterPlayers.map(p => ({ ...p, revealed: false }));
      newPlayerDeck = shuffle(freshPlayers);
    }
    
    const { drawn, remaining } = drawPlayers(newPlayerDeck, 1);
    // 핸드에 뽑힌 카드는 revealed: true
    const drawnPlayer = drawn.map(p => ({ ...p, revealed: true }));
    newPlayerDeck = remaining;
    
    // 기존 핸드(2장) + 새로 뽑은 1장 = 3장
    const newPlayerHand = [...state.playerHand, ...drawnPlayer];
    
    // 트럼프 카드: 남은 카드 유지 + 부족한 만큼만 채우기
    const currentPokerHand = state.pokerHand.map(c => ({ ...c, selected: false }));
    const needToDraw = HAND_SIZE - currentPokerHand.length;
    
    let newPokerDeck = state.pokerDeck;
    let newPokerHand = currentPokerHand;
    
    if (needToDraw > 0) {
      if (newPokerDeck.length < needToDraw) {
        newPokerDeck = shuffle(createPokerDeck());
      }
      const { drawn: drawnPoker, remaining: remainingDeck } = drawPokerCards(newPokerDeck, needToDraw);
      newPokerHand = [...currentPokerHand, ...drawnPoker];
      newPokerDeck = remainingDeck;
    }
    
    set({
      playerHand: newPlayerHand,
      playerDeck: newPlayerDeck,
      selectedPlayer: null,
      pokerHand: newPokerHand,
      pokerDeck: newPokerDeck,
      selectedPokerCards: [],
      currentResult: null,
      isFirstAtBat: false,
      phase: 'selectPlayer',
    });
  },

  startNewInning: () => {
    const state = get();
    
    if (state.currentInning >= state.maxInnings) {
      set({ phase: 'gameEnd' });
      return;
    }
    
    // 루상 주자들을 덱 하단으로 (revealed: true 유지)
    let newPlayerDeck = state.playerDeck;
    if (state.bases.third) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.third, revealed: true });
    if (state.bases.second) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.second, revealed: true });
    if (state.bases.first) newPlayerDeck = addToBottom(newPlayerDeck, { ...state.bases.first, revealed: true });
    
    // 선수 패는 유지하고, 부족한 만큼만 뽑기 (보통 2장 → 1장 뽑아서 3장)
    const currentPlayerHand = state.playerHand;
    const needToDraw = 3 - currentPlayerHand.length;
    let newPlayerHand = currentPlayerHand;
    
    if (needToDraw > 0) {
      const { drawn, remaining } = drawPlayers(newPlayerDeck, needToDraw);
      newPlayerHand = [...currentPlayerHand, ...drawn.map(p => ({ ...p, revealed: true }))];
      newPlayerDeck = remaining;
    }
    
    // 트럼프덱 재셔플
    const reshuffledPoker = shuffle(createPokerDeck());
    const { drawn: pokerHand, remaining: pokerDeck } = drawPokerCards(reshuffledPoker, HAND_SIZE);
    
    const newTargetPoints = BASE_TARGET_POINTS + (state.currentInning * 50);
    
    set({
      currentInning: state.currentInning + 1,
      outs: 0,
      bases: emptyBases(),
      playerDeck: newPlayerDeck,
      playerHand: newPlayerHand,
      selectedPlayer: null,
      isFirstAtBat: true,
      pokerDeck,
      pokerHand,
      selectedPokerCards: [],
      currentResult: null,
      phase: 'selectPlayer',
      targetPoints: newTargetPoints,
      inningPoints: 0,
      discardsRemaining: INITIAL_DISCARDS,
    });
  },

  resetGame: () => {
    set(initialState);
  },
}));
