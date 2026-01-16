import { create } from 'zustand';
import { GameState, GamePhase, PlayerCard, PokerCard, PlayResult, BaseState } from '../game/types';
import { shuffle, drawPlayers, addToBottom, returnToDeck, createPokerDeck, drawPokerCards, toggleCardSelection, getSelectedCards } from '../game/deck';
import { emptyBases, executePlay, advanceRunners } from '../game/scoring';
import { evaluateHand } from '../game/poker';
import { starterPlayers } from '../data/starterPlayers';

interface GameActions {
  // 게임 초기화
  initGame: () => void;
  
  // 선수 선택
  selectPlayer: (playerId: string) => void;
  
  // 트럼프 카드 선택 토글
  togglePokerCard: (cardId: string) => void;
  
  // 선택한 카드로 플레이 실행
  executeSelectedPlay: () => void;
  
  // 다음 턴으로 진행
  nextTurn: () => void;
  
  // 새 이닝 시작
  startNewInning: () => void;
  
  // 카드 다시 뽑기
  redrawCards: () => void;
  
  // 게임 리셋
  resetGame: () => void;
}

const MAX_INNINGS = 9;
const INITIAL_REDRAWS = 2;
const BASE_TARGET_POINTS = 100; // 기본 목표 포인트

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
  pokerDeck: [],
  pokerHand: [],
  selectedPokerCards: [],
  currentResult: null,
  phase: 'selectPlayer',
  targetPoints: BASE_TARGET_POINTS,
  inningPoints: 0,
  redrawsRemaining: INITIAL_REDRAWS,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  initGame: () => {
    // 선수덱 셔플 (최초 1회만, 이후 예측 가능)
    const shuffledPlayers = shuffle([...starterPlayers]);
    
    // 트럼프덱 생성 및 셔플
    const shuffledPoker = shuffle(createPokerDeck());
    
    // 선수 3장 드로우
    const { drawn: playerHand, remaining: playerDeck } = drawPlayers(shuffledPlayers, 3);
    
    set({
      ...initialState,
      playerDeck,
      playerHand,
      pokerDeck: shuffledPoker,
      phase: 'selectPlayer',
    });
  },

  selectPlayer: (playerId: string) => {
    const state = get();
    if (state.phase !== 'selectPlayer') return;
    
    // 선택한 선수 찾기
    const selectedPlayer = state.playerHand.find(p => p.id === playerId);
    if (!selectedPlayer) return;
    
    // 선택하지 않은 선수들은 덱 상단으로 되돌림
    const notSelected = state.playerHand.filter(p => p.id !== playerId);
    const newPlayerDeck = returnToDeck(state.playerDeck, notSelected);
    
    // 트럼프 카드 5장 드로우
    const { drawn: pokerHand, remaining: pokerDeck } = drawPokerCards(state.pokerDeck, 5);
    
    set({
      selectedPlayer,
      playerDeck: newPlayerDeck,
      playerHand: [],
      pokerHand,
      pokerDeck,
      selectedPokerCards: [],
      phase: 'selectCards',
    });
  },

  togglePokerCard: (cardId: string) => {
    const state = get();
    if (state.phase !== 'selectCards') return;
    
    const newPokerHand = toggleCardSelection(state.pokerHand, cardId);
    const selectedCards = getSelectedCards(newPokerHand);
    
    set({
      pokerHand: newPokerHand,
      selectedPokerCards: selectedCards,
    });
  },

  executeSelectedPlay: () => {
    const state = get();
    if (state.phase !== 'selectCards') return;
    if (!state.selectedPlayer) return;
    
    // 선택된 카드가 없으면 전체 핸드로 판정
    const cardsToEvaluate = state.selectedPokerCards.length > 0 
      ? state.selectedPokerCards 
      : state.pokerHand;
    
    // 족보 판정
    const handResult = evaluateHand(cardsToEvaluate);
    
    // 플레이 실행
    const playResult = executePlay(handResult, state.selectedPlayer, state.bases);
    
    // 결과 처리
    const isOut = playResult.baseballResult === 'out';
    let newOuts = state.outs;
    let newPhase: GamePhase = 'showResult';
    let updatedPlayerDeck = state.playerDeck;
    let newBases: BaseState = state.bases;
    
    if (isOut) {
      newOuts += 1;
      // 아웃된 선수는 덱 하단으로
      updatedPlayerDeck = addToBottom(state.playerDeck, state.selectedPlayer);
      
      if (newOuts >= 3) {
        newPhase = 'inningEnd';
      }
    } else {
      // 안타 시 베이스 상태 업데이트
      const advanceCount = playResult.baseballResult === 'single' ? 1 
        : playResult.baseballResult === 'double' ? 2
        : playResult.baseballResult === 'triple' ? 3
        : 4;
      
      // 진루 처리
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
    
    if (state.phase === 'inningEnd') {
      return; // 이닝 종료 상태에서는 새 이닝 시작 필요
    }
    
    // 새로운 선수 3장 드로우
    const { drawn, remaining } = drawPlayers(state.playerDeck, 3);
    
    if (drawn.length === 0) {
      // 선수덱이 비었으면 셔플하지 않고 처음부터 다시 (예측 가능)
      const recycledDeck = shuffle([...starterPlayers]);
      const { drawn: newDrawn, remaining: newRemaining } = drawPlayers(recycledDeck, 3);
      
      set({
        playerHand: newDrawn,
        playerDeck: newRemaining,
        selectedPlayer: null,
        pokerHand: [],
        selectedPokerCards: [],
        currentResult: null,
        phase: 'selectPlayer',
      });
      return;
    }
    
    set({
      playerHand: drawn,
      playerDeck: remaining,
      selectedPlayer: null,
      pokerHand: [],
      selectedPokerCards: [],
      currentResult: null,
      phase: 'selectPlayer',
    });
  },

  startNewInning: () => {
    const state = get();
    
    // 9이닝 종료 체크
    if (state.currentInning >= state.maxInnings) {
      set({ phase: 'gameEnd' });
      return;
    }
    
    // 루상 주자들을 덱 하단으로 되돌림
    let newPlayerDeck = state.playerDeck;
    if (state.bases.third) newPlayerDeck = addToBottom(newPlayerDeck, state.bases.third);
    if (state.bases.second) newPlayerDeck = addToBottom(newPlayerDeck, state.bases.second);
    if (state.bases.first) newPlayerDeck = addToBottom(newPlayerDeck, state.bases.first);
    
    // 트럼프덱 재셔플
    const reshuffledPoker = shuffle(createPokerDeck());
    
    // 새 손패 드로우
    const { drawn, remaining } = drawPlayers(newPlayerDeck, 3);
    
    // 다음 이닝 목표 포인트 증가
    const newTargetPoints = BASE_TARGET_POINTS + (state.currentInning * 50);
    
    set({
      currentInning: state.currentInning + 1,
      outs: 0,
      bases: emptyBases(),
      playerDeck: remaining,
      playerHand: drawn,
      selectedPlayer: null,
      pokerDeck: reshuffledPoker,
      pokerHand: [],
      selectedPokerCards: [],
      currentResult: null,
      phase: 'selectPlayer',
      targetPoints: newTargetPoints,
      inningPoints: 0,
      redrawsRemaining: INITIAL_REDRAWS,
    });
  },

  redrawCards: () => {
    const state = get();
    if (state.redrawsRemaining <= 0) return;
    if (state.phase !== 'selectCards') return;
    
    // 덱에 카드가 충분한지 확인
    if (state.pokerDeck.length < 5) {
      // 덱 재셔플
      const reshuffledPoker = shuffle(createPokerDeck());
      const { drawn, remaining } = drawPokerCards(reshuffledPoker, 5);
      
      set({
        pokerDeck: remaining,
        pokerHand: drawn,
        selectedPokerCards: [],
        redrawsRemaining: state.redrawsRemaining - 1,
      });
      return;
    }
    
    // 새 카드 5장 드로우
    const { drawn, remaining } = drawPokerCards(state.pokerDeck, 5);
    
    set({
      pokerDeck: remaining,
      pokerHand: drawn,
      selectedPokerCards: [],
      redrawsRemaining: state.redrawsRemaining - 1,
    });
  },

  resetGame: () => {
    set(initialState);
  },
}));
