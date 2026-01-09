import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Diamond } from './Diamond';
import { ScoreBoard } from './ScoreBoard';
import { Hand } from './Hand';
import { ActionCardComponent } from './Card';

export function GameBoard() {
  const {
    currentInning,
    score,
    outs,
    bases,
    playerHand,
    currentAction,
    phase,
    targetScore,
    dropsRemaining,
    actionDeck,
    initGame,
    selectPlayer,
    nextTurn,
    startNewInning,
    resetGame,
  } = useGameStore();

  // 게임 시작 시 초기화
  useEffect(() => {
    initGame();
  }, [initGame]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 상단: 점수판 */}
      <ScoreBoard
        inning={currentInning}
        score={score}
        outs={outs}
        targetScore={targetScore}
        dropsRemaining={dropsRemaining}
      />

      {/* 중앙: 다이아몬드 + 액션 카드 */}
      <div className="flex justify-center items-center gap-8">
        <Diamond bases={bases} />
        
        {/* 액션 카드 영역 */}
        <div className="flex flex-col items-center gap-2">
          {currentAction ? (
            <ActionCardComponent action={currentAction} />
          ) : (
            <div className="w-32 h-44 rounded-xl border-2 border-dashed border-gray-500 flex items-center justify-center">
              <span className="text-gray-500 text-sm">액션 대기</span>
            </div>
          )}
          <div className="text-gray-400 text-sm">
            남은 액션: {actionDeck.length}장
          </div>
        </div>
      </div>

      {/* 하단: 손패 또는 결과 표시 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        {phase === 'selectPlayer' && (
          <Hand
            players={playerHand}
            onSelectPlayer={selectPlayer}
          />
        )}

        {phase === 'showAction' && currentAction && (
          <div className="text-center space-y-4">
            <div className="text-xl text-white">
              {currentAction.type.includes('out') || currentAction.type === 'strikeout'
                ? '😢 아웃!'
                : '🎉 안타!'}
            </div>
            <button
              onClick={nextTurn}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              다음 타자
            </button>
          </div>
        )}

        {phase === 'inningEnd' && (
          <div className="text-center space-y-4">
            <div className="text-2xl text-white font-bold">
              📢 {currentInning}이닝 종료!
            </div>
            <div className="text-gray-300">
              이번 이닝 득점: {score}점
            </div>
            {currentInning < 9 ? (
              <button
                onClick={startNewInning}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                다음 이닝 시작
              </button>
            ) : (
              <div className="space-y-2">
                <div className="text-xl text-yellow-400">🏆 경기 종료!</div>
                <div className="text-gray-300">최종 점수: {score}점</div>
                <button
                  onClick={() => {
                    resetGame();
                    initGame();
                  }}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  다시 시작
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'gameEnd' && (
          <div className="text-center space-y-4">
            <div className="text-2xl text-red-400 font-bold">
              게임 오버
            </div>
            <button
              onClick={() => {
                resetGame();
                initGame();
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              다시 시작
            </button>
          </div>
        )}
      </div>

      {/* 디버그 정보 (개발용) */}
      <details className="text-gray-500 text-xs">
        <summary className="cursor-pointer">디버그 정보</summary>
        <pre className="mt-2 p-2 bg-gray-900 rounded overflow-auto">
          {JSON.stringify({
            phase,
            outs,
            playerDeckSize: useGameStore.getState().playerDeck.length,
            actionDeckSize: actionDeck.length,
            runnersOnBase: {
              first: bases.first?.name,
              second: bases.second?.name,
              third: bases.third?.name,
            },
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
