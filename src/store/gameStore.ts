import { create } from 'zustand';
import { GameState, GamePhase, PlayerCard, ActionCard, BaseState } from '../game/types';
import { shuffle, drawPlayers, drawAction, addToBottom, returnToDeck } from '../game/deck';
import { resolveAction, emptyBases } from '../game/scoring';
import { starterPlayers } from '../data/starterPlayers';
import { starterActions } from '../data/starterActions';

interface GameActions {
  // 게임 초기화
  initGame: () => void;
  
  // 선수 선택
  selectPlayer: (playerId: string) => void;
  
  // 다음 턴 (액션 카드 처리 후)
  nextTurn: () => void;
  
  // 새 이닝 시작
  startNewInning: () => void;
  
  // 액션 카드 드롭 (버리기)
  dropAction: () => void;
  
  // 게임 리셋
  resetGame: () => void;
}

const INITIAL_DROPS_PER_INNING = 2;
const TARGET_SCORE = 3; // 이닝당 목표 점수

const initialState: GameState = {
  currentInning: 1,
  outs: 0,
  score: 0,
  bases: emptyBases(),
  playerDeck: [],
  playerHand: [],
  playerDiscard: [],
  actionDeck: [],
  currentAction: null,
  phase: 'selectPlayer',
  targetScore: TARGET_SCORE,
  dropsRemaining: INITIAL_DROPS_PER_INNING,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  initGame: () => {
    // 선수덱 셔플 (최초 1회만, 이후 예측 가능)
    const shuffledPlayers = shuffle([...starterPlayers]);
    // 액션덱 셔플
    const shuffledActions = shuffle([...starterActions]);
    
    // 선수 3장 드로우
    const { drawn, remaining } = drawPlayers(shuffledPlayers, 3);
    
    set({
      ...initialState,
      playerDeck: remaining,
      playerHand: drawn,
      actionDeck: shuffledActions,
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
    
    // 액션 카드 드로우
    const { drawn: actionCard, remaining: actionRemaining } = drawAction(state.actionDeck);
    
    if (!actionCard) {
      // 액션덱이 비었으면 이닝 종료
      set({
        phase: 'inningEnd',
        playerDeck: newPlayerDeck,
        playerHand: [],
      });
      return;
    }
    
    // 액션 결과 계산
    const result = resolveAction(actionCard, selectedPlayer, state.bases);
    
    // 아웃 처리
    let newOuts = state.outs;
    let newPhase: GamePhase = 'showAction';
    let updatedPlayerDeck = newPlayerDeck;
    
    if (result.isOut) {
      newOuts += 1;
      // 아웃된 선수는 덱 하단으로
      updatedPlayerDeck = addToBottom(newPlayerDeck, selectedPlayer);
      
      if (newOuts >= 3) {
        newPhase = 'inningEnd';
      }
    }
    
    set({
      playerDeck: updatedPlayerDeck,
      playerHand: [],
      actionDeck: actionRemaining,
      currentAction: actionCard,
      bases: result.newBases,
      score: state.score + result.runsScored,
      outs: newOuts,
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
      // 선수덱이 비었으면 게임 종료 (또는 덱 재구성)
      set({ phase: 'gameEnd' });
      return;
    }
    
    set({
      playerHand: drawn,
      playerDeck: remaining,
      currentAction: null,
      phase: 'selectPlayer',
    });
  },

  startNewInning: () => {
    const state = get();
    
    // 루상 주자들을 덱으로 되돌림
    const runnersToReturn: PlayerCard[] = [];
    if (state.bases.first) runnersToReturn.push(state.bases.first);
    if (state.bases.second) runnersToReturn.push(state.bases.second);
    if (state.bases.third) runnersToReturn.push(state.bases.third);
    
    // 액션덱 재셔플
    const reshuffledActions = shuffle([...starterActions]);
    
    // 선수덱 재구성 (루상 주자 + 현재 덱)
    const newPlayerDeck = [...runnersToReturn, ...state.playerDeck];
    
    // 새 손패 드로우
    const { drawn, remaining } = drawPlayers(newPlayerDeck, 3);
    
    set({
      currentInning: state.currentInning + 1,
      outs: 0,
      bases: emptyBases(),
      playerDeck: remaining,
      playerHand: drawn,
      actionDeck: reshuffledActions,
      currentAction: null,
      phase: 'selectPlayer',
      dropsRemaining: INITIAL_DROPS_PER_INNING,
    });
  },

  dropAction: () => {
    const state = get();
    if (state.dropsRemaining <= 0) return;
    if (state.phase !== 'selectPlayer') return;
    
    // 현재 액션 카드 버리고 새로 뽑기
    const { drawn: newAction, remaining } = drawAction(state.actionDeck);
    
    set({
      actionDeck: remaining,
      currentAction: newAction,
      dropsRemaining: state.dropsRemaining - 1,
    });
  },

  resetGame: () => {
    set(initialState);
  },
}));
