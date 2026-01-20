import { Pitcher } from '../game/types';

interface ScoreBoardProps {
  currentInning: number;
  currentPitcher: Pitcher | null;
  pitcherPoints: number;   // 현재 투수에게 획득한 포인트
  score: number;           // 야구 득점
  totalPoints: number;     // 총 포인트
  gold: number;            // 상점 재화
  outs: number;
  discardsRemaining: number;
}

export function ScoreBoard({
  currentInning,
  currentPitcher,
  pitcherPoints,
  score,
  totalPoints,
  gold,
  outs,
  discardsRemaining
}: ScoreBoardProps) {
  const targetPoints = currentPitcher?.targetPoints ?? 0;
  const progress = targetPoints > 0 ? Math.min((pitcherPoints / targetPoints) * 100, 100) : 0;
  const isNearDefeat = progress >= 80;

  return (
    <div className="bg-gray-900 rounded-xl p-4 text-white shadow-lg">
      {/* 투수 정보 */}
      {currentPitcher && (
        <div className="mb-4 pb-3 border-b border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚾</span>
              <div>
                <div className="font-bold text-lg">{currentPitcher.name}</div>
                <div className="text-gray-400 text-xs">{currentPitcher.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-xs">강판까지</div>
              <div className={`font-bold ${isNearDefeat ? 'text-yellow-400' : 'text-white'}`}>
                {pitcherPoints} / {targetPoints}P
              </div>
            </div>
          </div>

          {/* 진행 바 */}
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isNearDefeat
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-blue-500 to-blue-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {isNearDefeat && (
            <div className="text-yellow-400 text-xs mt-1 animate-pulse">
              강판 임박!
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-5 gap-2 sm:gap-4 text-center">
        {/* 이닝 */}
        <div>
          <div className="text-gray-400 text-xs sm:text-sm">이닝</div>
          <div className="text-xl sm:text-3xl font-bold text-yellow-400">
            {currentInning}
          </div>
        </div>

        {/* 득점 */}
        <div>
          <div className="text-gray-400 text-xs sm:text-sm">득점</div>
          <div className="text-xl sm:text-3xl font-bold text-blue-400">{score}</div>
        </div>

        {/* 총 포인트 */}
        <div>
          <div className="text-gray-400 text-xs sm:text-sm">포인트</div>
          <div className="text-xl sm:text-3xl font-bold text-green-400">{totalPoints}P</div>
        </div>

        {/* 골드 */}
        <div>
          <div className="text-gray-400 text-xs sm:text-sm">골드</div>
          <div className="text-xl sm:text-3xl font-bold text-yellow-500">{gold}G</div>
        </div>

        {/* 아웃카운트 */}
        <div>
          <div className="text-gray-400 text-xs sm:text-sm">아웃</div>
          <div className="flex justify-center gap-1 mt-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 ${
                  i < outs
                    ? 'bg-red-500 border-red-400'
                    : 'bg-transparent border-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 버리기 횟수 */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <span className="text-gray-400 text-sm">버리기: </span>
        <span className="text-blue-400 font-bold">{discardsRemaining}회</span>
        <span className="text-gray-500 text-sm"> 남음</span>
      </div>
    </div>
  );
}

// 투수 라인업 컴포넌트 (분리)
interface PitcherLineupProps {
  defeatedPitchers: Pitcher[];
  currentPitcher: Pitcher | null;
  remainingPitchers: Pitcher[];
}

export function PitcherLineup({ defeatedPitchers, currentPitcher, remainingPitchers }: PitcherLineupProps) {
  const totalPitchers = defeatedPitchers.length + (currentPitcher ? 1 : 0) + remainingPitchers.length;

  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="text-gray-400 text-xs mb-2">
        투수 라인업 ({defeatedPitchers.length + (currentPitcher ? 1 : 0)}/{totalPitchers})
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {/* 강판된 투수들 */}
        {defeatedPitchers.map((pitcher) => (
          <div
            key={pitcher.id}
            className="flex-shrink-0 w-16 h-20 rounded-lg bg-gray-700/50 flex flex-col items-center justify-center text-xs border border-green-500/50"
          >
            <div className="text-green-400 text-lg">✓</div>
            <div className="text-gray-400 text-[10px] text-center px-1 truncate w-full">{pitcher.name}</div>
            <div className="text-green-400 text-[10px]">{pitcher.targetPoints}P</div>
          </div>
        ))}

        {/* 현재 투수 */}
        {currentPitcher && (
          <div className="flex-shrink-0 w-16 h-20 rounded-lg bg-gradient-to-br from-yellow-600/30 to-orange-600/30 flex flex-col items-center justify-center text-xs border-2 border-yellow-500">
            <div className="text-yellow-400 text-lg">⚾</div>
            <div className="text-white text-[10px] text-center px-1 truncate w-full font-bold">{currentPitcher.name}</div>
            <div className="text-yellow-400 text-[10px]">{currentPitcher.targetPoints}P</div>
          </div>
        )}

        {/* 대기 중인 투수들 */}
        {remainingPitchers.map((pitcher) => (
          <div
            key={pitcher.id}
            className="flex-shrink-0 w-16 h-20 rounded-lg bg-gray-800 flex flex-col items-center justify-center text-xs border border-gray-600"
          >
            <div className="text-gray-500 text-lg">?</div>
            <div className="text-gray-500 text-[10px] text-center px-1 truncate w-full">{pitcher.name}</div>
            <div className="text-gray-500 text-[10px]">{pitcher.targetPoints}P</div>
          </div>
        ))}
      </div>
    </div>
  );
}
