import { useEffect, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { Diamond } from './Diamond';
import { ScoreBoard } from './ScoreBoard';
import { Hand } from './Hand';
import { PokerHand } from './PokerCard';
import { HandDisplay, AvailableHandsGuide } from './HandDisplay';
import { PlayerCardComponent } from './Card';
import { evaluateHand } from '../game/poker';

export function GameBoard() {
  const {
    currentInning,
    maxInnings,
    score,
    totalPoints,
    inningPoints,
    targetPoints,
    outs,
    bases,
    playerHand,
    playerDeck,
    selectedPlayer,
    isFirstAtBat,
    pokerHand,
    pokerDeck,
    selectedPokerCards,
    currentResult,
    phase,
    discardsRemaining,
    initGame,
    selectPlayer,
    togglePokerCard,
    discardAndDraw,
    executeSelectedPlay,
    nextTurn,
    startNewInning,
    resetGame,
  } = useGameStore();

  useEffect(() => {
    initGame();
  }, [initGame]);

  // 현재 핸드로 족보 계산 (8장)
  const currentHandResult = useMemo(() => {
    if (pokerHand.length === 0) return null;
    return evaluateHand(pokerHand);
  }, [pokerHand]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* 상단: 점수판 */}
      <ScoreBoard
        inning={currentInning}
        maxInnings={maxInnings}
        score={score}
        totalPoints={totalPoints}
        inningPoints={inningPoints}
        targetPoints={targetPoints}
        outs={outs}
        discardsRemaining={discardsRemaining}
      />

      {/* 중앙: 다이아몬드 + 선택된 선수 */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
        <Diamond bases={bases} />
        
        <div className="flex flex-col items-center gap-2">
          <div className="text-gray-400 text-sm">현재 타자</div>
          {selectedPlayer ? (
            <PlayerCardComponent player={selectedPlayer} disabled />
          ) : (
            <div className="w-28 h-36 rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center">
              <span className="text-gray-500 text-sm text-center">선수를<br/>선택하세요</span>
            </div>
          )}
        </div>
        
        <div className="text-center text-gray-400 text-xs sm:text-sm">
          <div>선수덱: {playerDeck.length}장</div>
          <div>트럼프덱: {pokerDeck.length}장</div>
        </div>
      </div>

      {/* 하단: 게임 인터페이스 */}
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
        {/* 선수 선택 단계 */}
        {phase === 'selectPlayer' && (
          <Hand
            players={playerHand}
            onSelectPlayer={selectPlayer}
          />
        )}

        {/* 카드 선택 단계 */}
        {phase === 'selectCards' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-white text-lg font-semibold mb-1">
                트럼프 카드 (8장)
              </h3>
              <p className="text-gray-400 text-sm">
                버릴 카드를 선택하세요. 남은 카드로 족보가 판정됩니다.
              </p>
            </div>
            
            {/* 트럼프 카드 핸드 */}
            <PokerHand 
              cards={pokerHand}
              onCardClick={togglePokerCard}
            />
            
            {/* 현재 족보 결과 미리보기 */}
            <HandDisplay 
              handResult={currentHandResult} 
              batter={selectedPlayer}
            />
            
            {/* 족보 가이드 */}
            <AvailableHandsGuide selectedCount={selectedPokerCards.length} />
            
            {/* 액션 버튼들 */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <button
                onClick={executeSelectedPlay}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                플레이!
              </button>
              
              <button
                onClick={discardAndDraw}
                disabled={discardsRemaining <= 0 || selectedPokerCards.length === 0 || selectedPokerCards.length > 5}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  discardsRemaining > 0 && selectedPokerCards.length > 0 && selectedPokerCards.length <= 5
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                버리기 ({selectedPokerCards.length}장) - {discardsRemaining}회 남음
              </button>
            </div>
          </div>
        )}

        {/* 결과 표시 단계 */}
        {phase === 'showResult' && currentResult && (
          <div className="text-center space-y-4">
            <div className={`text-xl sm:text-2xl font-bold ${
              currentResult.baseballResult === 'out' 
                ? 'text-red-400' 
                : currentResult.baseballResult === 'homerun'
                  ? 'text-yellow-400'
                  : 'text-green-400'
            }`}>
              {currentResult.description}
            </div>
            
            {currentResult.wasLucky && (
              <div className="text-yellow-300 animate-pulse">
                Lucky Hit!
              </div>
            )}
            
            <HandDisplay handResult={currentResult.handResult} />
            
            <button
              onClick={nextTurn}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              다음 타자
            </button>
          </div>
        )}

        {/* 이닝 종료 */}
        {phase === 'inningEnd' && (
          <div className="text-center space-y-4">
            <div className="text-2xl text-white font-bold">
              {currentInning}이닝 종료!
            </div>
            <div className="space-y-2 text-gray-300">
              <div>이번 이닝 득점: <span className="text-blue-400 font-bold">{score}점</span></div>
              <div>이번 이닝 포인트: <span className="text-green-400 font-bold">{inningPoints}P</span></div>
              <div className={inningPoints >= targetPoints ? 'text-green-400' : 'text-red-400'}>
                목표: {targetPoints}P - {inningPoints >= targetPoints ? '달성!' : '미달성'}
              </div>
            </div>
            
            {currentInning < maxInnings ? (
              <button
                onClick={startNewInning}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                {currentInning + 1}이닝 시작
              </button>
            ) : (
              <div className="space-y-3">
                <div className="text-xl text-yellow-400">경기 종료!</div>
                <button
                  onClick={startNewInning}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  결과 확인
                </button>
              </div>
            )}
          </div>
        )}

        {/* 게임 종료 */}
        {phase === 'gameEnd' && (
          <div className="text-center space-y-4">
            <div className="text-3xl text-yellow-400 font-bold">
              게임 종료!
            </div>
            <div className="space-y-2">
              <div className="text-2xl text-blue-400">
                최종 득점: {score}점
              </div>
              <div className="text-2xl text-green-400">
                총 포인트: {totalPoints}P
              </div>
            </div>
            <button
              onClick={() => {
                resetGame();
                initGame();
              }}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-lg transition-colors"
            >
              다시 시작
            </button>
          </div>
        )}
      </div>

      {/* 다음 선수 미리보기 */}
      {playerDeck.length > 0 && phase === 'selectPlayer' && (
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-2">다음에 나올 선수:</div>
          <div className="flex gap-2">
            {playerDeck.slice(0, 3).map((player, idx) => (
              <div key={player.id} className="text-gray-500 text-xs">
                {idx + 1}. {player.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 디버그 정보 */}
      <details className="text-gray-500 text-xs">
        <summary className="cursor-pointer">디버그 정보</summary>
        <pre className="mt-2 p-2 bg-gray-900 rounded overflow-auto max-h-48">
          {JSON.stringify({
            phase,
            outs,
            currentInning,
            isFirstAtBat,
            playerDeckSize: playerDeck.length,
            pokerDeckSize: pokerDeck.length,
            pokerHandSize: pokerHand.length,
            selectedCardsCount: selectedPokerCards.length,
            currentHandRank: currentHandResult?.rank,
            hitBonus: currentHandResult?.hitBonus,
            batterAvg: selectedPlayer?.battingAverage,
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
