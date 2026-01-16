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
    const shuffledPlayers = shuffle([...starterPlayers]);
    const shuffledPoker = shuffle(createPokerDeck());
    
    // 최초 3장 드로우
    const { drawn: playerHand, remaining: playerDeck } = drawPlayers(shuffledPlayers, 3);
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
    
    // 전체 핸드로 족보 판정 (8장)
    const handResult = evaluateHand(state.pokerHand);
    
    // 확률 기반 플레이 실행
    const playResult = executePlay(handResult, state.selectedPlayer, state.bases);
    
    const isOut = playResult.baseballResult === 'out';
    let newOuts = state.outs;
    let newPhase: GamePhase = 'showResult';
    let updatedPlayerDeck = state.playerDeck;
    let newBases: BaseState = state.bases;
    
    if (isOut) {
      newOuts += 1;
      updatedPlayerDeck = addToBottom(state.playerDeck, state.selectedPlayer);
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
    }
    
    set({
      playerDeck: updatedPlayerDeck,
      bases: newBases,
      score: state.score + playResult.runsScored,
      totalPoints: state.totalPoints + playResult.pointsEarned,
      inningPoints: state.inningPoints + playResult.pointsEarned,
      outs: newOuts,
      currentResult: playResult,
      phase: newPhase,
    });
  },

  nextTurn: () => {
    const state = get();
    if (state.phase === 'inningEnd') return;
    
    // 선수 카드: 현재 핸드(2장)에 1장 추가해서 3장 유지
    let newPlayerDeck = state.playerDeck;
    let drawnPlayer: PlayerCard[] = [];
    
    if (newPlayerDeck.length === 0) {
      // 덱이 비었으면 재구성
      newPlayerDeck = shuffle([...starterPlayers]);
    }
    
    const { drawn, remaining } = drawPlayers(newPlayerDeck, 1);
    drawnPlayer = drawn;
    newPlayerDeck = remaining;
    
    // 기존 핸드(2장) + 새로 뽑은 1장 = 3장
    const newPlayerHand = [...state.playerHand, ...drawnPlayer];
    
    // 트럼프 카드: 사용한 핸드 버리고 8장 채우기
    let newPokerDeck = state.pokerDeck;
    if (newPokerDeck.length < HAND_SIZE) {
      newPokerDeck = shuffle(createPokerDeck());
    }
    const { drawn: pokerHand, remaining: pokerDeck } = drawPokerCards(newPokerDeck, HAND_SIZE);
    
    set({
      playerHand: newPlayerHand,
      playerDeck: newPlayerDeck,
      selectedPlayer: null,
      pokerHand,
      pokerDeck,
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
    
    // 루상 주자들을 덱 하단으로
    let newPlayerDeck = state.playerDeck;
    if (state.bases.third) newPlayerDeck = addToBottom(newPlayerDeck, state.bases.third);
    if (state.bases.second) newPlayerDeck = addToBottom(newPlayerDeck, state.bases.second);
    if (state.bases.first) newPlayerDeck = addToBottom(newPlayerDeck, state.bases.first);
    
    // 트럼프덱 재셔플
    const reshuffledPoker = shuffle(createPokerDeck());
    const { drawn: pokerHand, remaining: pokerDeck } = drawPokerCards(reshuffledPoker, HAND_SIZE);
    
    // 새 이닝 첫 타석: 3장 드로우
    const { drawn: playerHand, remaining: playerDeckAfter } = drawPlayers(newPlayerDeck, 3);
    
    const newTargetPoints = BASE_TARGET_POINTS + (state.currentInning * 50);
    
    set({
      currentInning: state.currentInning + 1,
      outs: 0,
      bases: emptyBases(),
      playerDeck: playerDeckAfter,
      playerHand,
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
