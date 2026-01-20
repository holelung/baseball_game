import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Diamond } from './Diamond';
import { ScoreBoard, PitcherLineup } from './ScoreBoard';
import { Hand } from './Hand';
import { ActionHand } from './ActionCard';
import { HandDisplay, AvailableHandsGuide } from './HandDisplay';
import { PlayerCardComponent } from './Card';
import { ScoreBreakdown } from './ScoreBreakdown';
import { Shop } from './Shop';
import { getAllShopItems } from '../game/shop';

export function GameBoard() {
  const {
    currentInning,
    score,
    totalPoints,
    gold,
    outs,
    bases,
    currentPitcher,
    pitcherPoints,
    pitcherLineup,
    defeatedPitchers,
    playerHand,
    playerDeck,
    selectedPlayer,
    actionHand,
    actionDeck,
    selectedActionCards,
    currentResult,
    phase,
    discardsRemaining,
    initGame,
    selectPlayer,
    toggleActionCard,
    discardAndDraw,
    executeSelectedPlay,
    nextTurn,
    nextPitcher,
    closeShop,
    resetGame,
  } = useGameStore();

  const [showGuide, setShowGuide] = useState(false);
  const [showDeckQueue, setShowDeckQueue] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  useEffect(() => {
    initGame();
  }, [initGame]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* 상단: 점수판 */}
      <ScoreBoard
        currentInning={currentInning}
        currentPitcher={currentPitcher}
        pitcherPoints={pitcherPoints}
        score={score}
        totalPoints={totalPoints}
        gold={gold}
        outs={outs}
        discardsRemaining={discardsRemaining}
      />

      {/* 투수 라인업 */}
      <PitcherLineup
        defeatedPitchers={defeatedPitchers}
        currentPitcher={currentPitcher}
        remainingPitchers={pitcherLineup}
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
          <button
            onClick={() => setShowDeckQueue(true)}
            className="hover:text-blue-400 underline cursor-pointer"
          >
            선수덱: {playerDeck.length}장 (클릭하여 확인)
          </button>
          <div>액션덱: {actionDeck.length}장</div>
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
                액션 카드 (8장)
              </h3>
              <p className="text-gray-400 text-sm">
                족보에 사용할 카드를 선택하세요 (1~5장)
              </p>
            </div>

            {/* 액션 카드 핸드 */}
            <ActionHand
              cards={actionHand}
              onCardClick={toggleActionCard}
            />

            {/* 선택된 카드 수 표시 */}
            <div className="text-center">
              <span className={`text-lg font-bold ${
                selectedActionCards.length > 0 ? 'text-yellow-400' : 'text-gray-500'
              }`}>
                선택: {selectedActionCards.length}장
              </span>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <button
                onClick={executeSelectedPlay}
                disabled={selectedActionCards.length === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  selectedActionCards.length > 0
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                플레이! ({selectedActionCards.length}장)
              </button>

              <button
                onClick={discardAndDraw}
                disabled={discardsRemaining <= 0 || selectedActionCards.length === 0 || selectedActionCards.length > 5}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  discardsRemaining > 0 && selectedActionCards.length > 0 && selectedActionCards.length <= 5
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                버리고 새로 뽑기 ({selectedActionCards.length}장) - {discardsRemaining}회
              </button>

              <button
                onClick={() => setShowGuide(!showGuide)}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition-colors"
              >
                {showGuide ? '족보 닫기' : '족보 보기'}
              </button>
            </div>

            {/* 족보 가이드 (토글) */}
            {showGuide && <AvailableHandsGuide selectedCount={selectedActionCards.length} />}
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
              {currentResult.baseballResult === 'out'
                ? `${selectedPlayer?.name} - 아웃!`
                : currentResult.baseballResult === 'homerun'
                  ? `${selectedPlayer?.name}의 홈런!`
                  : `${selectedPlayer?.name}의 ${currentResult.modeResult.name}!`
              }
            </div>

            {currentResult.wasLucky && (
              <div className="text-yellow-300 animate-pulse">
                Lucky Hit!
              </div>
            )}

            <HandDisplay modeResult={currentResult.modeResult} batter={selectedPlayer} />

            {/* 점수 계산 분해 */}
            <ScoreBreakdown
              breakdown={currentResult.scoreBreakdown}
              modeResult={currentResult.modeResult}
              isOut={currentResult.baseballResult === 'out'}
              hasSynergy={currentResult.hasSynergy}
              abilityTriggered={currentResult.abilityTriggered}
              abilityDescription={currentResult.abilityDescription}
            />

            {currentResult.runsScored > 0 && (
              <div className="text-green-400 text-lg font-bold animate-bounce">
                {currentResult.runsScored}점 득점!
              </div>
            )}

            {/* 3아웃 경고 */}
            {outs >= 3 && (
              <div className="text-red-400 text-sm">
                3아웃! 베이스가 초기화됩니다.
              </div>
            )}

            <button
              onClick={nextTurn}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              {outs >= 3 ? '다음 공격' : '다음 타자'}
            </button>
          </div>
        )}

        {/* 투수 강판 */}
        {phase === 'pitcherDefeated' && currentPitcher && (
          <div className="text-center space-y-4">
            <div className="text-3xl text-yellow-400 font-bold animate-bounce">
              투수 강판!
            </div>
            <div className="text-xl text-white">
              {currentPitcher.name}을(를) 물리쳤습니다!
            </div>
            <div className="space-y-2 text-gray-300">
              <div>획득 포인트: <span className="text-green-400 font-bold">{pitcherPoints}P</span></div>
              <div>목표 달성: <span className="text-blue-400">{currentPitcher.targetPoints}P</span></div>
            </div>

            {pitcherLineup.length > 0 ? (
              <div className="space-y-3">
                <div className="text-gray-400">
                  다음 투수: <span className="text-white font-bold">{pitcherLineup[0].name}</span>
                </div>
                <button
                  onClick={nextPitcher}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  다음 투수 상대하기
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xl text-yellow-400">모든 투수를 물리쳤습니다!</div>
                <button
                  onClick={nextPitcher}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  결과 확인
                </button>
              </div>
            )}
          </div>
        )}

        {/* 상점 */}
        {phase === 'shop' && (
          <Shop onClose={closeShop} />
        )}

        {/* 게임 종료 */}
        {phase === 'gameEnd' && (
          <div className="text-center space-y-4">
            <div className="text-3xl text-yellow-400 font-bold">
              게임 클리어!
            </div>
            <div className="space-y-2">
              <div className="text-2xl text-blue-400">
                최종 득점: {score}점
              </div>
              <div className="text-2xl text-green-400">
                총 포인트: {totalPoints}P
              </div>
              <div className="text-lg text-gray-400">
                강판시킨 투수: {defeatedPitchers.length}명
              </div>
            </div>

            {/* 강판시킨 투수 목록 */}
            {defeatedPitchers.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 mt-4">
                <div className="text-gray-400 text-sm mb-2">강판 기록</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {defeatedPitchers.map((pitcher, idx) => (
                    <div key={pitcher.id} className="bg-gray-700 rounded px-3 py-1 text-sm">
                      {idx + 1}. {pitcher.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                {idx + 1}. {player.revealed ? player.name : '???'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 선수덱 큐 모달 */}
      {showDeckQueue && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-bold">선수덱 순서 (Queue)</h3>
              <button
                onClick={() => setShowDeckQueue(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="text-gray-400 text-sm mb-4">
              덱 앞쪽(먼저 나옴) → 덱 뒤쪽(나중에 나옴)
            </div>

            <div className="flex flex-wrap gap-2">
              {playerDeck.map((player, idx) => (
                <div
                  key={`${player.id}-${idx}`}
                  className={`w-20 h-28 rounded-lg flex flex-col items-center justify-center text-xs
                    ${player.revealed
                      ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white'
                      : 'bg-gradient-to-br from-gray-600 to-gray-800 text-gray-400'
                    }`}
                >
                  <div className="text-[10px] text-gray-300 mb-1">#{idx + 1}</div>
                  {player.revealed ? (
                    <>
                      <div className="text-lg">⚾</div>
                      <div className="font-semibold text-center px-1">{player.name}</div>
                      <div className="text-[10px] opacity-75">
                        타율 {(player.battingAverage * 100).toFixed(0)}%
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl">❓</div>
                      <div className="font-semibold">???</div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 text-gray-500 text-xs">
              * 사용한 적 있는 선수는 순서가 공개됩니다
            </div>

            <button
              onClick={() => setShowDeckQueue(false)}
              className="mt-4 w-full py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 디버그 정보 */}
      <details className="text-gray-500 text-xs">
        <summary className="cursor-pointer">디버그 정보</summary>
        <div className="mt-2 space-y-2">
          <button
            onClick={() => setShowCatalog(true)}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs"
          >
            전체 상점 아이템 보기
          </button>
          <pre className="p-2 bg-gray-900 rounded overflow-auto max-h-48">
            {JSON.stringify({
              phase,
              currentInning,
              outs,
              currentPitcher: currentPitcher?.name,
              pitcherPoints,
              pitcherTarget: currentPitcher?.targetPoints,
              defeatedCount: defeatedPitchers.length,
              remainingPitchers: pitcherLineup.length,
              playerDeckSize: playerDeck.length,
              actionDeckSize: actionDeck.length,
              actionHandSize: actionHand.length,
              selectedCardsCount: selectedActionCards.length,
              batterAvg: selectedPlayer?.battingAverage,
              runnersOnBase: {
                first: bases.first?.name,
                second: bases.second?.name,
                third: bases.third?.name,
              },
            }, null, 2)}
          </pre>
        </div>
      </details>

      {/* 전체 아이템 카탈로그 모달 */}
      {showCatalog && <ItemCatalogModal onClose={() => setShowCatalog(false)} />}
    </div>
  );
}

// 전체 아이템 카탈로그 모달
function ItemCatalogModal({ onClose }: { onClose: () => void }) {
  const allItems = getAllShopItems();
  const [activeTab, setActiveTab] = useState<'coaches' | 'vouchers' | 'upgrades' | 'players'>('coaches');

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">전체 상점 아이템 카탈로그</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-4">
          {(['coaches', 'vouchers', 'upgrades', 'players'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {tab === 'coaches' ? `코치 (${allItems.coaches.length})` :
               tab === 'vouchers' ? `바우처 (${allItems.vouchers.length})` :
               tab === 'upgrades' ? `강화 (${allItems.playerUpgrades.length + allItems.actionUpgrades.length})` :
               `선수 (${Object.values(allItems.players).flat().length})`}
            </button>
          ))}
        </div>

        {/* 코치 */}
        {activeTab === 'coaches' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {allItems.coaches.map(coach => (
              <div key={coach.id} className="bg-orange-900/30 border border-orange-500 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{coach.icon}</span>
                  <span className="font-bold text-white">{coach.name}</span>
                  <span className="ml-auto text-yellow-400 text-sm">{coach.price}G</span>
                </div>
                <div className="text-gray-300 text-sm">{coach.description}</div>
                <div className="text-gray-500 text-xs mt-1">효과: {coach.effectType} +{coach.effectValue}</div>
              </div>
            ))}
          </div>
        )}

        {/* 바우처 */}
        {activeTab === 'vouchers' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {allItems.vouchers.map(voucher => (
              <div key={voucher.id} className="bg-purple-900/30 border border-purple-500 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{voucher.icon}</span>
                  <span className="font-bold text-white">{voucher.name}</span>
                  <span className="ml-auto text-yellow-400 text-sm">{voucher.price}G</span>
                </div>
                <div className="text-gray-300 text-sm">{voucher.description}</div>
                <div className="text-gray-500 text-xs mt-1">효과: {voucher.effectType} +{voucher.effectValue}</div>
              </div>
            ))}
          </div>
        )}

        {/* 강화 */}
        {activeTab === 'upgrades' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-2">선수 강화</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {allItems.playerUpgrades.map(upgrade => (
                  <div key={upgrade.id} className="bg-green-900/30 border border-green-500 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">{upgrade.name}</span>
                      <span className="text-yellow-400 text-sm">{upgrade.price}G</span>
                    </div>
                    <div className="text-gray-300 text-sm">{upgrade.description}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">액션 강화</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {allItems.actionUpgrades.map(upgrade => (
                  <div key={upgrade.id} className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">{upgrade.name}</span>
                      <span className="text-yellow-400 text-sm">{upgrade.price}G</span>
                    </div>
                    <div className="text-gray-300 text-sm">{upgrade.description}</div>
                    {upgrade.targetStat && <div className="text-gray-500 text-xs mt-1">대상: {upgrade.targetStat}</div>}
                    {upgrade.targetMode && <div className="text-gray-500 text-xs mt-1">대상: {upgrade.targetMode}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 선수 */}
        {activeTab === 'players' && (
          <div className="space-y-4">
            {(['legendary', 'epic', 'rare', 'common'] as const).map(rarity => (
              <div key={rarity}>
                <h3 className={`font-semibold mb-2 ${
                  rarity === 'legendary' ? 'text-yellow-400' :
                  rarity === 'epic' ? 'text-purple-400' :
                  rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {rarity === 'legendary' ? '전설' : rarity === 'epic' ? '영웅' : rarity === 'rare' ? '희귀' : '일반'}
                  ({allItems.players[rarity].length}명)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {allItems.players[rarity].map(player => (
                    <div key={player.id} className={`rounded-lg p-2 text-xs ${
                      rarity === 'legendary' ? 'bg-yellow-900/30 border border-yellow-500' :
                      rarity === 'epic' ? 'bg-purple-900/30 border border-purple-500' :
                      rarity === 'rare' ? 'bg-blue-900/30 border border-blue-500' :
                      'bg-gray-700 border border-gray-600'
                    }`}>
                      <div className="font-bold text-white">{player.name}</div>
                      <div className="text-gray-400">
                        타율 {(player.battingAverage * 100).toFixed(0)}% | P{player.power} | S{player.speed}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {player.tags.map(tag => (
                          <span key={tag} className="text-[10px]">
                            {tag === 'speed' ? '👟' : tag === 'power' ? '💪' : tag === 'contact' ? '🎯' : '👀'}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
